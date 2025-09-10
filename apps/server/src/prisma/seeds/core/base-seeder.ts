import { consola } from 'consola'

import type { PrismaClient } from '#prisma/client'

import type { ISeeder, SeederOptions, SeederResult } from './types'

/**
 * 种子脚本基类
 * 提供通用的种子脚本功能和标准化接口
 */
export abstract class BaseSeeder implements ISeeder {
  abstract readonly name: string
  abstract readonly dependencies: string[]

  constructor(protected readonly prisma: PrismaClient) {}

  /**
   * 抽象方法：实际的种子数据生成逻辑
   */
  protected abstract doSeed(options?: SeederOptions): Promise<SeederResult>

  /**
   * 抽象方法：实际的清理逻辑
   */
  protected abstract doClean(options?: SeederOptions): Promise<SeederResult>

  /**
   * 抽象方法：数据统计
   */
  abstract getStats(): Promise<Record<string, number>>

  /**
   * 执行种子数据生成（带通用错误处理和日志）
   */
  async seed(options: SeederOptions = {}): Promise<SeederResult> {
    const startTime = Date.now()

    try {
      consola.start(`开始执行 ${this.name} 种子脚本...`)

      // 检查数据库连接
      await this.checkConnection()

      // 执行前置验证
      if (!options.force) {
        const shouldProceed = await this.preValidation(options)

        if (!shouldProceed) {
          return {
            success: false,
            message: `${this.name}: 前置验证失败，已跳过执行`,
          }
        }
      }

      // 执行实际的种子逻辑
      const result = await this.doSeed(options)

      // 执行后置验证
      if (result.success && !options.skipValidation) {
        const isValid = await this.validate()

        if (!isValid) {
          consola.warn(`${this.name}: 后置验证失败，但数据已生成`)
        }
      }

      const duration = Date.now() - startTime

      if (result.success) {
        consola.success(`${this.name} 种子脚本执行完成 (${duration}ms)`)
      }
      else {
        consola.error(`${this.name} 种子脚本执行失败 (${duration}ms)`)
      }

      return result
    }
    catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      consola.error(`${this.name} 种子脚本执行异常 (${duration}ms): ${errorMessage}`)

      return {
        success: false,
        message: `${this.name}: 执行异常`,
        error: errorMessage,
      }
    }
  }

  /**
   * 清理种子数据（带通用错误处理和日志）
   */
  async clean(options: SeederOptions = {}): Promise<SeederResult> {
    const startTime = Date.now()

    try {
      consola.start(`开始清理 ${this.name} 种子数据...`)

      await this.checkConnection()

      const result = await this.doClean(options)

      const duration = Date.now() - startTime

      if (result.success) {
        consola.success(`${this.name} 种子数据清理完成 (${duration}ms)`)
      }
      else {
        consola.error(`${this.name} 种子数据清理失败 (${duration}ms)`)
      }

      return result
    }
    catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      consola.error(`${this.name} 种子数据清理异常 (${duration}ms): ${errorMessage}`)

      return {
        success: false,
        message: `${this.name}: 清理异常`,
        error: errorMessage,
      }
    }
  }

  /**
   * 默认的验证实现（子类可以重写）
   */
  async validate(): Promise<boolean> {
    try {
      const stats = await this.getStats()

      return Object.values(stats).some((count) => count > 0)
    }
    catch {
      return false
    }
  }

  /**
   * 前置验证（子类可以重写）
   */
  protected async preValidation(options: SeederOptions): Promise<boolean> {
    // 如果数据已存在且不是强制模式，询问是否继续
    const stats = await this.getStats()
    const hasExistingData = Object.values(stats).some((count) => count > 0)

    if (hasExistingData && !options.force) {
      consola.info(`${this.name}: 检测到已有数据存在`)

      // 在实际项目中，这里可以添加交互式确认
      return true // 暂时直接继续
    }

    return true
  }

  /**
   * 检查数据库连接
   */
  protected async checkConnection(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
    }
    catch (error) {
      throw new Error(`数据库连接失败: ${String(error)}`)
    }
  }

  /**
   * 通用的事务包装器
   */
  protected async withTransaction<T>(
    operation: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>,
  ): Promise<T> {
    return await this.prisma.$transaction(operation, {
      timeout: 30000,
      maxWait: 5000,
    })
  }

  /**
   * 通用的日志方法
   */
  protected log(message: string, type: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
    const prefix = `[${this.name}]`

    switch (type) {
      case 'info':
        consola.info(`${prefix} ${message}`)
        break

      case 'warn':
        consola.warn(`${prefix} ${message}`)
        break

      case 'error':
        consola.error(`${prefix} ${message}`)
        break

      case 'success':
        consola.success(`${prefix} ${message}`)
        break
    }
  }
}
