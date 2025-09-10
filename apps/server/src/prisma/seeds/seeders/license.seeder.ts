import type { PrismaClient } from '#prisma/client'

import { BaseSeeder } from '../core/base-seeder'
import type { SeederOptions, SeederResult } from '../core/types'
import { LicenseFactory } from '../factories/license.factory'

/**
 * 授权码种子脚本
 * 职责：创建测试授权码数据
 */
export class LicenseSeeder extends BaseSeeder {
  readonly name = 'LicenseSeeder'
  readonly dependencies: string[] = ['UserSeeder']

  private licenseFactory: LicenseFactory

  constructor(prisma: PrismaClient) {
    super(prisma)
    this.licenseFactory = new LicenseFactory(prisma)
  }

  protected async doSeed(options: SeederOptions = {}): Promise<SeederResult> {
    try {
      const count = typeof options.count === 'number' ? options.count : 30
      const includePresets = options.includePresets !== false

      let created = 0
      let existing = 0

      // 1. 创建预设授权码
      if (includePresets) {
        const presetLicenses = await this.licenseFactory.createPresetLicenses()
        existing += presetLicenses.length
        this.log(`创建预设授权码: ${presetLicenses.length} 个`, 'info')
      }

      // 2. 创建随机授权码
      if (count > 0) {
        const randomLicenses = await this.licenseFactory.createBatch(count)
        created += randomLicenses.length
        this.log(`创建随机授权码: ${randomLicenses.length} 个`, 'info')
      }

      // 3. 更新过期状态
      const expiredFixed = await this.licenseFactory.updateExpiredStatus()

      if (expiredFixed > 0) {
        this.log(`修复了 ${expiredFixed} 个授权码的过期状态`, 'info')
      }

      this.log(`授权码数据创建完成: 创建 ${created} 个，已存在 ${existing} 个`, 'success')

      return {
        success: true,
        message: '授权码数据创建完成',
        data: {
          created,
          existing,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`创建授权码数据失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '创建授权码数据失败',
        error: errorMessage,
      }
    }
  }

  protected async doClean(): Promise<SeederResult> {
    try {
      const result = await this.prisma.license.deleteMany({})

      this.log(`删除了 ${result.count} 个授权码`, 'info')

      return {
        success: true,
        message: '授权码数据清理完成',
        data: {
          created: 0,
          existing: result.count,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`清理授权码数据失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '清理授权码数据失败',
        error: errorMessage,
      }
    }
  }

  async getStats(): Promise<Record<string, number>> {
    const stats = await this.licenseFactory.getStats()

    // 扁平化复杂对象
    return {
      total: stats.total,
      used: stats.used,
      active: stats.active,
      expired: stats.expired,
      locked: stats.locked,
      permanent: stats.permanent,
      averagePurchaseAmount: stats.averagePurchaseAmount,
    }
  }
}
