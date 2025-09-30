import { Controller, Get, Logger, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { HealthCheck } from '@nestjs/terminus'
import { SkipThrottle } from '@nestjs/throttler'

import { HEALTH_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'

import { DetailedHealthCheckResponseDto } from './dto/detailed-health-status.dto'
import { HealthCheckResponseDto } from './dto/health-status.dto'
import { HealthAggregatorService } from './services/health-aggregator.service'

/**
 * 健康检查控制器
 *
 * @description 提供多层级的健康检查 HTTP 端点
 * 支持基础健康检查、就绪检查、存活检查和详细健康报告
 */
@Controller('health')
@ApiTags('健康检查')
@SkipThrottle()
export class HealthController {
  private readonly logger = new Logger(HealthController.name)

  constructor(
    private readonly healthAggregatorService: HealthAggregatorService,
  ) {}

  /**
   * 基础健康检查
   *
   * @description 快速检查应用基本状态，主要用于容器编排器
   * 返回整体健康状态和各组件的基本信息
   *
   * @param timeout 可选的超时参数（毫秒）
   * @returns 标准健康检查响应
   */
  @Get()
  @HealthCheck()
  @ApiDocs(HEALTH_API_CONFIG.checkHealth)
  @ApiQuery({
    name: 'timeout',
    required: false,
    type: Number,
    description: '检查超时时间（毫秒），默认 10000',
    example: 5000,
  })
  async checkHealth(
    @Query('timeout') timeout?: string,
  ): Promise<HealthCheckResponseDto> {
    const timeoutMs = timeout ? Number.parseInt(timeout, 10) : undefined

    this.logger.debug('执行基础健康检查', {
      operation: 'checkHealth',
      timeout: timeoutMs,
    })

    const config = timeoutMs ? { timeout: timeoutMs } : {}

    return await this.healthAggregatorService.performHealthCheck(config)
  }

  /**
   * 就绪检查
   *
   * @description 检查应用是否准备好接收流量
   * 主要用于负载均衡器和容器编排器的就绪探针
   *
   * @returns 就绪状态检查结果
   */
  @Get('readiness')
  @HealthCheck()
  @ApiDocs(HEALTH_API_CONFIG.checkReadiness)
  async checkReadiness(): Promise<HealthCheckResponseDto> {
    this.logger.debug('执行就绪检查', { operation: 'checkReadiness' })

    // 就绪检查通常比基础检查更严格
    // 确保所有关键服务都可用才认为应用就绪
    const config = {
      enableDatabase: true,
      enableMemory: true,
      enableDisk: true,
      timeout: 8000, // 稍短的超时时间
    }

    return await this.healthAggregatorService.performHealthCheck(config)
  }

  /**
   * 存活检查
   *
   * @description 检查应用进程是否存活
   * 主要用于容器编排器决定是否需要重启容器
   *
   * @returns 存活状态检查结果
   */
  @Get('liveness')
  @HealthCheck()
  @ApiDocs(HEALTH_API_CONFIG.checkLiveness)
  async checkLiveness(): Promise<HealthCheckResponseDto> {
    this.logger.debug('执行存活检查', { operation: 'checkLiveness' })

    // 存活检查主要关注应用本身的运行状态
    // 外部依赖的短暂不可用不应影响存活状态
    const config = {
      enableDatabase: false, // 数据库短暂不可用不应导致重启
      enableMemory: true, // 内存问题可能需要重启
      enableDisk: true, // 磁盘问题可能需要重启
      timeout: 5000, // 更短的超时时间
    }

    return await this.healthAggregatorService.performHealthCheck(config)
  }

  /**
   * 详细健康报告
   *
   * @description 提供详细的系统健康状态和性能指标
   * 主要用于运维监控、故障排查和系统性能分析
   *
   * @param includePerformance 是否包含性能指标
   * @returns 详细健康检查响应
   */
  @Get('detailed')
  @ApiDocs(HEALTH_API_CONFIG.getDetailedHealth)
  @ApiQuery({
    name: 'performance',
    required: false,
    type: Boolean,
    description: '是否包含性能指标，默认 true',
    example: true,
  })
  async getDetailedHealth(
    @Query('performance') includePerformance?: string,
  ): Promise<DetailedHealthCheckResponseDto> {
    const includePerf = includePerformance !== 'false' // 默认为 true

    this.logger.debug('执行详细健康检查', {
      operation: 'getDetailedHealth',
      includePerformance: includePerf,
    })

    const config = {
      enableDatabase: true,
      enableMemory: true,
      enableDisk: true,
      includePerformanceMetrics: includePerf,
      timeout: 15000, // 更长的超时时间，因为要收集更多信息
    }

    return await this.healthAggregatorService.performDetailedHealthCheck(config)
  }

  /**
   * 数据库专项检查
   *
   * @description 专门检查数据库连接状态和性能
   * 用于数据库相关的故障排查
   *
   * @returns 数据库健康检查结果
   */
  @Get('database')
  @HealthCheck()
  @ApiDocs(HEALTH_API_CONFIG.checkDatabase)
  async checkDatabase(): Promise<HealthCheckResponseDto> {
    this.logger.debug('执行数据库专项检查', { operation: 'checkDatabase' })

    const config = {
      enableDatabase: true,
      enableMemory: false,
      enableDisk: false,
      timeout: 10000,
    }

    return await this.healthAggregatorService.performHealthCheck(config)
  }

  /**
   * 系统资源检查
   *
   * @description 专门检查系统资源使用情况（内存、磁盘）
   * 用于资源使用监控和容量规划
   *
   * @returns 系统资源检查结果
   */
  @Get('resources')
  @HealthCheck()
  @ApiDocs(HEALTH_API_CONFIG.checkResources)
  async checkResources(): Promise<HealthCheckResponseDto> {
    this.logger.debug('执行系统资源检查', { operation: 'checkResources' })

    const config = {
      enableDatabase: false,
      enableMemory: true,
      enableDisk: true,
      timeout: 8000,
    }

    return await this.healthAggregatorService.performHealthCheck(config)
  }
}
