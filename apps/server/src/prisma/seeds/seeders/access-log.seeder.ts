import type { PrismaClient } from '#prisma/client'

import { BaseSeeder } from '../core/base-seeder'
import type { SeederOptions, SeederResult } from '../core/types'
import { AccessLogFactory } from '../factories/access-log.factory'

/**
 * 访问日志种子脚本
 * 职责：创建测试访问日志数据
 */
export class AccessLogSeeder extends BaseSeeder {
  readonly name = 'AccessLogSeeder'
  readonly dependencies: string[] = ['LicenseSeeder']

  private accessLogFactory: AccessLogFactory

  constructor(prisma: PrismaClient) {
    super(prisma)
    this.accessLogFactory = new AccessLogFactory(prisma)
  }

  protected async doSeed(options: SeederOptions = {}): Promise<SeederResult> {
    try {
      const logsPerLicense = (options.logsPerLicense!) || 4
      const generateRealistic = options.generateRealistic === true
      const realisticDays = (options.realisticDays!) || 30

      let created = 0

      // 1. 为所有授权码创建基础访问日志
      if (logsPerLicense > 0) {
        const result = await this.accessLogFactory.createLogsForAllLicenses(logsPerLicense)
        created += result.totalLogs
        this.log(`为授权码创建基础访问日志: ${result.totalLogs} 条`, 'info')
      }

      // 2. 为部分授权码生成真实访问模式
      if (generateRealistic) {
        const realisticLogs = await this.createRealisticAccessPatterns(realisticDays)
        created += realisticLogs
        this.log(`创建真实访问模式日志: ${realisticLogs} 条`, 'info')
      }

      this.log(`访问日志数据创建完成: 创建 ${created} 条`, 'success')

      return {
        success: true,
        message: '访问日志数据创建完成',
        data: {
          created,
          existing: 0,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`创建访问日志数据失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '创建访问日志数据失败',
        error: errorMessage,
      }
    }
  }

  protected async doClean(): Promise<SeederResult> {
    try {
      const result = await this.prisma.accessLog.deleteMany({})

      this.log(`删除了 ${result.count} 条访问日志`, 'info')

      return {
        success: true,
        message: '访问日志数据清理完成',
        data: {
          created: 0,
          existing: result.count,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`清理访问日志数据失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '清理访问日志数据失败',
        error: errorMessage,
      }
    }
  }

  async getStats(): Promise<Record<string, number>> {
    const stats = await this.accessLogFactory.getStats()

    // 扁平化时间分布对象
    return {
      total: stats.total,
      risky: stats.risky,
      safe: stats.safe,
      uniqueIPs: stats.uniqueIPs,
      avgLogsPerLicense: stats.avgLogsPerLicense,
      workingHours: stats.timeDistribution.workingHours,
      nonWorkingHours: stats.timeDistribution.nonWorkingHours,
    }
  }

  /**
   * 为部分授权码创建真实访问模式
   */
  private async createRealisticAccessPatterns(days: number): Promise<number> {
    // 获取部分已使用的授权码
    const licenses = await this.prisma.license.findMany({
      where: {
        isUsed: true,
        locked: false,
      },
      select: { id: true, email: true },
      take: 5, // 只为前5个创建真实模式
    })

    if (licenses.length === 0) {
      this.log('没有找到已使用的授权码，跳过真实访问模式生成', 'warn')

      return 0
    }

    let totalLogs = 0

    for (const license of licenses) {
      try {
        const logs = await this.accessLogFactory.createRealisticAccessPattern(
          license.id,
          license.email,
          days,
        )
        totalLogs += logs.length
      }
      catch {
        this.log(`为 ${license.email} 创建真实访问模式失败`, 'warn')
      }
    }

    return totalLogs
  }
}
