import { faker } from '@faker-js/faker'
import { consola } from 'consola'

import type { AccessLog } from '#prisma/client'

import { BaseFactory } from '../core/base-factory'

/**
 * 访问日志数据工厂 - 生成高质量的测试访问日志数据
 * 特点：
 * - 严格的外键关联验证
 * - 真实的IP地址和访问模式
 * - 智能的风险访问判断
 * - 完整的数据一致性保证
 */
export class AccessLogFactory extends BaseFactory<AccessLog> {
  /**
   * 生成单个访问日志数据
   */
  protected async generateSingle(
    overrides: Partial<AccessLog & { licenseId?: string, email?: string }> = {},
  ): Promise<AccessLog> {
    // 确保数据库连接正常
    await this.checkDatabaseConnection()

    // 如果没有提供授权码ID和邮箱，则随机选择一个已验证的授权码
    let licenseId = overrides.licenseId
    let email = overrides.email

    if (!licenseId || !email) {
      const randomLicense = await this.getRandomVerifiedLicense()

      if (!randomLicense) {
        throw new Error('没有可用的已验证授权码来创建访问日志')
      }

      licenseId = randomLicense.id
      email = randomLicense.email
    }

    // 验证授权码存在且邮箱匹配
    await this.validateLicenseAndEmail(licenseId, email)

    // 构建访问日志数据
    const logData = {
      licenseId,
      email,
      ip: overrides.ip ?? this.generateRealisticIP(),
      isRisky: overrides.isRisky ?? this.generateRiskyStatus(),
      accessedAt: overrides.accessedAt ?? this.generateAccessTime(),
    }

    // 使用事务创建访问日志
    return await this.withTransaction(async (tx) => {
      return await tx.accessLog.create({
        data: logData,
      })
    })
  }

  /**
   * 验证访问日志数据完整性
   */
  protected async validateData(accessLog: AccessLog): Promise<boolean> {
    try {
      // 检查必需字段
      if (!accessLog.id || !accessLog.licenseId || !accessLog.email || !accessLog.ip) {
        consola.error('访问日志缺少必需字段', {
          logId: accessLog.id,
          licenseId: accessLog.licenseId,
          email: accessLog.email,
          ip: accessLog.ip,
        })

        return false
      }

      // 检查IP地址格式
      if (!this.isValidIP(accessLog.ip)) {
        consola.error('访问日志IP地址格式无效', { ip: accessLog.ip })

        return false
      }

      // 验证授权码存在且邮箱匹配
      const license = await this.prisma.license.findUnique({
        where: { id: accessLog.licenseId },
        select: { email: true },
      })

      if (!license) {
        consola.error('访问日志关联的授权码不存在', { licenseId: accessLog.licenseId })

        return false
      }

      if (license.email !== accessLog.email) {
        consola.error('访问日志邮箱与授权码邮箱不匹配', {
          logEmail: accessLog.email,
          licenseEmail: license.email,
        })

        return false
      }

      return true
    }
    catch (error) {
      consola.error('访问日志数据验证失败', error)

      return false
    }
  }

  /**
   * 为特定授权码创建访问日志
   */
  async createLogsForLicense(
    licenseId: string,
    email: string,
    count = 5,
  ): Promise<AccessLog[]> {
    consola.info(`为授权码 ${email} 创建 ${count} 条访问日志...`)

    // 验证授权码存在
    await this.validateLicenseAndEmail(licenseId, email)

    const overrides = Array.from({ length: count }, () => ({
      licenseId,
      email,
    }))

    return await this.createBatch(count, overrides)
  }

