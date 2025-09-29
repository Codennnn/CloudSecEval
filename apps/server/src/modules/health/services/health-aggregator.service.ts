import { Injectable, Logger } from '@nestjs/common'

import { AppConfigService } from '~/config/services/config.service'

import { type DetailedHealthCheckResponseDto } from '../dto/detailed-health-status.dto'
import {
  type HealthCheckResponseDto,
  type HealthDetailDto,
  HealthStatus,
} from '../dto/health-status.dto'
import { DiskHealthIndicator } from '../indicators/disk-health.indicator'
import { MemoryHealthIndicator } from '../indicators/memory-health.indicator'
import { PrismaHealthIndicator } from '../indicators/prisma-health.indicator'

/**
 * 健康检查配置接口
 *
 * @description 定义健康检查的可配置选项
 */
interface HealthCheckConfig {
  /** 是否启用数据库检查 */
  readonly enableDatabase: boolean

  /** 是否启用内存检查 */
  readonly enableMemory: boolean

  /** 是否启用磁盘检查 */
  readonly enableDisk: boolean

  /** 检查超时时间（毫秒） */
  readonly timeout: number

  /** 详细检查是否包含性能指标 */
  readonly includePerformanceMetrics: boolean
}

/**
 * 健康检查聚合服务
 *
 * @description 协调各个健康检查指示器，提供统一的健康检查接口
 * 负责执行所有健康检查、聚合结果、处理超时和错误情况
 */
@Injectable()
export class HealthAggregatorService {
  private readonly logger = new Logger(HealthAggregatorService.name)

  // 服务启动时间，用于计算运行时长
  private readonly startTime = new Date()

  // 默认配置
  private readonly defaultConfig: HealthCheckConfig = {
    enableDatabase: true,
    enableMemory: true,
    enableDisk: true,
    timeout: 10000, // 10 秒
    includePerformanceMetrics: true,
  }

  constructor(
    private readonly configService: AppConfigService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly diskHealthIndicator: DiskHealthIndicator,
  ) {}

