/**
 * 高级搜索表单常量定义
 * 提供高级搜索功能所需的字段类型、操作符配置和分组定义
 */

import type { OperatorConfig, SearchOperator } from '../types/advanced-search'

// ============================================================================
// MARK: 枚举定义
// ============================================================================

/**
 * 字段类型枚举
 * 定义高级搜索中支持的字段数据类型
 */
export const enum FieldTypeEnum {
  /** 字符串类型 - 支持文本相关的所有操作符 */
  STRING = 'string',
  /** 数值类型 - 支持数值比较和基础操作符 */
  NUMBER = 'number',
  /** 日期类型 - 支持日期比较和基础操作符 */
  DATE = 'date',
  /** 布尔类型 - 仅支持基础相等性操作符 */
  BOOLEAN = 'boolean',
  /** 枚举类型 - 支持包含性和基础操作符 */
  ENUM = 'enum',
}

/**
 * 搜索操作符枚举
 * 定义高级搜索中支持的所有操作符类型
 * 使用 const enum 确保编译时被内联，避免运行时硬编码
 */
export const enum SearchOperatorEnum {
  // ========================================
  // 相等性操作符组
  // ========================================
  /** 等于 - 完全匹配指定值 */
  EQ = 'eq',
  /** 不等于 - 不匹配指定值 */
  NEQ = 'neq',

  // ========================================
  // 包含性操作符组
  // ========================================
  /** 包含于 - 值在指定列表中 */
  IN = 'in',
  /** 不包含于 - 值不在指定列表中 */
  NOT_IN = 'notIn',
  /** 包含 - 包含指定子字符串（仅字符串） */
  CONTAINS = 'contains',
  /** 开始于 - 以指定字符串开始（仅字符串） */
  STARTS_WITH = 'startsWith',
  /** 结束于 - 以指定字符串结束（仅字符串） */
  ENDS_WITH = 'endsWith',

  // ========================================
  // 比较操作符组
  // ========================================
  /** 大于 - 数值/日期比较 */
  GT = 'gt',
  /** 大于等于 - 数值/日期比较 */
  GTE = 'gte',
  /** 小于 - 数值/日期比较 */
  LT = 'lt',
  /** 小于等于 - 数值/日期比较 */
  LTE = 'lte',
  /** 范围内 - 在指定范围内（包含边界值） */
  BETWEEN = 'between',

  // ========================================
  // 模式匹配操作符组
  // ========================================
  /** 模糊匹配 - 不区分大小写的模糊匹配（仅字符串） */
  ILIKE = 'ilike',

  // ========================================
  // 空值检查操作符组
  // ========================================
  /** 为空 - 字段值为空或未设置 */
  IS_NULL = 'isNull',
  /** 不为空 - 字段值不为空且已设置 */
  IS_NOT_NULL = 'isNotNull',
}

// ============================================================================
// MARK: 类型组合常量
// ============================================================================

/**
 * 字段类型组合定义
 * 预定义的字段类型组合，用于减少操作符配置中的重复代码
 */
const TYPE_COMBINATIONS = {
  /**
   * 所有基础类型组合
   * 适用于相等性操作符和空值检查操作符
   */
  ALL_BASIC: [
    FieldTypeEnum.STRING,
    FieldTypeEnum.NUMBER,
    FieldTypeEnum.DATE,
    FieldTypeEnum.BOOLEAN,
    FieldTypeEnum.ENUM,
  ] as FieldTypeEnum[],

  /**
   * 数值和日期类型组合
   * 适用于数值比较操作符
   */
  NUMERIC_DATE: [
    FieldTypeEnum.NUMBER,
    FieldTypeEnum.DATE,
  ] as FieldTypeEnum[],

  /**
   * 字符串、数值、枚举类型组合
   * 适用于包含性操作符（支持数组值）
   */
  STRING_NUMERIC_ENUM: [
    FieldTypeEnum.STRING,
    FieldTypeEnum.NUMBER,
    FieldTypeEnum.ENUM,
  ] as FieldTypeEnum[],

  /**
   * 仅字符串类型组合
   * 适用于字符串特定操作符
   */
  STRING_ONLY: [FieldTypeEnum.STRING] as FieldTypeEnum[],
}

// ============================================================================
// MARK: 操作符配置定义
// ============================================================================

/**
 * 搜索操作符配置映射表
 * 定义每个操作符的详细配置信息，包括标签、描述、支持的字段类型等
 */
