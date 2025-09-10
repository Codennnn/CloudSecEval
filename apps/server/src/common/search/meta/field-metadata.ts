import type { Prisma } from '#prisma/client'

/**
 * 通用字段数据类型
 */
export type FieldDataType = 'string' | 'boolean' | 'date' | 'number' | 'decimal' | 'enum' | 'unknown'

/**
 * 通用字段搜索配置接口
 */
export interface BaseFieldSearchConfig {
  /** 字段数据类型 */
  type: FieldDataType
  /** 是否参与全局搜索 */
  global: boolean
  /** 是否可排序 */
  sortable: boolean
  /** 是否可搜索 */
  searchable: boolean
  /** 是否需要特殊处理（关联查询等） */
  special?: boolean
}

/**
 * 从实体类型推导字段的数据类型
 * 通用类型推导工具，支持各种常见类型
 */
export type InferFieldType<T> = T extends string
  ? 'string'
  : T extends boolean
    ? 'boolean'
    : T extends Date
      ? 'date'
      : T extends number
        ? 'number'
        : T extends Prisma.Decimal
          ? 'decimal'
          : T extends string & { __brand: unknown } // 枚举类型的兼容处理
            ? 'enum'
            : 'unknown'

/**
 * 字段配置管理器
 * 提供字段元数据的统一管理和能力提取
 */
export class FieldConfigManager<TConfig extends Record<string, BaseFieldSearchConfig>> {
  private readonly config: TConfig
  private readonly extendedConfig: Record<string, BaseFieldSearchConfig>
  private readonly allConfig: TConfig & Record<string, BaseFieldSearchConfig>

  constructor(
    config: TConfig,
    extendedConfig: Record<string, BaseFieldSearchConfig> = {},
  ) {
    this.config = config
    this.extendedConfig = extendedConfig
    this.allConfig = { ...config, ...extendedConfig }
  }

  /**
   * 从字段配置中提取指定能力的字段列表
   */
  extractFieldsByCapability(capability: keyof BaseFieldSearchConfig): string[] {
    return Object.keys(this.allConfig).filter(
      (key) => this.allConfig[key][capability] === true,
    )
  }

  /**
   * 获取全局搜索字段
   */
  getGlobalSearchFields(): string[] {
    return this.extractFieldsByCapability('global')
  }

  /**
   * 获取可排序字段
   */
  getSortableFields(): string[] {
    return this.extractFieldsByCapability('sortable')
  }

  /**
   * 获取可搜索字段
   */
  getSearchableFields(): string[] {
    return this.extractFieldsByCapability('searchable')
  }

  /**
   * 获取特殊字段（需要特殊处理的字段）
   */
  getSpecialFields(): string[] {
    return this.extractFieldsByCapability('special')
  }

  /**
   * 获取字段配置
   */
  getFieldConfig(field: string): BaseFieldSearchConfig | undefined {
    return this.allConfig[field]
  }

  /**
   * 获取所有字段配置
   */
  getAllConfig(): TConfig & Record<string, BaseFieldSearchConfig> {
    return this.allConfig
  }

  /**
   * 检查字段是否具有指定能力
   */
  hasCapability(field: string, capability: keyof BaseFieldSearchConfig): boolean {
    const config = this.getFieldConfig(field)

    return config ? config[capability] === true : false
  }
}

/**
 * 创建字段配置管理器的工厂函数
 */
export function createFieldConfigManager<TConfig extends Record<string, BaseFieldSearchConfig>>(
  config: TConfig,
  extendedConfig: Record<string, BaseFieldSearchConfig> = {},
): FieldConfigManager<TConfig> {
  return new FieldConfigManager(config, extendedConfig)
}

/**
 * 根据字段类型和值构建简单搜索条件
 */
export function buildSimpleCondition(
  fieldType: FieldDataType,
  value: unknown,
): Record<string, unknown> | string | number | boolean | Date | null {
  if (value === null || value === undefined) {
    return null
  }

  switch (fieldType) {
    case 'string':
      if (typeof value === 'string') {
        return {
          contains: value,
          mode: 'insensitive',
        }
      }

      break

    case 'boolean':
      if (typeof value === 'boolean') {
        return value
      }

      break

    case 'date':
      if (value instanceof Date) {
        return value
      }

      break

    case 'number':

      // fallthrough
    case 'decimal':
      if (typeof value === 'number') {
        return value
      }

      break

    case 'enum':
      if (typeof value === 'string') {
        return value
      }

      break

    default:
      // 对于未知类型，返回 null
      return null
  }

  return null
}

/**
 * 检查值是否为操作符对象（用于高级搜索）
 */
export function isOperatorValue(value: unknown): boolean {
  return (
    value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && !(value instanceof Date)
  )
}

/**
 * 检查值是否为简单值（用于基础搜索）
 */
export function isSimpleValue(value: unknown): boolean {
  return (
    value !== null
    && value !== undefined
    && (!isOperatorValue(value) || value instanceof Date)
  )
}
