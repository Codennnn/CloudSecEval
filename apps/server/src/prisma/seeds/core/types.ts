/**
 * 种子脚本核心类型定义
 */

export type Environment = 'development' | 'production' | 'test'

export interface SeederConfig {
  environment: Environment
  silent?: boolean
  skipValidation?: boolean
}

export interface SeederResult {
  success: boolean
  message: string
  data?: {
    created: number
    existing: number
    updated?: number
  }
  error?: string
}

export interface SeederOptions {
  force?: boolean
  clean?: boolean
  count?: number
  includePresets?: boolean
  logsPerLicense?: number
  generateRealistic?: boolean
  realisticDays?: number
  preserveAdmin?: boolean
  skipValidation?: boolean
}

/**
 * 种子脚本基础接口
 */
export interface ISeeder {
  readonly name: string
  readonly dependencies: string[]

  /**
   * 执行种子数据生成
   */
  seed(options?: SeederOptions): Promise<SeederResult>

  /**
   * 清理种子数据
   */
  clean(options?: SeederOptions): Promise<SeederResult>

  /**
   * 验证种子数据完整性
   */
  validate(): Promise<boolean>

  /**
   * 获取当前数据统计
   */
  getStats(): Promise<Record<string, number>>
}

/**
 * 通用种子脚本接口，包含所有可能的方法
 */
export type IGenericSeeder = ISeeder

/**
 * 编排器配置
 */
export interface OrchestratorConfig {
  environment: Environment
  seeders?: string[]
  skipValidation?: boolean
  parallel?: boolean
}

/**
 * 编排器执行结果
 */
export interface OrchestratorResult {
  success: boolean
  duration: number
  results: Record<string, SeederResult>
  error?: string
}
