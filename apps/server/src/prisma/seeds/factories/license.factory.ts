import { faker } from '@faker-js/faker'
import { Decimal } from '@prisma/client/runtime/library'
import { consola } from 'consola'

import type { License } from '#prisma/client'
import { generateLicenseCode, validateLicenseCodeFormat } from '~/modules/license/utils/license-generator.util'

import { BaseFactory } from '../core/base-factory'

/**
 * 授权码数据工厂 - 生成高质量的测试授权码数据
 * 特点：
 * - 支持多段授权码格式验证（如 ABCD-EFGH-IJKL-MNOP-Q）
 * - 智能的过期状态计算
 * - 真实的购买金额分布
 * - 完整的数据关联验证
 */
export class LicenseFactory extends BaseFactory<License> {
  // 授权码格式验证（支持多段格式）
  private validateCodeFormat(code: string): boolean {
    return validateLicenseCodeFormat(code)
  }

  /**
   * 生成单个授权码数据
   */
  protected async generateSingle(overrides: Partial<License> = {}): Promise<License> {
    // 确保数据库连接正常
    await this.checkDatabaseConnection()

    // 生成唯一授权码
    const code = overrides.code ?? await this.generateUniqueCode()

    // 生成唯一邮箱
    const email = overrides.email ?? await this.generateUniqueEmail()

    // 生成过期时间
    const expiresAt = overrides.expiresAt !== undefined
      ? overrides.expiresAt
      : this.generateExpirationDate()

    // 计算是否已过期
    const isExpired = expiresAt ? expiresAt < new Date() : false

    // 构建授权码数据
    const licenseData = {
      email,
      code,
      isUsed: overrides.isUsed ?? this.generateUsedStatus(),
      lastIP: overrides.lastIP ?? this.generateLastIP(),
      locked: overrides.locked ?? this.generateLockedStatus(),
      warningCount: overrides.warningCount ?? this.generateWarningCount(),
      purchaseAmount: overrides.purchaseAmount ?? new Decimal(this.generatePurchaseAmount()),
      expiresAt,
      isExpired,
      remark: overrides.remark ?? this.generateRemark(),
    }

    // 使用事务创建授权码
    return await this.withTransaction(async (tx) => {
      return await tx.license.create({
        data: licenseData,
      })
    })
  }

