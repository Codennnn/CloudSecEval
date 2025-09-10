/**
 * 搜索操作符接口
 * 支持不同数据类型的查询操作
 */
export interface SearchOperators<T = unknown> {
  /** 等于 */
  eq?: T
  /** 不等于 */
  neq?: T
  /** 大于 */
  gt?: T extends number | Date ? T : never
  /** 大于等于 */
  gte?: T extends number | Date ? T : never
  /** 小于 */
  lt?: T extends number | Date ? T : never
  /** 小于等于 */
  lte?: T extends number | Date ? T : never
  /** 包含（用于数组） */
  in?: T[]
  /** 不包含（用于数组） */
  notIn?: T[]
  /** 包含子字符串（用于字符串） */
  contains?: T extends string ? T : never
  /** 以...开始（用于字符串） */
  startsWith?: T extends string ? T : never
  /** 以...结束（用于字符串） */
  endsWith?: T extends string ? T : never
  /** 范围查询 [最小值, 最大值] */
  between?: T extends number | Date ? [T, T] : never
  /** 是否为空 */
  isNull?: boolean
  /** 是否不为空 */
  isNotNull?: boolean
  /** 正则表达式匹配（用于字符串） */
  regex?: T extends string ? string : never
  /** 不区分大小写匹配（用于字符串） */
  ilike?: T extends string ? T : never
  /** 数组包含任一元素 */
  hasAny?: T extends unknown[] ? T : never
  /** 数组包含所有元素 */
  hasAll?: T extends unknown[] ? T : never
  /** 数组为空 */
  isEmpty?: T extends unknown[] ? boolean : never
  /** 数组不为空 */
  isNotEmpty?: T extends unknown[] ? boolean : never
}

/**
 * 搜索模式枚举
 */
export enum SearchMode {
  /** 全局搜索 - 在多个字段中搜索关键词 */
  GLOBAL = 'global',
  /** 精确搜索 - 只在指定字段中搜索 */
  EXACT = 'exact',
  /** 组合搜索 - 全局搜索与字段搜索的组合 */
  COMBINED = 'combined',
  /** 高级搜索 - 使用操作符进行复杂条件查询 */
  ADVANCED = 'advanced',
}

/**
 * 逻辑操作符枚举
 */
export enum LogicalOperator {
  /** 且操作 */
  AND = 'and',
  /** 或操作 */
  OR = 'or',
}

/**
 * 排序方向枚举
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * 排序字段接口
 */
export interface SortField {
  /** 排序字段名 */
  field: string
  /** 排序方向 */
  order: SortOrder
}

/**
 * 基础搜索条件接口
 */
export interface BaseSearchCondition {
  /** 全局搜索关键词 */
  search?: string
  /** 搜索模式 */
  searchMode?: SearchMode
  /** 字段间的逻辑操作符 */
  operator?: LogicalOperator
  /** 排序字段 */
  sortBy?: string | SortField[]
  /** 排序方向（当 sortBy 为字符串时使用） */
  sortOrder?: SortOrder
}

/**
 * 搜索构建器接口
 */
export interface SearchBuilder<TWhereInput, TOrderByInput> {
  /** 构建 where 条件 */
  buildWhere(): TWhereInput
  /** 构建排序条件 */
  buildOrderBy(): TOrderByInput[]
  /** 获取全局搜索字段 */
  getGlobalSearchFields(): string[]
}

/**
 * 聚合操作类型枚举
 */
export enum AggregateFunction {
  COUNT = 'count',
  SUM = 'sum',
  AVG = 'avg',
  MIN = 'min',
  MAX = 'max',
}

/**
 * 聚合筛选条件接口
 */
export interface AggregateFilter {
  /** 聚合函数 */
  function: AggregateFunction
  /** 聚合字段 */
  field: string
  /** 筛选条件 */
  condition: SearchOperators<number>
  /** 关联表（可选） */
  relation?: string
  /** 分组字段（可选） */
  groupBy?: string[]
}

/**
 * 搜索配置接口
 */
export interface SearchConfig {
  /** 全局搜索字段 */
  globalSearchFields: string[]
  /** 允许的排序字段 */
  allowedSortFields: string[]
  /** 默认排序字段 */
  defaultSort: SortField
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 支持的聚合筛选（可选） */
  aggregateFilters?: AggregateFilter[]
}
