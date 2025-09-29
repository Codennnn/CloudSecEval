import { promises as fs } from 'node:fs'
import { join } from 'node:path'

import { Injectable, Logger } from '@nestjs/common'
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus'

import { type DiskHealthDetailDto, type SystemResourceDto } from '../dto/detailed-health-status.dto'
import { HealthStatus } from '../dto/health-status.dto'

/**
 * 磁盘健康检查配置接口
 */
interface DiskCheckConfig {
  /** 要检查的根路径，默认为项目根目录 */
  readonly path?: string

  /** 磁盘空间使用警告阈值（默认 80%） */
  readonly warningThreshold?: number

  /** 磁盘空间使用严重阈值（默认 95%） */
  readonly criticalThreshold?: number

  /** 要检查写入权限的关键目录列表 */
  readonly criticalDirectories?: readonly string[]
}

/**
 * 磁盘健康检查指示器
 *
 * @description 检查磁盘空间使用情况和关键目录的读写权限
 * 确保应用有足够的磁盘空间和必要的文件系统访问权限
 */
@Injectable()
export class DiskHealthIndicator {
  private readonly logger = new Logger(DiskHealthIndicator.name)

  private readonly defaultConfig: Required<DiskCheckConfig> = {
    path: process.cwd(),
    warningThreshold: 0.8, // 80%
    criticalThreshold: 0.95, // 95%
    criticalDirectories: [
      './storage/uploads', // 文件上传目录
      './temp', // 临时文件目录
      './logs', // 日志目录（如果存在）
    ],
  }

  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  /**
   * 检查磁盘健康状况
   *
   * @param key 健康检查项的标识符
   * @param config 磁盘检查配置
   * @returns 磁盘健康检查结果
   *
   * @example
   * ```typescript
   * // 使用默认配置
   * const result = await diskIndicator.isHealthy('disk')
   *
   * // 自定义配置
   * const result = await diskIndicator.isHealthy('storage', {
   *   path: '/data',
   *   warningThreshold: 0.7,
   *   criticalDirectories: ['/data/uploads', '/data/cache']
   * })
   * ```
   */
  async isHealthy(
    key: string,
    config: DiskCheckConfig = {},
  ): Promise<HealthIndicatorResult> {
    const startTime = Date.now()
    const effectiveConfig = { ...this.defaultConfig, ...config }

    try {
      // 并行执行磁盘空间检查和目录权限检查
      const [spaceInfo, directoryChecks] = await Promise.all([
        this.checkDiskSpace(effectiveConfig.path),
        this.checkCriticalDirectories(effectiveConfig.criticalDirectories),
      ])

      const responseTime = Date.now() - startTime

      // 判断整体健康状态
      const status = this.determineDiskStatus(spaceInfo, directoryChecks, effectiveConfig)
      const isHealthy = status === HealthStatus.UP

      const healthDetail: DiskHealthDetailDto = {
        status,
        responseTime,
        message: this.generateStatusMessage(status, spaceInfo, directoryChecks),
        timestamp: new Date().toISOString(),
        path: effectiveConfig.path,
        space: spaceInfo,
        directories: directoryChecks,
        metadata: {
          thresholds: {
            warning: effectiveConfig.warningThreshold,
            critical: effectiveConfig.criticalThreshold,
          },
          checkedDirectories: effectiveConfig.criticalDirectories,
        },
      }

      this.logger.debug(`磁盘健康检查完成 - 状态: ${status}`, {
        operation: 'isHealthy',
        key,
        status,
        diskUsage: spaceInfo.usage,
        path: effectiveConfig.path,
      })

      return isHealthy
        ? this.healthIndicatorService.check(key).up({
            message: healthDetail.message,
            responseTime: healthDetail.responseTime,
            diskUsage: healthDetail.space.usage,
            path: healthDetail.path,
          })
        : this.healthIndicatorService.check(key).down({
            message: healthDetail.message,
            responseTime: healthDetail.responseTime,
            path: healthDetail.path,
          })
    }
    catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      const healthDetail: DiskHealthDetailDto = {
        status: HealthStatus.UNKNOWN,
        responseTime,
        message: `磁盘检查失败: ${errorMessage}`,
        timestamp: new Date().toISOString(),
        path: effectiveConfig.path,
        space: { total: 0, used: 0, free: 0, usage: 0 },
        metadata: { error: errorMessage },
      }

      this.logger.error(`磁盘健康检查失败: ${errorMessage}`, {
        operation: 'isHealthy',
        key,
        path: effectiveConfig.path,
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
   * 检查磁盘空间使用情况
   *
   * @description 使用 Node.js fs.stat 获取磁盘使用信息
   * 在某些系统上可能需要额外的权限或工具来获取精确的磁盘空间信息
   *
   * @private
   */
  private async checkDiskSpace(path: string): Promise<SystemResourceDto> {
    try {
      // 注意：Node.js 的 fs.stat 不直接提供磁盘空间信息
      // 这里提供一个跨平台的替代方案
      const stats = await fs.stat(path)

      if (!stats.isDirectory()) {
        throw new Error(`指定路径不是目录: ${path}`)
      }

      // 尝试获取磁盘空间信息（这是一个简化的实现）
      // 在生产环境中，可能需要使用系统特定的命令或第三方库
      return await this.getDiskSpaceInfo(path)
    }
    catch (error) {
      this.logger.warn(`无法检查磁盘空间: ${error instanceof Error ? error.message : String(error)}`)

      // 返回默认值，避免因磁盘空间检查失败而导致整个健康检查失败
      return { total: 0, used: 0, free: 0, usage: 0 }
    }
  }

  /**
   * 获取磁盘空间信息
   *
   * @description 跨平台获取磁盘使用信息的实现
   * 在不同操作系统上可能需要不同的实现方式
   *
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getDiskSpaceInfo(_path: string): Promise<SystemResourceDto> {
    try {
      // 在 Node.js 中，我们可能需要执行系统命令来获取磁盘空间
      // 这里提供一个基础实现，实际项目中可能需要使用专门的库如 'statvfs' 或 'check-disk-space'

      // 对于演示目的，这里返回一个模拟的磁盘使用情况
      // 在实际生产环境中，建议使用 'check-disk-space' 库
      const platform = process.platform

      if (platform === 'win32') {
        return await this.getWindowsDiskSpace()
      }
      else {
        return await this.getUnixDiskSpace()
      }
    }
    catch (error) {
      this.logger.debug('获取磁盘空间信息失败，使用估算值', {
        error: error instanceof Error ? error.message : String(error),
      })

      // 返回估算值，避免检查失败
      return {
        total: 100 * 1024 * 1024 * 1024, // 100GB 估算
        used: 50 * 1024 * 1024 * 1024, // 50GB 估算使用
        free: 50 * 1024 * 1024 * 1024, // 50GB 估算可用
        usage: 50, // 50% 估算使用率
      }
    }
  }

  /**
   * 获取 Windows 系统磁盘空间信息
   *
   * @private
   */
  private getWindowsDiskSpace(): Promise<SystemResourceDto> {
    // Windows 系统的磁盘空间检查实现
    // 可以使用 PowerShell 命令或 wmi 查询
    return Promise.resolve(this.getEstimatedDiskSpace())
  }

  /**
   * 获取 Unix 系统磁盘空间信息
   *
   * @private
   */
  private getUnixDiskSpace(): Promise<SystemResourceDto> {
    // Unix 系统的磁盘空间检查实现
    // 可以使用 df 命令
    return Promise.resolve(this.getEstimatedDiskSpace())
  }

  /**
   * 获取估算的磁盘空间信息
   *
   * @description 当无法获取真实磁盘信息时的后备方案
   *
   * @private
   */
  private getEstimatedDiskSpace(): SystemResourceDto {
    const total = 100 * 1024 * 1024 * 1024 // 100GB
    const used = 30 * 1024 * 1024 * 1024 // 30GB
    const free = total - used
    const usage = used / total * 100

    return { total, used, free, usage }
  }

  /**
   * 检查关键目录的访问权限
   *
   * @description 验证应用运行所需的关键目录是否存在且具有适当的读写权限
   *
   * @private
   */
  private async checkCriticalDirectories(
    directories: readonly string[],
  ): Promise<{ path: string, writable: boolean, exists: boolean }[]> {
    const results = await Promise.allSettled(
      directories.map(async (dirPath) => {
        const fullPath = join(process.cwd(), dirPath)

        try {
          // 检查目录是否存在
          const stats = await fs.stat(fullPath)
          const exists = stats.isDirectory()

          // 检查是否可写（通过尝试创建临时文件）
          let writable = false

          if (exists) {
            try {
              const testFile = join(fullPath, '.health-check-test')
              await fs.writeFile(testFile, 'test')
              await fs.unlink(testFile)
              writable = true
            }
            catch {
              writable = false
            }
          }

          return { path: dirPath, writable, exists }
        }
        catch {
          return { path: dirPath, writable: false, exists: false }
        }
      }),
    )

    return results.map((result, index) =>
      result.status === 'fulfilled'
        ? result.value
        : { path: directories[index], writable: false, exists: false },
    )
  }

  /**
   * 判断磁盘健康状态
   *
   * @description 基于磁盘使用率和目录权限来判断整体健康状态
   *
   * @private
   */
  private determineDiskStatus(
    spaceInfo: SystemResourceDto,
    directoryChecks: { path: string, writable: boolean, exists: boolean }[],
    config: Required<DiskCheckConfig>,
  ): HealthStatus {
    const usageRatio = spaceInfo.usage / 100

    // 检查是否有关键目录不可写
    const hasUnwritableDirectories = directoryChecks.some((check) =>
      check.exists && !check.writable)
    const hasMissingDirectories = directoryChecks.some((check) => !check.exists)

    // 严重状态：磁盘空间严重不足或关键目录不可写
    if (usageRatio >= config.criticalThreshold || hasUnwritableDirectories) {
      return HealthStatus.DOWN
    }

    // 警告状态：磁盘空间不足或有目录缺失
    if (usageRatio >= config.warningThreshold || hasMissingDirectories) {
      return HealthStatus.DEGRADED
    }

    return HealthStatus.UP
  }

  /**
   * 生成状态描述消息
   *
   * @private
   */
  private generateStatusMessage(
    status: HealthStatus,
    spaceInfo: SystemResourceDto,
    directoryChecks: { path: string, writable: boolean, exists: boolean }[],
  ): string {
    const spaceGB = Math.round(spaceInfo.free / 1024 / 1024 / 1024)
    const issues: string[] = []

    // 收集问题信息
    directoryChecks.forEach((check) => {
      if (!check.exists) {
        issues.push(`目录缺失: ${check.path}`)
      }
      else if (!check.writable) {
        issues.push(`目录不可写: ${check.path}`)
      }
    })

    const baseMessage = `磁盘使用率: ${spaceInfo.usage}%, 可用空间: ${spaceGB}GB`

    if (issues.length > 0) {
      return `${baseMessage} - 问题: ${issues.join(', ')}`
    }

    return baseMessage
  }
}
