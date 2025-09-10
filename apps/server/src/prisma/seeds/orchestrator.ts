import { consola } from 'consola'

import type { PrismaClient } from '#prisma/client'

import type { IGenericSeeder, OrchestratorConfig, OrchestratorResult, SeederResult } from './core/types'
import { AccessLogSeeder } from './seeders/access-log.seeder'
import { AdminSeeder } from './seeders/admin.seeder'
import { LicenseSeeder } from './seeders/license.seeder'
import { OrganizationSeeder } from './seeders/organization.seeder'
import { PermissionsSeeder } from './seeders/permissions.seeder'
import { RolesSeeder } from './seeders/roles.seeder'
import { UserSeeder } from './seeders/user.seeder'

/**
 * 种子脚本编排器
 * 职责：管理种子脚本的执行顺序和依赖关系
 */
export class SeedOrchestrator {
  private readonly seeders: Map<string, IGenericSeeder>

  constructor(private readonly prisma: PrismaClient) {
    this.seeders = new Map<string, IGenericSeeder>()
    this.seeders.set('PermissionsSeeder', new PermissionsSeeder(prisma))
    this.seeders.set('RolesSeeder', new RolesSeeder(prisma))
    this.seeders.set('AdminSeeder', new AdminSeeder(prisma))
    this.seeders.set('OrganizationSeeder', new OrganizationSeeder(prisma))
    this.seeders.set('UserSeeder', new UserSeeder(prisma))
    this.seeders.set('LicenseSeeder', new LicenseSeeder(prisma))
    this.seeders.set('AccessLogSeeder', new AccessLogSeeder(prisma))
  }

  /**
   * 执行完整的种子数据生成
   */
  async executeAll(config: Partial<OrchestratorConfig> = {}): Promise<OrchestratorResult> {
    const startTime = Date.now()

    try {
      consola.info('开始执行完整的种子数据生成...')

      const finalConfig = this.prepareConfig(config)
      const results: Record<string, SeederResult> = {}

      if (finalConfig.parallel && finalConfig.seeders.length > 1) {
        // 并行执行（仅适用于独立的seeder）
        const parallelResults = await this.executeParallel(finalConfig)
        Object.assign(results, parallelResults)
      }
      else {
        // 串行执行（默认，保证依赖顺序）
        for (const seederName of finalConfig.seeders) {
          const result = await this.executeSingle(seederName, finalConfig)
          results[seederName] = result

          if (!result.success) {
            consola.error(`${seederName} 执行失败，停止后续执行`)
            break
          }
        }
      }

      const duration = Date.now() - startTime
      const success = Object.values(results).every((r: SeederResult) => r.success)

      consola.success(`种子数据生成完成，耗时: ${duration}ms`)

      return {
        success,
        duration,
        results,
      }
    }
    catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      consola.error(`种子数据生成失败，耗时: ${duration}ms`, error)

      return {
        success: false,
        duration,
        results: {},
        error: errorMessage,
      }
    }
  }

  /**
   * 执行单个种子脚本
   */
  async executeSingle(
    seederName: string,
    options: Record<string, unknown> = {},
  ): Promise<SeederResult> {
    const seeder = this.seeders.get(seederName)

    if (!seeder) {
      throw new Error(`未找到种子脚本: ${seederName}`)
    }

    return await seeder.seed(options)
  }

  /**
   * 清理所有数据
   */
  async cleanAll(preserveAdmin = true): Promise<OrchestratorResult> {
    const startTime = Date.now()

    try {
      consola.info('开始清理所有种子数据...')

      const results: Record<string, SeederResult> = {}

      // 按相反顺序清理（先清理依赖项）
      const cleanOrder = Array.from(this.seeders.keys()).reverse()

      for (const seederName of cleanOrder) {
        const seeder = this.seeders.get(seederName)

        if (seeder) {
          const result = await seeder.clean({ preserveAdmin })
          results[seederName] = result
        }
      }

      const duration = Date.now() - startTime
      const success = Object.values(results).every((r: SeederResult) => r.success)

      consola.success(`种子数据清理完成，耗时: ${duration}ms`)

      return {
        success,
        duration,
        results,
      }
    }
    catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      consola.error(`种子数据清理失败，耗时: ${duration}ms`, error)

      return {
        success: false,
        duration,
        results: {},
        error: errorMessage,
      }
    }
  }

  /**
   * 获取所有统计信息
   */
  async getAllStats(): Promise<Record<string, Record<string, number>>> {
    const stats: Record<string, Record<string, number>> = {}

    for (const [seederName, seeder] of this.seeders) {
      try {
        stats[seederName] = await seeder.getStats()
      }
      catch (error) {
        consola.warn(`获取 ${seederName} 统计信息失败:`, error)
        stats[seederName] = {}
      }
    }

    return stats
  }

  /**
   * 验证所有数据完整性
   */
  async validateAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    for (const [seederName, seeder] of this.seeders) {
      try {
        results[seederName] = await seeder.validate()
      }
      catch (error) {
        consola.warn(`验证 ${seederName} 失败:`, error)
        results[seederName] = false
      }
    }

    return results
  }

  /**
   * 获取种子脚本
   */
  getSeeder(name: string) {
    return this.seeders.get(name)
  }

  /**
   * 准备配置
   */
  private prepareConfig(config: Partial<OrchestratorConfig>): Required<OrchestratorConfig> {
    const defaultSeeders = ['PermissionsSeeder', 'RolesSeeder', 'AdminSeeder', 'OrganizationSeeder', 'UserSeeder', 'LicenseSeeder', 'AccessLogSeeder']

    return {
      environment: config.environment ?? 'development',
      seeders: config.seeders ?? defaultSeeders,
      skipValidation: config.skipValidation ?? false,
      parallel: config.parallel ?? false,
    }
  }

  /**
   * 并行执行（仅适用于无依赖的脚本）
   */
  private async executeParallel(
    config: Required<OrchestratorConfig>,
  ): Promise<Record<string, SeederResult>> {
    // 注意：由于有依赖关系，实际上不能完全并行
    // 这里可以实现部分并行，比如 User 和 License 可以并行创建
    consola.warn('并行执行模式暂未完全实现，回退到串行模式')

    const results: Record<string, SeederResult> = {}

    for (const seederName of config.seeders) {
      const result = await this.executeSingle(seederName, config)
      results[seederName] = result

      if (!result.success) {
        break
      }
    }

    return results
  }

  /**
   * 快速开发环境种子
   */
  async quickDev(options: Record<string, unknown> = {}): Promise<OrchestratorResult> {
    const config = {
      environment: 'development' as const,
      seeders: ['AdminSeeder', 'OrganizationSeeder', 'UserSeeder', 'LicenseSeeder'],
    }

    const seedOptions = {
      count: options.multiplier ? Math.floor(15 * (options.multiplier as number)) : 15,
      includePresets: true,
      ...options,
    }

    return await this.executeAll({ ...config, ...seedOptions })
  }

  /**
   * 最小化种子
   */
  async minimal(): Promise<OrchestratorResult> {
    const config = {
      environment: 'production' as const,
      seeders: ['AdminSeeder', 'OrganizationSeeder'],
    }

    return await this.executeAll(config)
  }
}
