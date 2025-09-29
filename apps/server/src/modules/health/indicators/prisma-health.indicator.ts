import { Injectable, Logger } from '@nestjs/common'
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus'

import { PrismaService } from '~/prisma/prisma.service'

import { type DatabaseHealthDetailDto } from '../dto/detailed-health-status.dto'
import { HealthStatus } from '../dto/health-status.dto'

/**
 * Prisma 数据库健康检查指示器
 *
 * @description 专门用于检查 Prisma 数据库连接状态和性能的健康检查器
 * 通过执行简单查询来验证数据库可用性，并收集连接池等关键信息
 */
@Injectable()
export class PrismaHealthIndicator {
  private readonly logger = new Logger(PrismaHealthIndicator.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  /**
   * 执行数据库健康检查
   *
   * @param key 健康检查项的标识符，用于在结果中区分不同的检查项
   * @param timeout 检查超时时间（毫秒），默认 5000ms
   * @returns 健康检查结果，符合 Terminus 标准格式
   *
   * @example
   * ```typescript
   * const result = await prismaHealthIndicator.isHealthy('database')
   * // 返回格式：
   * // {
   * //   database: {
   * //     status: 'up',
   * //     responseTime: 15,
   * //     message: '数据库连接正常',
   * //     // ... 其他详细信息
   * //   }
   * // }
   * ```
   */
  async isHealthy(key: string, timeout = 5000): Promise<HealthIndicatorResult> {
    const startTime = Date.now()

    try {
      // 使用 Promise.race 实现超时控制
      const result = await Promise.race([
        this.performDatabaseCheck(),
        this.createTimeoutPromise(timeout),
      ])

      const responseTime = Date.now() - startTime

      const healthDetail: DatabaseHealthDetailDto = {
        status: HealthStatus.UP,
        responseTime,
        message: '数据库连接正常',
        timestamp: new Date().toISOString(),
        type: 'postgresql',
        version: result.version,
        connectionPool: result.connectionPool,
        metadata: {
          databaseUrl: this.maskDatabaseUrl(result.databaseUrl),
          queryCount: result.queryCount,
        },
      }

      this.logger.debug(`数据库健康检查成功 - 响应时间: ${responseTime}ms`, {
        operation: 'isHealthy',
        key,
        responseTime,
      })

      return this.healthIndicatorService.check(key).up({
        message: healthDetail.message,
        responseTime: healthDetail.responseTime,
        type: healthDetail.type,
        version: healthDetail.version,
      })
    }
    catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      const healthDetail: DatabaseHealthDetailDto = {
        status: HealthStatus.DOWN,
        responseTime,
        message: `数据库连接失败: ${errorMessage}`,
        timestamp: new Date().toISOString(),
        type: 'postgresql',
        metadata: {
          error: errorMessage,
          timeout: responseTime >= timeout,
        },
      }

      this.logger.error(`数据库健康检查失败: ${errorMessage}`, {
        operation: 'isHealthy',
        key,
        responseTime,
        error: errorMessage,
      })

      return this.healthIndicatorService.check(key).down({
        message: healthDetail.message,
        responseTime: healthDetail.responseTime,
        error: healthDetail.metadata?.error,
      })
    }
  }

  /**
   * 执行实际的数据库检查操作
   *
   * @description 通过执行简单的数据库查询来验证连接状态
   * 同时尝试收集数据库版本、连接池等附加信息
   *
   * @private
   */
  private async performDatabaseCheck(): Promise<{
    version?: string
    databaseUrl?: string
    queryCount: number
    connectionPool?: {
      active: number
      idle: number
      max: number
    }
  }> {
    // 执行简单的连接测试查询
    await this.prismaService.$queryRaw`SELECT 1 as health_check`

    // 尝试获取数据库版本（可选，失败不影响整体健康状态）
    let version: string | undefined

    try {
      const versionResult = await this.prismaService.$queryRaw<{ version: string }[]>`SELECT version()`
      version = versionResult[0]?.version?.split(' ')[0] // 提取版本号主要部分
    }
    catch (error) {
      this.logger.warn('获取数据库版本失败', { error: error instanceof Error ? error.message : String(error) })
    }

    // 尝试获取连接池信息（如果 Prisma 提供了相关 API）
    let connectionPool: { active: number, idle: number, max: number } | undefined

    try {
      // 注意：这些信息在实际项目中可能需要根据具体的 Prisma 配置和数据库类型调整
      // 这里提供一个基础示例，实际实现可能需要使用数据库特定的查询
      const poolStats = await this.getConnectionPoolStats()
      connectionPool = poolStats
    }
    catch (error) {
      this.logger.debug('获取连接池信息失败', { error: error instanceof Error ? error.message : String(error) })
    }

    return {
      version,
      databaseUrl: process.env.DATABASE_URL,
      queryCount: 1, // 记录执行的查询数量
      connectionPool,
    }
  }

  /**
   * 获取数据库连接池统计信息
   *
   * @description 尝试获取当前数据库连接池的使用情况
   * 这个方法的具体实现依赖于数据库类型和配置
   *
   * @private
   */
  private async getConnectionPoolStats():
  Promise<{ active: number, idle: number, max: number } | undefined> {
    try {
      // PostgreSQL 示例：查询当前连接数
      // 注意：这需要适当的数据库权限，在生产环境中可能需要调整
      const activeConnections = await this.prismaService.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = 'active'
      `

      const idleConnections = await this.prismaService.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = 'idle'
      `

      return {
        active: Number(activeConnections[0]?.count || 0),
        idle: Number(idleConnections[0]?.count || 0),
        max: 20, // 这应该从 Prisma 配置中获取，这里使用默认值
      }
    }
    catch (error) {
      // 如果无法获取连接池信息，返回 undefined，不影响整体健康检查
      this.logger.debug('无法获取连接池统计信息', {
        error: error instanceof Error ? error.message : String(error),
      })

      return undefined
    }
  }

  /**
   * 创建超时 Promise
   *
   * @description 用于实现健康检查的超时控制
   * 如果数据库响应时间超过指定阈值，则抛出超时错误
   *
   * @private
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`数据库健康检查超时 (${timeout}ms)`))
      }, timeout)
    })
  }

  /**
   * 掩码化数据库连接字符串
   *
   * @description 出于安全考虑，在日志和响应中隐藏敏感的连接信息
   *
   * @private
   */
  private maskDatabaseUrl(url?: string): string {
    if (!url) {
      return 'N/A'
    }

    try {
      const urlObj = new URL(url)

      // 保留协议和主机，隐藏认证信息
      return `${urlObj.protocol}//*****:*****@${urlObj.host}${urlObj.pathname}`
    }
    catch {
      return 'Invalid URL'
    }
  }
}