  /**
   * 执行基础健康检查
   *
   * @description 执行所有启用的健康检查指示器，返回标准格式的健康状态
   * 主要用于容器编排器和负载均衡器的快速健康检查
   *
   * @param config 可选的健康检查配置
   * @returns 标准健康检查响应
   *
   * @example
   * ```typescript
   * const result = await healthAggregator.performHealthCheck()
   * // 返回格式符合 Terminus 标准
   * ```
   */
  async performHealthCheck(
    config: Partial<HealthCheckConfig> = {},
  ): Promise<HealthCheckResponseDto> {
    const startTime = Date.now()
    const effectiveConfig = { ...this.defaultConfig, ...config }

    this.logger.debug('开始执行健康检查', {
      operation: 'performHealthCheck',
      config: effectiveConfig,
    })

    try {
      // 并行执行所有健康检查
      const checkPromises: Promise<{ key: string, result: unknown }>[] = []

      if (effectiveConfig.enableDatabase) {
        checkPromises.push(
          this.executeWithKey('database', () =>
            this.prismaHealthIndicator.isHealthy('database', effectiveConfig.timeout / 3),
          ),
        )
      }

      if (effectiveConfig.enableMemory) {
        checkPromises.push(
          this.executeWithKey('memory', () =>
            this.memoryHealthIndicator.isHealthy('memory'),
          ),
        )
      }

      if (effectiveConfig.enableDisk) {
        checkPromises.push(
          this.executeWithKey('disk', () =>
            this.diskHealthIndicator.isHealthy('disk'),
          ),
        )
      }

      // 等待所有检查完成（使用 allSettled 避免单个检查失败影响其他检查）
      const results = await Promise.allSettled(checkPromises)

      // 处理检查结果
      const { info, error, details } = this.processHealthResults(results)

      // 确定整体健康状态
      const overallStatus = this.determineOverallStatus(details)

      const totalTime = Date.now() - startTime
      const response: HealthCheckResponseDto = {
        status: overallStatus,
        info,
        error,
        details,
        totalTime,
        timestamp: new Date().toISOString(),
      }

      this.logger.debug('健康检查完成', {
        operation: 'performHealthCheck',
        status: overallStatus,
        totalTime,
        checksPerformed: checkPromises.length,
      })

      return response
    }
    catch (error) {
      const totalTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      this.logger.error('健康检查执行失败', {
        operation: 'performHealthCheck',
        error: errorMessage,
        totalTime,
      })

      // 返回错误状态的响应
      return {
        status: HealthStatus.DOWN,
        info: {},
        error: {
          system: {
            status: HealthStatus.DOWN,
            message: `健康检查执行失败: ${errorMessage}`,
            timestamp: new Date().toISOString(),
          },
        },
        details: {},
        totalTime,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 执行详细健康检查
   *
   * @description 执行详细的健康检查，包含更多的系统信息和性能指标
   * 主要用于运维监控和故障排查
   *
   * @param config 可选的健康检查配置
   * @returns 详细健康检查响应
   */
  async performDetailedHealthCheck(
    config: Partial<HealthCheckConfig> = {},
  ): Promise<DetailedHealthCheckResponseDto> {
    const startTime = Date.now()
    const effectiveConfig = { ...this.defaultConfig, ...config }

    this.logger.debug('开始执行详细健康检查', {
      operation: 'performDetailedHealthCheck',
      config: effectiveConfig,
    })

    try {
      // 先执行基础健康检查
      const basicHealth = await this.performHealthCheck(effectiveConfig)

      // 构建服务信息
      const serviceInfo = this.buildServiceInfo()

      // 收集性能指标（如果启用）
      const performanceMetrics = effectiveConfig.includePerformanceMetrics
        ? await this.collectPerformanceMetrics()
        : undefined

      // 构建详细响应
      const response: DetailedHealthCheckResponseDto = {
        status: basicHealth.status,
        service: serviceInfo,
        database: this.extractDatabaseDetail(basicHealth.details),
        memory: this.extractMemoryDetail(basicHealth.details),
        disk: this.extractDiskDetail(basicHealth.details),
        performance: performanceMetrics,
        totalTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }

      this.logger.debug('详细健康检查完成', {
        operation: 'performDetailedHealthCheck',
        status: response.status,
        totalTime: response.totalTime,
      })

      return response
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      this.logger.error('详细健康检查执行失败', {
        operation: 'performDetailedHealthCheck',
        error: errorMessage,
      })

      throw error // 重新抛出错误，让上层处理
    }
  }

  /**
   * 执行带键名的健康检查
   *
   * @description 为健康检查结果添加键名标识的辅助方法
   *
   * @private
   */
  private async executeWithKey<T>(
    key: string,
    checkFn: () => Promise<T>,
  ): Promise<{ key: string, result: T }> {
    const result = await checkFn()

    return { key, result }
  }

  /**
   * 处理健康检查结果
   *
   * @description 将 Promise.allSettled 的结果转换为标准的健康检查格式
   *
   * @private
   */
  private processHealthResults(
    results: PromiseSettledResult<{ key: string, result: unknown }>[],
  ): {
    info: Record<string, HealthDetailDto>
    error: Record<string, HealthDetailDto>
    details: Record<string, HealthDetailDto>
  } {
    const info: Record<string, HealthDetailDto> = {}
    const error: Record<string, HealthDetailDto> = {}
    const details: Record<string, HealthDetailDto> = {}

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { key, result: checkResult } = result.value

        // 从 Terminus 格式提取详细信息
        const detail = (checkResult as Record<string, HealthDetailDto>)[key]
        details[key] = detail

        if (detail.status === HealthStatus.UP || detail.status === HealthStatus.DEGRADED) {
          info[key] = detail
        }
        else {
          error[key] = detail
        }
      }
      else {
        // 处理检查失败的情况
        const errorDetail: HealthDetailDto = {
          status: HealthStatus.DOWN,
          message: `检查执行失败: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
          timestamp: new Date().toISOString(),
        }

        const key = 'unknown'
        details[key] = errorDetail
        error[key] = errorDetail
      }
    })

    return { info, error, details }
  }

  /**
   * 确定整体健康状态
   *
   * @description 基于各个检查项的状态确定整体健康状态
   *
   * @private
   */
  private determineOverallStatus(details: Record<string, HealthDetailDto>): HealthStatus {
    const statuses = Object.values(details).map((detail) => detail.status)

    // 如果有任何检查项为 DOWN，整体状态为 DOWN
    if (statuses.includes(HealthStatus.DOWN)) {
      return HealthStatus.DOWN
    }

    // 如果有任何检查项为 DEGRADED，整体状态为 DEGRADED
    if (statuses.includes(HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED
    }

    // 如果有任何检查项为 UNKNOWN，整体状态为 UNKNOWN
    if (statuses.includes(HealthStatus.UNKNOWN)) {
      return HealthStatus.UNKNOWN
    }

    // 否则为健康状态
    return HealthStatus.UP
  }

  /**
   * 构建服务基本信息
   *
   * @private
   */
  private buildServiceInfo() {
    const uptime = Date.now() - this.startTime.getTime()

    return {
      name: 'NestJS API Server',
      version: process.env.npm_package_version ?? '1.0.0',
      environment: this.configService.app.env,
      uptime,
      startTime: this.startTime.toISOString(),
    }
  }

  /**
   * 从基础健康检查结果中提取数据库详情
   *
   * @private
   */
  private extractDatabaseDetail(details: Record<string, HealthDetailDto>) {
    return details.database
  }

  /**
   * 从基础健康检查结果中提取内存详情
   *
   * @private
   */
  private extractMemoryDetail(details: Record<string, HealthDetailDto>) {
    return details.memory
  }

  /**
   * 从基础健康检查结果中提取磁盘详情
   *
   * @private
   */
  private extractDiskDetail(details: Record<string, HealthDetailDto>) {
    return details.disk
  }

  /**
   * 收集性能指标
   *
   * @description 收集 CPU 使用率、请求统计等性能相关指标
   *
   * @private
   */
  private async collectPerformanceMetrics() {
    try {
      const cpuUsage = process.cpuUsage()
      const os = await import('node:os')
      const loadAverage = os.loadavg()

      return {
        cpu: {
          usage: this.calculateCpuUsage(cpuUsage),
          loadAverage,
        },
        requests: {
          total: 0, // TODO: 从请求统计中获取
          perSecond: 0, // TODO: 需要计算
          avgResponseTime: 0, // TODO: 从性能监控中获取
        },
      }
    }
    catch (error) {
      this.logger.warn('收集性能指标失败', {
        error: error instanceof Error ? error.message : String(error),
      })

      return undefined
    }
  }

  /**
   * 计算 CPU 使用率
   *
   * @private
   */
  private calculateCpuUsage(cpuUsage: NodeJS.CpuUsage): number {
    // 简化的 CPU 使用率计算
    // 实际项目中可能需要更复杂的计算逻辑
    const totalTime = cpuUsage.user + cpuUsage.system

    return Number((totalTime / 1_000_000 % 100).toFixed(2)) // 转换为百分比
  }
}
