import { consola } from 'consola'

import type { Prisma, PrismaClient } from '#prisma/client'

/**
 * 数据工厂基类 - 提供通用的数据生成能力
 * 确保所有工厂都有统一的错误处理和重试机制
 */
export abstract class BaseFactory<T = Record<string, unknown>> {
  protected readonly maxRetries = 3
  protected readonly batchSize = 10

  constructor(protected readonly prisma: PrismaClient) {}

  /**
   * 抽象方法：生成单条数据
   */
  protected abstract generateSingle(overrides?: Partial<T>): Promise<T>

  /**
   * 抽象方法：验证数据完整性
   */
  protected abstract validateData(data: T): Promise<boolean>

  /**
   * 通用的批量创建方法，具备完整的错误处理和重试机制
   */
  async createBatch(count: number, overrides?: Partial<T>[]): Promise<T[]> {
    const results: T[] = []
    const errors: { index: number, error: unknown }[] = []

    consola.info(`开始批量创建 ${count} 条数据...`)

    // 分批处理，避免内存压力
    for (let i = 0; i < count; i += this.batchSize) {
      const currentBatchSize = Math.min(this.batchSize, count - i)
      const batchResults = await this.processBatch(
        currentBatchSize,
        i,
        overrides?.slice(i, i + currentBatchSize),
      )

      results.push(...batchResults.success)
      errors.push(...batchResults.errors.map((e) => ({ ...e, index: e.index + i })))

      // 显示进度
      const progress = Math.round((i + currentBatchSize) / count * 100)
      consola.info(`进度: ${progress}% (${i + currentBatchSize}/${count})`)
    }

    // 报告结果
    if (errors.length > 0) {
      consola.warn(`批量创建完成，成功: ${results.length}, 失败: ${errors.length}`)
      this.logErrors(errors)
    }
    else {
      consola.success(`批量创建完成，成功创建 ${results.length} 条数据`)
    }

    return results
  }

  /**
   * 处理单个批次
   */
  private async processBatch(
    batchSize: number,
    offset: number,
    overrides?: Partial<T>[],
  ): Promise<{
    success: T[]
    errors: { index: number, error: unknown }[]
  }> {
    const success: T[] = []
    const errors: { index: number, error: unknown }[] = []

    // 并发处理批次内的数据，但限制并发数量
    const promises = Array.from({ length: batchSize }, async (_, index) => {
      const override = overrides?.[index]
      const actualIndex = index

      try {
        const data = await this.createWithRetry(override)

        return { type: 'success' as const, data, index: actualIndex }
      }
      catch (error: unknown) {
        return { type: 'error' as const, error, index: actualIndex }
      }
    })

    const results = await Promise.allSettled(promises)

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.type === 'success') {
          success.push(result.value.data)
        }
        else {
          errors.push({
            index: result.value.index,
            error: result.value.error,
          })
        }
      }
      else {
        errors.push({
          index,
          error: result.reason,
        })
      }
    })

    return { success, errors }
  }

  /**
   * 带重试机制的创建方法
   */
  private async createWithRetry(overrides?: Partial<T>): Promise<T> {
    let lastError: unknown

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const data = await this.generateSingle(overrides)

        // 验证数据完整性
        const isValid = await this.validateData(data)

        if (!isValid) {
          throw new Error('数据验证失败')
        }

        return data
      }
      catch (error) {
        lastError = error

        if (attempt < this.maxRetries) {
          // 指数退避重试
          const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 1000
          await this.sleep(delay)
          const errorMessage = error instanceof Error ? error.message : String(error)
          consola.debug(`第 ${attempt} 次尝试失败，${delay}ms 后重试：${errorMessage}`)
        }
      }
    }

    throw new Error(
      `创建数据失败，已重试 ${this.maxRetries} 次。最后错误：${String(lastError)}`,
    )
  }

  /**
   * 生成唯一值的辅助方法
   */
  protected async generateUniqueValue<V>(
    generator: () => V,
    checker: (value: V) => Promise<boolean>,
    maxAttempts = 50,
  ): Promise<V> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const value = generator()
      const exists = await checker(value)

      if (!exists) {
        return value
      }

      if (attempt === maxAttempts) {
        throw new Error(`无法生成唯一值，已尝试 ${maxAttempts} 次`)
      }
    }

    throw new Error('生成唯一值失败')
  }

  /**
   * 记录错误详情
   */
  private logErrors(errors: { index: number, error: unknown }[]): void {
    consola.error('创建过程中发生的错误:')
    errors.forEach(({ index, error }) => {
      consola.error(`  索引 ${index}: ${String(error)}`)
    })
  }

  /**
   * 延迟工具方法
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 安全的事务包装器
   */
  protected async withTransaction<R>(
    operation: (tx: Prisma.TransactionClient) => Promise<R>,
  ): Promise<R> {
    const maxTransactionRetries = 3
    let lastError: unknown

    for (let attempt = 1; attempt <= maxTransactionRetries; attempt++) {
      try {
        return await this.prisma.$transaction(operation, {
          timeout: 30000, // 30秒超时
          maxWait: 5000, // 最大等待5秒
        })
      }
      catch (error) {
        lastError = error

        if (attempt < maxTransactionRetries) {
          const delay = Math.pow(2, attempt) * 1000
          await this.sleep(delay)
          consola.warn(`事务第 ${attempt} 次尝试失败，${delay}ms 后重试`)
        }
      }
    }

    throw new Error(
      `事务执行失败，已重试 ${maxTransactionRetries} 次。错误: ${String(lastError)}`,
    )
  }

  /**
   * 检查数据库连接状态
   */
  protected async checkDatabaseConnection(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
    }
    catch (err) {
      throw new Error(`数据库连接失败: ${String(err)}`)
    }
  }
}
