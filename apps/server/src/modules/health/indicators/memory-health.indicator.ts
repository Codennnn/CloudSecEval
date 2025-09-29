import { Injectable, Logger } from '@nestjs/common'
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus'

import { type MemoryHealthDetailDto, type SystemResourceDto } from '../dto/detailed-health-status.dto'
import { HealthStatus } from '../dto/health-status.dto'

/**
 * 内存健康检查指示器
 *
 * @description 监控 Node.js 进程的内存使用情况，包括堆内存、RSS内存等
 * 通过设定的阈值来判断内存使用是否健康，防止内存泄漏和 OOM 错误
 */
@Injectable()
export class MemoryHealthIndicator {
  private readonly logger = new Logger(MemoryHealthIndicator.name)

  // 默认内存使用阈值配置（可通过配置服务注入自定义值）
  private readonly defaultThresholds = {
    /** 堆内存使用警告阈值（80%） */
    heapWarningThreshold: 0.8,
    /** 堆内存使用严重阈值（90%） */
    heapCriticalThreshold: 0.9,
    /** RSS内存使用警告阈值（85%） */
    rssWarningThreshold: 0.85,
    /** RSS内存使用严重阈值（95%） */
    rssCriticalThreshold: 0.95,
  }

  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  /**
   * 检查内存使用状况
   *
   * @param key 健康检查项的标识符
   * @param thresholds 可选的自定义阈值配置
   * @returns 内存健康检查结果
   *
   * @example
   * ```typescript
   * // 使用默认阈值
   * const result = await memoryIndicator.isHealthy('memory')
   *
   * // 使用自定义阈值
   * const result = await memoryIndicator.isHealthy('memory', {
   *   heapWarningThreshold: 0.7,
   *   heapCriticalThreshold: 0.85
   * })
   * ```
   */
  isHealthy(
    key: string,
    thresholds: Partial<typeof this.defaultThresholds> = {},
  ): Promise<HealthIndicatorResult> {
    const startTime = Date.now()
    const effectiveThresholds = { ...this.defaultThresholds, ...thresholds }

    return Promise.resolve().then(() => {
      // 获取内存使用信息
      const memoryUsage = process.memoryUsage()
      const responseTime = Date.now() - startTime

      // 构建内存资源信息
      const heapInfo = this.buildResourceInfo(memoryUsage.heapUsed, memoryUsage.heapTotal)
      const rssInfo = this.buildResourceInfo(memoryUsage.rss, this.estimateSystemMemory())
      const externalInfo = this.buildResourceInfo(
        memoryUsage.external,
        memoryUsage.external + 100 * 1024 * 1024, // 估算
      )

      // 判断整体健康状态
      const status = this.determineMemoryStatus(heapInfo, rssInfo, effectiveThresholds)
      const isHealthy = status === HealthStatus.UP

      const healthDetail: MemoryHealthDetailDto = {
        status,
        responseTime,
        message: this.generateStatusMessage(status, heapInfo, rssInfo),
        timestamp: new Date().toISOString(),
        heap: heapInfo,
        rss: rssInfo,
        external: externalInfo,
        metadata: {
          thresholds: effectiveThresholds,
          arrayBuffers: memoryUsage.arrayBuffers,
        },
      }

      this.logger.debug(`内存健康检查完成 - 状态: ${status}`, {
        operation: 'isHealthy',
        key,
        status,
        heapUsage: heapInfo.usage,
        rssUsage: rssInfo.usage,
      })

      return isHealthy
        ? this.healthIndicatorService.check(key).up({
            message: healthDetail.message,
            responseTime: healthDetail.responseTime,
            heapUsage: healthDetail.heap.usage,
            rssUsage: healthDetail.rss.usage,
          })
        : this.healthIndicatorService.check(key).down({
            message: healthDetail.message,
            responseTime: healthDetail.responseTime,
          })
    }).catch((error: unknown) => {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      const healthDetail: MemoryHealthDetailDto = {
        status: HealthStatus.UNKNOWN,
        responseTime,
        message: `内存检查失败: ${errorMessage}`,
        timestamp: new Date().toISOString(),
        heap: { total: 0, used: 0, free: 0, usage: 0 },
        rss: { total: 0, used: 0, free: 0, usage: 0 },
        external: { total: 0, used: 0, free: 0, usage: 0 },
        metadata: { error: errorMessage },
      }

      this.logger.error(`内存健康检查失败: ${errorMessage}`, {
        operation: 'isHealthy',
        key,
        error: errorMessage,
      })

      return this.healthIndicatorService.check(key).down({
        message: healthDetail.message,
        responseTime: healthDetail.responseTime,
        error: healthDetail.metadata?.error,
      })
    })
  }

  /**
   * 构建系统资源信息
   *
   * @description 将原始字节数转换为包含使用率等信息的资源对象
   *
   * @private
   */
  private buildResourceInfo(used: number, total: number): SystemResourceDto {
    const free = Math.max(0, total - used)
    const usage = total > 0 ? Number((used / total * 100).toFixed(2)) : 0

    return { total, used, free, usage }
  }

  /**
   * 估算系统总内存
   *
   * @description 由于 Node.js 的 process.memoryUsage() 不直接提供系统总内存
   * 这里使用一些启发式方法来估算，主要用于 RSS 内存的使用率计算
   *
   * @private
   */
  private estimateSystemMemory(): number {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
      const os = require('node:os') as typeof import('node:os')

      return os.totalmem()
    }
    catch {
      // 如果无法获取系统内存，使用默认估值（8GB）
      return 8 * 1024 * 1024 * 1024
    }
  }

  /**
   * 判断内存健康状态
   *
   * @description 基于堆内存和 RSS 内存使用率来判断整体健康状态
   * 优先考虑更严重的状态
   *
   * @private
   */
  private determineMemoryStatus(
    heap: SystemResourceDto,
    rss: SystemResourceDto,
    thresholds: typeof this.defaultThresholds,
  ): HealthStatus {
    const heapUsageRatio = heap.usage / 100
    const rssUsageRatio = rss.usage / 100

    // 检查严重阈值
    if (heapUsageRatio >= thresholds.heapCriticalThreshold
      || rssUsageRatio >= thresholds.rssCriticalThreshold) {
      return HealthStatus.DOWN
    }

    // 检查警告阈值
    if (heapUsageRatio >= thresholds.heapWarningThreshold
      || rssUsageRatio >= thresholds.rssWarningThreshold) {
      return HealthStatus.DEGRADED
    }

    return HealthStatus.UP
  }

  /**
   * 生成状态描述消息
   *
   * @description 根据当前内存使用情况生成人类可读的状态描述
   *
   * @private
   */
  private generateStatusMessage(
    status: HealthStatus,
    heap: SystemResourceDto,
    rss: SystemResourceDto,
  ): string {
    const heapMB = Math.round(heap.used / 1024 / 1024)
    const rssMB = Math.round(rss.used / 1024 / 1024)

    switch (status) {
      case HealthStatus.UP:
        return `内存使用正常 - 堆内存: ${heapMB}MB (${heap.usage}%), RSS: ${rssMB}MB (${rss.usage}%)`

      case HealthStatus.DEGRADED:
        return `内存使用偏高 - 堆内存: ${heapMB}MB (${heap.usage}%), RSS: ${rssMB}MB (${rss.usage}%)`

      case HealthStatus.DOWN:
        return `内存使用严重 - 堆内存: ${heapMB}MB (${heap.usage}%), RSS: ${rssMB}MB (${rss.usage}%)`

      default:
        return '内存状态未知'
    }
  }
}