  /**
   * 验证授权码数据完整性
   */
  protected async validateData(license: License): Promise<boolean> {
    try {
      // 检查必需字段
      if (!license.id || !license.email || !license.code) {
        consola.error('授权码缺少必需字段', {
          licenseId: license.id,
          email: license.email,
          code: license.code,
        })

        return false
      }

      // 检查授权码格式
      if (!this.validateCodeFormat(license.code)) {
        consola.error('授权码格式无效', { code: license.code })

        return false
      }

      // 检查邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailRegex.test(license.email)) {
        consola.error('授权码邮箱格式无效', { email: license.email })

        return false
      }

      // 检查购买金额范围
      if (
        license.purchaseAmount
        && (license.purchaseAmount.lessThan(0) || license.purchaseAmount.greaterThan(9999.99))
      ) {
        consola.error('购买金额超出范围', {
          purchaseAmount: license.purchaseAmount,
          licenseId: license.id,
        })

        return false
      }

      // 检查过期状态一致性
      const shouldBeExpired = license.expiresAt && license.expiresAt < new Date()

      if (Boolean(shouldBeExpired) !== license.isExpired) {
        consola.error('过期状态不一致', {
          licenseId: license.id,
          expiresAt: license.expiresAt,
          isExpired: license.isExpired,
          shouldBeExpired,
        })

        return false
      }

      // 验证数据库中的唯一性（只检查 code 的唯一性，email 可以重复）
      const existingByCode = await this.prisma.license.findUnique({
        where: { code: license.code },
        select: { id: true },
      })

      if (existingByCode && existingByCode.id !== license.id) {
        consola.error('授权码重复', { code: license.code })

        return false
      }

      return true
    }
    catch (error) {
      consola.error('授权码数据验证失败', error)

      return false
    }
  }

  /**
   * 创建预设授权码类型
   */
  async createPresetLicenses(): Promise<License[]> {
    consola.info('创建预设测试授权码...')

    const presetConfigs = [
      {
        email: 'license.active@example.com',
        code: 'act-001-ive',
        isUsed: true,
        locked: false,
        purchaseAmount: new Decimal(99.99),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
        remark: '活跃正常授权码',
      },
      {
        email: 'license.expired@example.com',
        code: 'exp-002-ire',
        isUsed: true,
        locked: false,
        purchaseAmount: new Decimal(199.99),
        expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前过期
        remark: '已过期授权码',
      },
      {
        email: 'license.locked@example.com',
        code: 'loc-003-ked',
        isUsed: true,
        locked: true,
        warningCount: 3,
        purchaseAmount: new Decimal(299.99),
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180天后过期
        remark: '被锁定的授权码',
      },
      {
        email: 'license.unused@example.com',
        code: 'unu-004-sed',
        isUsed: false,
        locked: false,
        purchaseAmount: new Decimal(49.99),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90天后过期
        remark: '未使用授权码',
      },
      {
        email: 'license.permanent@example.com',
        code: 'per-005-man',
        isUsed: true,
        locked: false,
        purchaseAmount: new Decimal(999.99),
        expiresAt: null, // 永久授权
        remark: '永久授权码',
      },
      {
        email: 'license.high-warning@example.com',
        code: 'war-006-ing',
        isUsed: true,
        locked: false,
        warningCount: 2,
        purchaseAmount: new Decimal(199.99),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天后过期
        remark: '高警告次数授权码',
      },
    ]

    const licenses: License[] = []

    for (const config of presetConfigs) {
      try {
        // 检查是否已存在（通过邮箱和授权码组合检查）
        const existingLicense = await this.prisma.license.findFirst({
          where: {
            email: config.email,
            code: config.code,
          },
        })

        if (existingLicense) {
          consola.warn(`预设授权码 ${config.email} (${config.code}) 已存在，跳过创建`)
          licenses.push(existingLicense)
          continue
        }

        // 创建新授权码
        const license = await this.generateSingle(config)
        licenses.push(license)
        consola.debug(`创建预设授权码: ${config.email}`)
      }
      catch (error) {
        consola.error(`创建预设授权码 ${config.email} 失败:`, error)
      }
    }

    consola.success(`预设授权码创建完成，成功: ${licenses.length}/${presetConfigs.length}`)

    return licenses
  }

  /**
   * 增量创建授权码
   */
  async ensureMinimumLicenses(minimumCount: number): Promise<License[]> {
    const currentCount = await this.prisma.license.count()
    const needed = Math.max(0, minimumCount - currentCount)

    if (needed === 0) {
      consola.info(`当前已有 ${currentCount} 个授权码，无需创建更多`)

      return []
    }

    consola.info(`当前 ${currentCount} 个授权码，需要创建 ${needed} 个授权码达到最小数量 ${minimumCount}`)

    return await this.createBatch(needed)
  }

  /**
   * 生成唯一授权码
   */
  private async generateUniqueCode(): Promise<string> {
    return await this.generateUniqueValue(
      () => this.generateCodeFormat(),
      async (code) => {
        const existing = await this.prisma.license.findUnique({
          where: { code },
          select: { id: true },
        })

        return !!existing
      },
    )
  }

  /**
   * 生成邮箱（不再要求唯一性）
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async generateUniqueEmail(): Promise<string> {
    // 由于邮箱可以重复，直接返回生成的邮箱
    return faker.internet.email()
  }

  /**
   * 生成授权码格式：支持多段格式
   */
  private generateCodeFormat(): string {
    // 使用新的授权码生成工具，支持多种格式
    return generateLicenseCode()
  }

  /**
   * 生成使用状态（60% 已使用）
   */
  private generateUsedStatus(): boolean {
    return Math.random() > 0.4
  }

  /**
   * 生成锁定状态（10% 被锁定）
   */
  private generateLockedStatus(): boolean {
    return Math.random() < 0.1
  }

  /**
   * 生成警告次数（0-3次，权重分布）
   */
  private generateWarningCount(): number {
    const random = Math.random()

    if (random < 0.7) {
      return 0
    } // 70% 无警告

    if (random < 0.9) {
      return 1
    } // 20% 一次警告

    if (random < 0.97) {
      return 2
    } // 7% 两次警告

    return 3 // 3% 三次警告
  }

  /**
   * 生成购买金额（真实分布）
   */
  private generatePurchaseAmount(): number {
    const random = Math.random()

    if (random < 0.3) {
      // 30% 低价位：9.9-49.9
      return Number((9.9 + Math.random() * 40).toFixed(2))
    }
    else if (random < 0.7) {
      // 40% 中价位：50-199.9
      return Number((50 + Math.random() * 149.9).toFixed(2))
    }
    else if (random < 0.95) {
      // 25% 高价位：200-499.9
      return Number((200 + Math.random() * 299.9).toFixed(2))
    }
    else {
      // 5% 超高价位：500-999.9
      return Number((500 + Math.random() * 499.9).toFixed(2))
    }
  }

  /**
   * 生成过期时间（30% 永久，40% 未来，30% 过去）
   */
  private generateExpirationDate(): Date | null {
    const random = Math.random()

    if (random < 0.3) {
      // 30% 永久授权
      return null
    }
    else if (random < 0.7) {
      // 40% 未来过期时间（30天到2年）
      const daysFromNow = 30 + Math.random() * (730 - 30) // 30天到2年

      return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
    }
    else {
      // 30% 已过期（1天到365天前）
      const daysAgo = 1 + Math.random() * 364 // 1天到365天前

      return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    }
  }

  /**
   * 生成最近使用IP
   */
  private generateLastIP(): string | null {
    // 80% 概率有最近使用IP
    if (Math.random() < 0.2) {
      return null
    }

    return faker.internet.ip()
  }

  /**
   * 生成备注信息
   */
  private generateRemark(): string | null {
    // 60% 概率没有备注
    if (Math.random() < 0.6) {
      return null
    }

    const remarks = [
      '企业客户',
      '个人用户',
      '批量购买',
      '试用转正式',
      '推荐客户',
      '老客户续费',
      '活动优惠',
      '特价促销',
      '内部测试',
      '合作伙伴',
    ]

    return remarks[Math.floor(Math.random() * remarks.length)]
  }

  /**
   * 获取授权码统计信息
   */
  async getStats(): Promise<{
    total: number
    used: number
    active: number
    expired: number
    locked: number
    permanent: number
    averagePurchaseAmount: number
    warningDistribution: Record<number, number>
  }> {
    const [
      total,
      used,
      expired,
      locked,
      permanent,
      avgAmount,
      warningCounts,
    ] = await Promise.all([
      this.prisma.license.count(),
      this.prisma.license.count({ where: { isUsed: true } }),
      this.prisma.license.count({ where: { isExpired: true } }),
      this.prisma.license.count({ where: { locked: true } }),
      this.prisma.license.count({ where: { expiresAt: null } }),
      this.prisma.license.aggregate({
        _avg: { purchaseAmount: true },
        where: { purchaseAmount: { not: null } },
      }),
      this.prisma.license.groupBy({
        by: ['warningCount'],
        _count: true,
      }),
    ])

    const active = total - expired - locked

    // 构建警告次数分布
    const warningDistribution: Record<number, number> = {}
    warningCounts.forEach(({ warningCount, _count }) => {
      warningDistribution[warningCount] = _count
    })

    return {
      total,
      used,
      active,
      expired,
      locked,
      permanent,
      averagePurchaseAmount: Number(avgAmount._avg.purchaseAmount) || 0,
      warningDistribution,
    }
  }

  /**
   * 更新过期状态（修复数据不一致）
   */
  async updateExpiredStatus(): Promise<number> {
    const now = new Date()

    const result = await this.prisma.license.updateMany({
      where: {
        expiresAt: { lt: now },
        isExpired: false,
      },
      data: {
        isExpired: true,
      },
    })

    if (result.count > 0) {
      consola.info(`更新了 ${result.count} 个授权码的过期状态`)
    }

    return result.count
  }

  /**
   * 清理测试授权码
   */
  async cleanupTestLicenses(): Promise<number> {
    const result = await this.prisma.license.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    })

    consola.info(`清理了 ${result.count} 个测试授权码`)

    return result.count
  }
}
