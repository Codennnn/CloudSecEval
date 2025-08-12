export const enum FieldTypeEnum {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ENUM = 'enum',
}

/**
 * 搜索操作符枚举
 * 使用 const enum 确保编译时被内联，避免硬编码
 */
export const enum SearchOperatorEnum {
  // 相等性操作符
  EQ = 'eq',
  NEQ = 'neq',

  // 包含性操作符
  IN = 'in',
  NOT_IN = 'notIn',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',

  // 比较操作符
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  BETWEEN = 'between',

  // 模式匹配操作符
  REGEX = 'regex',
  ILIKE = 'ilike',

  // 空值检查操作符
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}
