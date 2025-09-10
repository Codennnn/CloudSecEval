import { Injectable, Logger } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { omit } from 'radash'

import type { License, Prisma } from '#prisma/client'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { SortOrder } from '~/common/search/interfaces/search.interface'
import { MailService } from '~/modules/mail/mail.service'

import { BaseLicenseDto } from './dto/base-license.dto'
import { CheckLicenseDto, CheckUserLicenseWithIpDto } from './dto/check-license.dto'
import { CreateLicenseDto } from './dto/create-license.dto'
import { FindLicensesDto } from './dto/find-licenses.dto'
import { ToggleLockLicenseDto } from './dto/toggle-lock-license.dto'
import { UpdateLicenseDto } from './dto/update-license.dto'
import { LicenseRepository } from './license.repository'
import { generateUniqueLicenseCode } from './utils/license-generator.util'

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name)

  /** 风控配置 */
  private readonly RISK_CONFIG = {
    /** 风险访问警告阈值（24小时内） */
    WARNING_THRESHOLD: 3,
    /** 锁定阈值（累计警告次数） */
    LOCK_THRESHOLD: 5,
  }

  constructor(
    private readonly licenseRepository: LicenseRepository,
    private readonly mailService: MailService,
  ) {}

  /**
   * 创建授权码
   * 根据提供的用户信息创建新的授权码并发送邮件通知
   */
  async createLicense(createLicenseData: CreateLicenseDto) {
    try {
      const { email, remark, purchaseAmount, expiresAt } = createLicenseData

      // 验证过期时间（如果提供）
      let expirationDate: Date | undefined

      if (expiresAt) {
        expirationDate = new Date(expiresAt)
        const now = new Date()

        if (expirationDate <= now) {
          this.logger.warn('创建授权码失败 - 过期时间无效', {
            email,
            providedExpiresAt: expiresAt,
            parsedExpirationDate: expirationDate.toISOString(),
            currentTime: now.toISOString(),
            operation: 'createLicense',
          })

          throw BusinessException.badRequest(
            BUSINESS_CODES.INVALID_PARAMETER,
            '过期时间必须大于当前时间',
          )
        }
      }

      const licenseCode = await this.generateUniqueLicenseCode()

      const newLicense = await this.licenseRepository.create({
        code: licenseCode,
        email,
        purchaseAmount,
        remark,
        expiresAt: expirationDate,
      })

      const mailResult = await this.mailService.sendLicenseCode(email, licenseCode)

      if (!mailResult.success) {
        // 邮件发送失败后，删除已创建的授权码记录
        // 使用具体的授权码ID删除，而不是删除邮箱下的所有授权码
        await this.licenseRepository.deleteById(newLicense.id)

        this.logger.error('授权码邮件发送失败，已回滚授权码记录', {
          email,
          licenseCode,
          licenseId: newLicense.id,
          error: mailResult.error,
          operation: 'createLicense',
        })

        throw BusinessException.internalServerError(
          BUSINESS_CODES.INTERNAL_SERVER_ERROR,
          `授权码发放失败：邮件发送失败 - ${mailResult.error}`,
        )
      }

      this.logger.log('授权码创建成功', {
        email,
        licenseCode,
        remark,
        purchaseAmount,
        expiresAt: expirationDate?.toISOString() ?? 'permanent',
        messageId: mailResult.messageId,
        operation: 'createLicense',
      })

      return {
        code: licenseCode,
        messageId: mailResult.messageId,
      }
    }
    catch (err) {
      this.logger.error('创建授权码异常', {
        email: createLicenseData.email,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        operation: 'createLicense',
      })

      throw BusinessException.internalServerError(
        BUSINESS_CODES.INTERNAL_SERVER_ERROR,
        '授权码发放失败，请稍后重试',
      )
    }
  }

  async checkLicense({ email, code, ip }: CheckUserLicenseWithIpDto) {
    try {
      const license = await this.licenseRepository.findByEmailAndCode(email, code)

      if (!license) {
        return {
          authorized: false,
          isRisky: false,
          message: '授权码无效或不匹配',
        }
      }

      // 检查是否被锁定
      if (license.locked) {
        return {
          authorized: false,
          isRisky: false,
          message: '授权码已被锁定，请联系客服',
        }
      }

      // 首次使用授权码时，标记为已使用
      if (!license.isUsed) {
        await this.licenseRepository.update(license.id, { isUsed: true })
      }

      // 检查是否已过期
      if (license.expiresAt && new Date() > license.expiresAt) {
        // 如果尚未标记为过期，更新状态
        if (!license.isExpired) {
          await this.licenseRepository.markAsExpired(license.id)
          this.logger.log(`授权码已过期并标记: ${email}, 过期时间: ${license.expiresAt.toISOString()}`)
        }

        return {
          authorized: false,
          isRisky: false,
          message: '授权码已过期，请续费或联系客服',
        }
      }

      // 检查是否已被标记为过期
      if (license.isExpired) {
        return {
          authorized: false,
          isRisky: false,
          message: '授权码已过期，请续费或联系客服',
        }
      }

      // IP 风控检查
      const isRisky = await this.checkIPRisk(plainToInstance(BaseLicenseDto, license), ip)
      let warning: string | undefined

      if (isRisky) {
        // 更新警告次数
        const updatedLicense = await this.licenseRepository.update(license.id, {
          warningCount: license.warningCount + 1,
          lastIP: ip,
        })

        // 发送安全警告邮件
        const warningMailResult = await this.mailService.sendSecurityWarning(email, ip)

        if (warningMailResult.success) {
          this.logger.log(`安全警告邮件发送成功: ${email}, IP: ${ip}`)
          warning = `检测到来自新IP的访问: ${ip}，已发送安全提醒邮件`
        }
        else {
          this.logger.warn(`安全警告邮件发送失败: ${email}, 错误: ${warningMailResult.error}`)
          warning = `检测到来自新IP的访问: ${ip}，邮件发送失败`
        }

        // 检查是否需要锁定
        if (updatedLicense.warningCount >= this.RISK_CONFIG.LOCK_THRESHOLD) {
          await this.licenseRepository.update(license.id, { locked: true })

          // 发送账户锁定邮件
          const lockMailResult = await this.mailService.sendAccountLock(email, '检测到异常访问行为')

          if (lockMailResult.success) {
            this.logger.log(`账户锁定邮件发送成功: ${email}`)
          }
          else {
            this.logger.warn(`账户锁定邮件发送失败: ${email}, 错误: ${lockMailResult.error}`)
          }

          return {
            authorized: false,
            isRisky: true,
            message: '检测到异常访问行为，授权码已被锁定',
          }
        }
      }
      else {
        // 正常访问，更新IP
        await this.licenseRepository.update(license.id, {
          lastIP: ip,
        })
      }

      // 记录访问日志
      await this.licenseRepository.createAccessLog({
        licenseId: license.id,
        email,
        ip,
        isRisky,
      })

      this.logger.log(`授权验证成功: ${email}, IP: ${ip}, 风险: ${isRisky}`)

      return {
        authorized: true,
        isRisky,
        message: '授权验证成功',
        warning,
      }
    }
    catch (err) {
      this.logger.error(`授权验证失败: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined)

      return {
        authorized: false,
        isRisky: false,
        message: '授权验证失败，请稍后重试',
      }
    }
  }

  /**
   * 管理员测试授权码有效性
   * 支持通过 ID / 邮箱+授权码查询
   */
  async adminCheckLicense({ id, email, code }: CheckLicenseDto) {
    try {
      let license

      // ID优先级最高
      if (id) {
        license = await this.licenseRepository.findById(id)

        if (!license) {
          return {
            valid: false,
            message: '授权码不存在',
          }
        }
      }
      // 使用邮箱和授权码查询
      else if (email && code) {
        license = await this.licenseRepository.findByEmailAndCode(email, code)

        if (!license) {
          return {
            valid: false,
            message: '授权码无效或不匹配',
          }
        }
      }
      // 参数不足
      else {
        return {
          valid: false,
          message: '请提供授权码ID或邮箱+授权码',
        }
      }

      // 检查是否已过期
      const hasExpired = license.isExpired
      const timeExpired = license.expiresAt && new Date() > license.expiresAt
      const isExpired = hasExpired || Boolean(timeExpired)

      // 返回详细状态信息
      return {
        valid: !license.locked && !isExpired,
        message: this.getAdminCheckMessage(plainToInstance(BaseLicenseDto, license), isExpired),
        details: {
          isUsed: Boolean(license.isUsed),
          locked: Boolean(license.locked),
          expired: Boolean(isExpired),
          expiresAt: license.expiresAt,
        },
      }
    }
    catch (err) {
      this.logger.error(`管理员授权码测试失败: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined)

      return {
        valid: false,
        message: '授权码测试失败，请稍后重试',
      }
    }
  }

  private getAdminCheckMessage(license: BaseLicenseDto, isExpired: boolean): string {
    if (license.locked) {
      return '授权码已被锁定'
    }

    if (isExpired) {
      return '授权码已过期'
    }

    if (!license.isUsed) {
      return '授权码有效且尚未使用'
    }

    return '授权码有效且已使用'
  }

  async logAccess(
    email: string,
    code: string,
    ip: string,
    pagePath?: string,
  ) {
    try {
      const license = await this.licenseRepository.findByEmailAndCode(email, code)

      if (!license) {
        return {
          success: false,
          message: '授权码无效',
        }
      }

      await this.licenseRepository.createAccessLog({
        licenseId: license.id,
        email,
        ip,
        isRisky: false, // 此处记录的是已通过验证的正常访问
      })

      this.logger.log(`访问日志记录成功: ${email}, 页面: ${pagePath ?? '未指定'}`)

      return {
        success: true,
        message: '访问日志记录成功',
      }
    }
    catch (err) {
      this.logger.error(`访问日志记录失败: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined)

      return {
        success: false,
        message: '访问日志记录失败',
      }
    }
  }

  /**
   * 生成唯一授权码
   * @returns 唯一的授权码
   */
  private async generateUniqueLicenseCode(): Promise<string> {
    const checker = async (code: string): Promise<boolean> => {
      const existing = await this.licenseRepository.findByCode(code)

      return !!existing // 返回 true 表示已存在
    }

    return generateUniqueLicenseCode(checker)
  }

  getLicenseList(searchDto: FindLicensesDto) {
    return this.licenseRepository.findWithAdvancedSearch(searchDto)
  }

  async getLicenseById(id: string) {
    try {
      // 查找授权码
      const license = await this.licenseRepository.findById(id)

      if (!license) {
        throw BusinessException.notFound(
          BUSINESS_CODES.NOT_FOUND,
          '授权码不存在',
        )
      }

      // 获取统计信息
      const stats = await this.licenseRepository.getLicenseStats(id)
      const riskLevel = this.calculateRiskLevel(plainToInstance(BaseLicenseDto, license), {
        recentRiskyAccesses: stats.recentRiskyAccesses,
        commonIPs: stats.commonIPs,
      })

      // 格式化响应数据
      const licenseData = {
        ...license,
        // 添加计算属性
        stats: {
          totalAccesses: stats.totalAccesses,
          commonIPs: stats.commonIPs,
          recentRiskyAccesses: stats.recentRiskyAccesses,
          lastAccessTime: stats.lastAccessTime,
          riskLevel,
          isRisky: riskLevel !== 'safe',
        },
      }

      return licenseData
    }
    catch (err) {
      if (err instanceof BusinessException) {
        throw err
      }

      this.logger.error(`获取授权码详情失败: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined)

      throw BusinessException.internalServerError(
        BUSINESS_CODES.INTERNAL_SERVER_ERROR,
        '获取授权码详情失败，请稍后重试',
      )
    }
  }

  /**
   * 更新授权码信息
   * 根据授权码 ID 更新授权码的详细信息
   * @param updateLicenseData 包含 ID 和更新数据的完整信息
   * @returns 更新结果
   */
  async updateLicense(id: License['id'], updateData: UpdateLicenseDto) {
    try {
      // 检查授权码是否存在
      const existingLicense = await this.licenseRepository.findById(id)

      if (!existingLicense) {
        throw BusinessException.notFound(
          BUSINESS_CODES.NOT_FOUND,
          '授权码不存在',
        )
      }

      // 验证过期时间（如果提供）
      let expirationDate: Date | undefined

      if (updateData.expiresAt) {
        expirationDate = new Date(updateData.expiresAt)
        const now = new Date()

        if (expirationDate <= now) {
          this.logger.warn('更新授权码失败 - 过期时间无效', {
            id,
            email: existingLicense.email,
            providedExpiresAt: updateData.expiresAt,
            parsedExpirationDate: expirationDate.toISOString(),
            currentTime: now.toISOString(),
            operation: 'updateLicense',
          })

          throw BusinessException.badRequest(
            BUSINESS_CODES.INVALID_PARAMETER,
            '过期时间必须大于当前时间',
          )
        }
      }

      const updatePayload: Prisma.LicenseUpdateInput = {
        ...omit(updateData, ['expiresAt']),
        expiresAt: expirationDate,
      }

      const updatedLicense = await this.licenseRepository.update(
        id,
        updatePayload,
      )

      this.logger.log('授权码更新成功', {
        id,
        email: updatedLicense.email,
        updateFields: Object.keys(updatePayload),
        operation: 'updateLicense',
      })

      return updatedLicense
    }
    catch (err) {
      if (err instanceof BusinessException) {
        throw err
      }

      this.logger.error(`更新授权码失败: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined)

      throw BusinessException.internalServerError(
        BUSINESS_CODES.INTERNAL_SERVER_ERROR,
        '更新授权码失败，请稍后重试',
      )
    }
  }

  async deleteLicenseById(id: string) {
    try {
      // 检查授权码是否存在
      const existingLicense = await this.licenseRepository.findById(id)

      if (!existingLicense) {
        throw BusinessException.notFound(
          BUSINESS_CODES.NOT_FOUND,
          '授权码不存在',
        )
      }

      // 删除授权码
      const deletedCount = await this.licenseRepository.deleteById(id)

      this.logger.log(`管理员删除授权码成功: ID=${id}, email=${existingLicense.email}`)

      return { deleted: deletedCount > 0 }
    }
    catch (err: unknown) {
      if (err instanceof BusinessException) {
        throw err
      }

      throw BusinessException.internalServerError(
        BUSINESS_CODES.INTERNAL_SERVER_ERROR,
        '删除授权码失败，请稍后重试',
      )
    }
  }

  /**
   * 锁定/解锁授权码
   * 管理员可以手动锁定或解锁授权码
   */
  async toggleLockLicense({ id, locked }: ToggleLockLicenseDto) {
    try {
      const existingLicense = await this.licenseRepository.findById(id)

      if (!existingLicense) {
        throw BusinessException.notFound(
          BUSINESS_CODES.NOT_FOUND,
          '授权码不存在',
        )
      }

      const updateResult = await this.licenseRepository.update(id, { locked })

      return {
        locked: updateResult.locked,
      }
    }
    catch (err) {
      if (err instanceof BusinessException) {
        throw err
      }

      this.logger.error(`授权码状态更新失败: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined)

      throw BusinessException.internalServerError(
        BUSINESS_CODES.INTERNAL_SERVER_ERROR,
        '授权码状态更新失败，请稍后重试',
      )
    }
  }

  /**
   * 计算风控等级
   * @param license 授权码记录
   * @param stats 统计信息
   * @returns 风控等级
   */
  private calculateRiskLevel(
    license: BaseLicenseDto,
    stats: { recentRiskyAccesses: number, commonIPs: string[] },
  ): 'safe' | 'low' | 'medium' | 'high' {
    // 如果已锁定，直接返回高风险
    if (license.locked) {
      return 'high'
    }

    // 根据警告次数和最近风险访问判断风险等级
    const { warningCount = 0 } = license
    const { recentRiskyAccesses, commonIPs } = stats

    // 高风险：警告次数≥5或最近风险访问≥5
    if (warningCount >= 5 || recentRiskyAccesses >= 5) {
      return 'high'
    }

    // 中风险：警告次数3-4或最近风险访问3-4或IP变化频繁
    if (warningCount >= 3 || recentRiskyAccesses >= 3 || commonIPs.length >= 3) {
      return 'medium'
    }

    // 低风险：警告次数1-2或最近风险访问1-2
    if (warningCount >= 1 || recentRiskyAccesses >= 1) {
      return 'low'
    }

    // 安全：无警告无风险访问
    return 'safe'
  }

  /**
   * 检查IP风险
   * @param license 授权码记录
   * @param currentIP 当前 IP
   * @returns 是否为风险访问
   */
  private async checkIPRisk(license: BaseLicenseDto, currentIP: string): Promise<boolean> {
    // 首次访问，记录 IP
    if (!license.lastIP) {
      return false
    }

    // IP地址发生变化
    if (license.lastIP !== currentIP) {
      // 检查最近的风险访问次数
      const recentRiskyCount = await this.licenseRepository.getRecentRiskyCount(license.id)

      // 如果 24 小时内已有多次风险访问，则认为此次也是风险访问
      return recentRiskyCount >= this.RISK_CONFIG.WARNING_THRESHOLD
    }

    return false
  }

  /**
   * 批量检查并标记过期授权码
   * @returns 标记为过期的授权码数量
   */
  async markExpiredLicenses(): Promise<number> {
    try {
      const count = await this.licenseRepository.markExpiredLicensesBatch()

      if (count > 0) {
        this.logger.log(`批量标记过期授权码完成，共标记 ${count} 个授权码`)
      }

      return count
    }
    catch (err) {
      this.logger.error(`批量标记过期授权码失败: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined)

      return 0
    }
  }

  /**
   * 发送过期提醒
   * @param days 提前多少天提醒
   */
  async sendExpirationReminders(days = 7) {
    try {
      // 查询即将过期的授权码
      const now = new Date()
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

      // 使用高级搜索查询即将过期的授权码
      const searchDto = new FindLicensesDto()
      searchDto.expiresAt = {
        gte: now,
        lte: futureDate,
      }
      searchDto.isExpired = { eq: false }
      searchDto.locked = { eq: false }
      searchDto.pageSize = 1000 // 足够大的数量
      searchDto.sortBy = 'expiresAt'
      searchDto.sortOrder = SortOrder.ASC

      const result = await this.licenseRepository.findWithAdvancedSearch(searchDto)
      const licenses = result.licenses.map((license) => license)

      if (licenses.length === 0) {
        this.logger.log(`没有需要发送 ${days} 天过期提醒的授权码`)

        return { sent: 0, failed: 0, errors: [] }
      }

      let sentCount = 0
      const errors: string[] = []

      for (const license of licenses) {
        try {
          if (!license.expiresAt) {
            continue // 永久授权码不需要发送提醒
          }

          const timeRemaining = {
            days: 0,
            hours: 0,
            minutes: 0,
            isExpired: false,
          }

          if (timeRemaining.isExpired) {
            continue // 已过期的不发送提醒
          }

          // 发送过期提醒邮件
          const mailResult = await this.mailService.sendExpirationReminder(
            license.email,
            license.code,
            license.expiresAt,
            timeRemaining.days,
          )

          if (mailResult.success) {
            this.logger.log(`发送过期提醒成功: ${license.email}, 授权码: ${license.code}, 剩余${timeRemaining.days}天, 消息ID: ${mailResult.messageId}`)
            sentCount++
          }
          else {
            const errorMsg = `发送过期提醒失败: ${license.email} - ${mailResult.error}`
            this.logger.error(errorMsg)
            errors.push(errorMsg)
          }
        }
        catch (mailError) {
          const errorMsg = `发送过期提醒异常: ${license.email} - ${mailError instanceof Error ? mailError.message : String(mailError)}`
          this.logger.error(errorMsg)
          errors.push(errorMsg)
        }
      }

      this.logger.log(`过期提醒发送完成：成功 ${sentCount} 个，失败 ${errors.length} 个`)

      return {
        sent: sentCount,
        failed: errors.length,
        errors,
      }
    }
    catch (err) {
      this.logger.error(`发送过期提醒失败: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined)

      throw BusinessException.internalServerError(
        BUSINESS_CODES.INTERNAL_SERVER_ERROR,
        '发送过期提醒失败，请稍后重试',
      )
    }
  }
}