export const OPERATOR_CONFIGS: Record<SearchOperator, OperatorConfig> = {
  // ========================================
  // 相等性操作符配置
  // ========================================
  [SearchOperatorEnum.EQ]: {
    value: SearchOperatorEnum.EQ,
    label: '等于',
    description: '完全匹配指定值',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.ALL_BASIC,
  },
  [SearchOperatorEnum.NEQ]: {
    value: SearchOperatorEnum.NEQ,
    label: '不等于',
    description: '不匹配指定值',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.ALL_BASIC,
  },

  // ========================================
  // 包含性操作符配置
  // ========================================
  [SearchOperatorEnum.CONTAINS]: {
    value: SearchOperatorEnum.CONTAINS,
    label: '包含',
    description: '包含指定子字符串',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.STRING_ONLY,
  },
  [SearchOperatorEnum.IN]: {
    value: SearchOperatorEnum.IN,
    label: '包含于',
    description: '值在指定列表中',
    requiresValue: true,
    requiresArray: true,
    supportedTypes: TYPE_COMBINATIONS.STRING_NUMERIC_ENUM,
  },
  [SearchOperatorEnum.NOT_IN]: {
    value: SearchOperatorEnum.NOT_IN,
    label: '不包含于',
    description: '值不在指定列表中',
    requiresValue: true,
    requiresArray: true,
    supportedTypes: TYPE_COMBINATIONS.STRING_NUMERIC_ENUM,
  },
  [SearchOperatorEnum.STARTS_WITH]: {
    value: SearchOperatorEnum.STARTS_WITH,
    label: '开始于',
    description: '以指定字符串开始',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.STRING_ONLY,
  },
  [SearchOperatorEnum.ENDS_WITH]: {
    value: SearchOperatorEnum.ENDS_WITH,
    label: '结束于',
    description: '以指定字符串结束',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.STRING_ONLY,
  },

  // ========================================
  // 比较操作符配置
  // ========================================
  [SearchOperatorEnum.GT]: {
    value: SearchOperatorEnum.GT,
    label: '大于',
    description: '大于指定值',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.NUMERIC_DATE,
  },
  [SearchOperatorEnum.GTE]: {
    value: SearchOperatorEnum.GTE,
    label: '大于等于',
    description: '大于或等于指定值',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.NUMERIC_DATE,
  },
  [SearchOperatorEnum.LT]: {
    value: SearchOperatorEnum.LT,
    label: '小于',
    description: '小于指定值',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.NUMERIC_DATE,
  },
  [SearchOperatorEnum.LTE]: {
    value: SearchOperatorEnum.LTE,
    label: '小于等于',
    description: '小于或等于指定值',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.NUMERIC_DATE,
  },
  [SearchOperatorEnum.BETWEEN]: {
    value: SearchOperatorEnum.BETWEEN,
    label: '范围内',
    description: '在指定范围内（包含边界值）',
    requiresValue: true,
    requiresRange: true,
    supportedTypes: TYPE_COMBINATIONS.NUMERIC_DATE,
  },

  // ========================================
  // 模式匹配操作符配置
  // ========================================
  [SearchOperatorEnum.ILIKE]: {
    value: SearchOperatorEnum.ILIKE,
    label: '模糊匹配',
    description: '不区分大小写的模糊匹配',
    requiresValue: true,
    supportedTypes: TYPE_COMBINATIONS.STRING_ONLY,
  },

  // ========================================
  // 空值检查操作符配置
  // ========================================
  [SearchOperatorEnum.IS_NULL]: {
    value: SearchOperatorEnum.IS_NULL,
    label: '为空',
    description: '字段值为空或未设置',
    requiresValue: false,
    supportedTypes: TYPE_COMBINATIONS.ALL_BASIC,
  },
  [SearchOperatorEnum.IS_NOT_NULL]: {
    value: SearchOperatorEnum.IS_NOT_NULL,
    label: '不为空',
    description: '字段值不为空且已设置',
    requiresValue: false,
    supportedTypes: TYPE_COMBINATIONS.ALL_BASIC,
  },
}

// ============================================================================
// MARK: 操作符分组配置
// ============================================================================

/**
 * 操作符分组定义
 * 将操作符按功能进行逻辑分组，便于在UI中展示和管理
 */
export const OPERATOR_GROUPS: Record<'equality' | 'inclusion' | 'comparison' | 'nullability', {
  /** 分组显示标签 */
  label: string
  /** 该分组包含的操作符列表 */
  operators: SearchOperator[]
}> = {
  /** 相等性操作符分组 - 用于精确匹配 */
  equality: {
    label: '相等性',
    operators: [SearchOperatorEnum.EQ, SearchOperatorEnum.NEQ],
  },

  /** 包含性操作符分组 - 用于部分匹配和集合操作 */
  inclusion: {
    label: '包含性',
    operators: [
      SearchOperatorEnum.IN,
      SearchOperatorEnum.NOT_IN,
      SearchOperatorEnum.CONTAINS,
      SearchOperatorEnum.STARTS_WITH,
      SearchOperatorEnum.ENDS_WITH,
    ],
  },

  /** 比较操作符分组 - 用于数值和日期比较 */
  comparison: {
    label: '比较',
    operators: [
      SearchOperatorEnum.GT,
      SearchOperatorEnum.GTE,
      SearchOperatorEnum.LT,
      SearchOperatorEnum.LTE,
      SearchOperatorEnum.BETWEEN,
    ],
  },

  /** 空值检查操作符分组 - 用于验证字段是否有值 */
  nullability: {
    label: '空值检查',
    operators: [SearchOperatorEnum.IS_NULL, SearchOperatorEnum.IS_NOT_NULL],
  },
}