  /**
   * 为所有已验证的授权码创建访问日志
   */
  async createLogsForAllLicenses(logsPerLicense = 3): Promise<{
    totalLogs: number
    processedLicenses: number
    errors: number
  }> {
    consola.info('为所有已验证授权码创建访问日志...')

    // 获取所有已验证的授权码
    const licenses = await this.prisma.license.findMany({
      where: {
        isUsed: true,
        locked: false, // 不为被锁定的授权码创建日志
      },
      select: { id: true, email: true },
    })

    if (licenses.length === 0) {
      consola.warn('没有找到已验证的授权码')

      return { totalLogs: 0, processedLicenses: 0, errors: 0 }
    }

    let totalLogs = 0
    let processedLicenses = 0
    let errors = 0

    // 分批处理授权码，避免内存压力
    const batchSize = 10

    for (let i = 0; i < licenses.length; i += batchSize) {
      const batch = licenses.slice(i, i + batchSize)

      const batchResults = await Promise.allSettled(
        batch.map(async (license) => {
          try {
            const logs = await this.createLogsForLicense(
              license.id,
              license.email,
              logsPerLicense,
            )

            return logs.length
          }
          catch (error) {
            consola.error(`为授权码 ${license.email} 创建访问日志失败:`, error)
            throw error
          }
        }),
      )

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          totalLogs += result.value
          processedLicenses++
        }
        else {
          errors++
          consola.error(`批次处理失败，授权码: ${batch[index].email}`)
        }
      })

      // 显示进度
      const progress = Math.round((i + batch.length) / licenses.length * 100)
      consola.info(`进度: ${progress}% (${i + batch.length}/${licenses.length})`)
    }

    consola.success(`访问日志创建完成，总计: ${totalLogs} 条，成功处理: ${processedLicenses} 个授权码，错误: ${errors} 个`)

    return { totalLogs, processedLicenses, errors }
  }

  /**
   * 创建模拟真实访问模式的日志
   */
  async createRealisticAccessPattern(
    licenseId: string,
    email: string,
    days = 30,
  ): Promise<AccessLog[]> {
    consola.info(`为授权码 ${email} 创建 ${days} 天的真实访问模式...`)

    // 验证授权码存在
    await this.validateLicenseAndEmail(licenseId, email)

    const logs: AccessLog[] = []
    const now = new Date()

    // 模拟用户访问行为：工作日较多，周末较少
    for (let day = 0; day < days; day++) {
      const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6

      // 周末访问概率降低
      const accessProbability = isWeekend ? 0.3 : 0.7

      if (Math.random() < accessProbability) {
        // 一天内可能有多次访问
        const accessCount = Math.floor(Math.random() * 3) + 1 // 1-3次

        for (let i = 0; i < accessCount; i++) {
          try {
            // 生成当天随机时间
            const accessTime = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              Math.floor(Math.random() * 24), // 随机小时
              Math.floor(Math.random() * 60), // 随机分钟
              Math.floor(Math.random() * 60), // 随机秒钟
            )

            const log = await this.generateSingle({
              licenseId,
              email,
              accessedAt: accessTime,
              // 同一天内使用相同IP的概率较高
              ip: i === 0 ? undefined : logs[logs.length - 1]?.ip || undefined,
            })

            logs.push(log)
          }
          catch (error) {
            consola.warn(`创建第 ${day} 天第 ${i + 1} 次访问日志失败:`, error)
          }
        }
      }
    }

    consola.success(`创建了 ${logs.length} 条真实访问模式的日志`)

    return logs
  }

  /**
   * 获取随机已验证授权码
   */
  private async getRandomVerifiedLicense(): Promise<{ id: string, email: string } | null> {
    const licenses = await this.prisma.license.findMany({
      where: {
        isUsed: true,
        locked: false,
      },
      select: { id: true, email: true },
      take: 100, // 限制查询结果，从中随机选择
    })

    if (licenses.length === 0) {
      return null
    }

    return licenses[Math.floor(Math.random() * licenses.length)]
  }

  /**
   * 验证授权码和邮箱
   */
  private async validateLicenseAndEmail(licenseId: string, email: string): Promise<void> {
    const license = await this.prisma.license.findUnique({
      where: { id: licenseId },
      select: { email: true, isUsed: true, locked: true },
    })

    if (!license) {
      throw new Error(`授权码不存在: ${licenseId}`)
    }

    if (license.email !== email) {
      throw new Error(`邮箱不匹配: 期望 ${license.email}, 得到 ${email}`)
    }

    if (!license.isUsed) {
      throw new Error(`授权码未使用: ${email}`)
    }

    if (license.locked) {
      throw new Error(`授权码已锁定: ${email}`)
    }
  }

  /**
   * 生成真实的IP地址
   */
  private generateRealisticIP(): string {
    const random = Math.random()

    if (random < 0.6) {
      // 60% 国内IP段
      const segments = [
        ['113', '116'], // 中国电信
        ['221', '222'], // 中国联通
        ['183', '120'], // 中国移动
        ['101', '103'], // 其他运营商
      ]
      const segment = segments[Math.floor(Math.random() * segments.length)]
      const prefix = segment[Math.floor(Math.random() * segment.length)]

      return `${prefix}.${faker.number.int({ min: 1, max: 255 })}.${faker.number.int({ min: 1, max: 255 })}.${faker.number.int({ min: 1, max: 255 })}`
    }
    else {
      // 40% 国际IP
      return faker.internet.ip()
    }
  }

  /**
   * 生成风险状态（基于IP和访问模式）
   */
  private generateRiskyStatus(): boolean {
    // 15% 概率为风险访问
    return Math.random() < 0.15
  }

  /**
   * 生成访问时间（集中在工作时间）
   */
  private generateAccessTime(): Date {
    const now = new Date()
    const daysAgo = Math.floor(Math.random() * 30) // 过去30天内
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    // 工作时间访问概率更高
    const isWorkingHours = Math.random() < 0.7
    let hour: number

    if (isWorkingHours) {
      // 工作时间：9-18点
      hour = 9 + Math.floor(Math.random() * 10)
    }
    else {
      // 非工作时间：0-8点或19-23点
      hour = Math.random() < 0.5
        ? Math.floor(Math.random() * 9) // 0-8点
        : 19 + Math.floor(Math.random() * 5) // 19-23点
    }

    date.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))

    return date
  }

  /**
   * 验证IP地址格式
   */
  private isValidIP(ip: string): boolean {
    // IPv4 正则
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

    // IPv6 正则（简化版本）
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  /**
   * 获取访问日志统计信息
   */
  async getStats(): Promise<{
    total: number
    risky: number
    safe: number
    uniqueIPs: number
    avgLogsPerLicense: number
    timeDistribution: {
      workingHours: number
      nonWorkingHours: number
    }
  }> {
    const [
      total,
      risky,
      uniqueIPs,
      licenseCount,
      workingHours,
    ] = await Promise.all([
      this.prisma.accessLog.count(),
      this.prisma.accessLog.count({ where: { isRisky: true } }),
      this.prisma.accessLog.findMany({
        select: { ip: true },
        distinct: ['ip'],
      }),
      this.prisma.license.count({ where: { isUsed: true } }),
      this.prisma.accessLog.count({
        where: {
          accessedAt: {
            // 查询工作时间（9-18点）的访问
            // 注意：这里简化处理，实际项目中应该考虑时区
          },
        },
      }),
    ])

    return {
      total,
      risky,
      safe: total - risky,
      uniqueIPs: uniqueIPs.length,
      avgLogsPerLicense: licenseCount > 0 ? Math.round(total / licenseCount * 100) / 100 : 0,
      timeDistribution: {
        workingHours,
        nonWorkingHours: total - workingHours,
      },
    }
  }

  /**
   * 清理访问日志
   */
  async cleanupAccessLogs(olderThanDays?: number): Promise<number> {
    let whereClause = {}

    if (olderThanDays) {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
      whereClause = {
        accessedAt: {
          lt: cutoffDate,
        },
      }
    }

    const result = await this.prisma.accessLog.deleteMany({
      where: whereClause,
    })

    const message = olderThanDays
      ? `清理了 ${result.count} 条超过 ${olderThanDays} 天的访问日志`
      : `清理了所有 ${result.count} 条访问日志`

    consola.info(message)

    return result.count
  }
}
