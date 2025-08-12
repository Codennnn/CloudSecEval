/**
 * 高级搜索配置器类型定义
 *
 * 定义了搜索字段、条件、配置等核心类型
 * 支持多种数据类型和操作符的搜索条件构建
 */

import type { FieldTypeEnum } from '~/constants/form'

// 支持的搜索模式
export type SearchMode = 'global' | 'exact' | 'combined' | 'advanced'

// 排序方向
export type SortOrder = 'asc' | 'desc'

// 逻辑运算符
export type LogicalOperator = 'and' | 'or'

// 字符串操作符
export type StringOperator =
  | 'eq' | 'neq' | 'in' | 'notIn' | 'contains'
  | 'startsWith' | 'endsWith' | 'regex' | 'ilike'
  | 'isNull' | 'isNotNull'

// 数值操作符
export type NumberOperator =
  | 'eq' | 'neq' | 'in' | 'notIn' | 'gt' | 'gte'
  | 'lt' | 'lte' | 'between' | 'isNull' | 'isNotNull'

// 日期操作符
export type DateOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'between' | 'isNull' | 'isNotNull'

// 布尔操作符
export type BooleanOperator = 'eq' | 'neq' | 'isNull' | 'isNotNull'

// 枚举操作符
export type EnumOperator = 'eq' | 'neq' | 'in' | 'notIn' | 'isNull' | 'isNotNull'

// 所有操作符的联合类型
export type SearchOperator =
  | StringOperator
  | NumberOperator
  | DateOperator
  | BooleanOperator
  | EnumOperator

/**
 * 搜索字段定义
 */
export interface SearchField {
  /** 字段键名 */
  key: string
  /** 字段显示标签 */
  label: string
  /** 字段数据类型 */
  type: FieldTypeEnum
  /** 枚举选项（仅当 type 为 'enum' 时需要） */
  options?: { value: string, label: string }[]
  /** 字段描述 */
  description?: string
  /** 是否必填 */
  required?: boolean
  /** 字段分组 */
  group?: string
}

/**
 * 搜索条件
 */
export interface SearchCondition {
  /** 条件唯一标识 */
  id: string
  /** 字段键名 */
  field: string
  /** 操作符 */
  operator: SearchOperator
  /** 搜索值 */
  value:
    | string
    | number
    | boolean
    | Date
    | string[]
    | number[]
    | [string | number, string | number]
    | null
    | undefined
  /** 与下一个条件的逻辑运算符 */
  logicalOperator?: LogicalOperator
  /** 是否启用该条件 */
  enabled?: boolean
}



/**
 * 搜索配置
 */
export interface SearchConfig {
  /** 搜索条件列表 */
  conditions: SearchCondition[]
  /** 全局搜索关键词 */
  globalSearch?: string
  /** 搜索模式 */
  searchMode?: SearchMode
  /** 排序字段 */
  sortBy?: string
  /** 排序方向 */
  sortOrder?: SortOrder

  /** 条件间的默认逻辑运算符 */
  defaultLogicalOperator?: LogicalOperator
}

/**
 * 操作符配置
 */
export interface OperatorConfig {
  /** 操作符值 */
  value: SearchOperator
  /** 操作符显示标签 */
  label: string
  /** 操作符描述 */
  description?: string
  /** 是否需要输入值 */
  requiresValue: boolean
  /** 是否需要数组值 */
  requiresArray?: boolean
  /** 是否需要范围值 */
  requiresRange?: boolean
  /** 支持的字段类型 */
  supportedTypes: FieldTypeEnum[]
}

/**
 * 查询参数接口
 */
export type QueryParams = Record<string,
  | string
  | string[]
  | number
  | number[]
  | boolean
  | Date
  | [string | number, string | number]
  | null
  | undefined
>

/**
 * 搜索历史记录
 */
export interface SearchHistory {
  /** 历史记录ID */
  id: string
  /** 搜索配置 */
  config: SearchConfig
  /** 创建时间 */
  createdAt: Date
  /** 搜索名称 */
  name?: string
  /** 搜索描述 */
  description?: string
}

/**
 * 快速模板
 */
export interface SearchTemplate {
  /** 模板ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description?: string
  /** 模板配置 */
  config: Partial<SearchConfig>
  /** 模板分类 */
  category?: string
  /** 是否为系统模板 */
  isSystem?: boolean
}

/**
 * 搜索验证错误
 */
export interface SearchValidationError {
  /** 条件ID */
  conditionId: string
  /** 字段名 */
  field: string
  /** 错误消息 */
  message: string
  /** 错误类型 */
  type: 'required' | 'invalid' | 'format' | 'range'
}

/**
 * 搜索配置器的属性接口
 */
export interface SearchBuilderProps {
  /** 可搜索的字段配置 */
  fields: SearchField[]
  /** 初始搜索配置 */
  initialConfig?: Partial<SearchConfig>
  /** 配置变更回调 */
  onChange?: (config: SearchConfig) => void
  /** 查询执行回调 */
  onSearch?: (config: SearchConfig) => void
  /** 是否显示预览面板 */
  showPreview?: boolean
  /** 是否启用拖拽排序 */
  enableDragSort?: boolean
  /** 是否显示快速模板 */
  showTemplates?: boolean
  /** 是否显示搜索历史 */
  showHistory?: boolean
  /** 最大条件数量限制 */
  maxConditions?: number
  /** 自定义操作符配置 */
  customOperators?: OperatorConfig[]
  /** 自定义样式类名 */
  className?: string
  /** 是否禁用 */
  disabled?: boolean
}
