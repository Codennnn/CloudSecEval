import type { SearchOperators } from '../interfaces/search.interface'

/**
 * 将搜索操作符转换为 Prisma 查询条件
 * @param operators 搜索操作符对象
 * @returns Prisma 查询条件
 */
export function toPrismaCondition<T>(
  operators: SearchOperators<T>,
): Record<string, unknown> | T | null {
  const condition: Record<string, unknown> = {}

  // 等于
  if (operators.eq !== undefined) {
    return operators.eq
  }

  // 不等于
  if (operators.neq !== undefined) {
    condition.not = operators.neq
  }

  // 大于
  if (operators.gt !== undefined) {
    condition.gt = operators.gt
  }

  // 大于等于
  if (operators.gte !== undefined) {
    condition.gte = operators.gte
  }

  // 小于
  if (operators.lt !== undefined) {
    condition.lt = operators.lt
  }

  // 小于等于
  if (operators.lte !== undefined) {
    condition.lte = operators.lte
  }

  // 包含（数组）
  if (operators.in !== undefined) {
    condition.in = operators.in
  }

  // 不包含（数组）
  if (operators.notIn !== undefined) {
    condition.notIn = operators.notIn
  }

  // 包含子字符串
  if (operators.contains !== undefined) {
    condition.contains = operators.contains
    condition.mode = 'insensitive'
  }

  // 以...开始
  if (operators.startsWith !== undefined) {
    condition.startsWith = operators.startsWith
    condition.mode = 'insensitive'
  }

  // 以...结束
  if (operators.endsWith !== undefined) {
    condition.endsWith = operators.endsWith
    condition.mode = 'insensitive'
  }

  // 范围查询
  if (
    operators.between !== undefined
    && Array.isArray(operators.between)
  ) {
    condition.gte = operators.between[0]
    condition.lte = operators.between[1]
  }

  // 是否为空
  if (operators.isNull === true) {
    return null
  }

  // 是否不为空
  if (operators.isNotNull === true) {
    condition.not = null
  }

  // 正则表达式匹配
  if (operators.regex !== undefined) {
    condition.search = operators.regex
    condition.mode = 'insensitive'
  }

  // 不区分大小写匹配
  if (operators.ilike !== undefined) {
    condition.contains = operators.ilike
    condition.mode = 'insensitive'
  }

  // 数组包含任一元素
  if (operators.hasAny !== undefined) {
    condition.hasSome = operators.hasAny
  }

  // 数组包含所有元素
  if (operators.hasAll !== undefined) {
    condition.hasEvery = operators.hasAll
  }

  // 数组为空
  if (operators.isEmpty === true) {
    condition.equals = []
  }

  // 数组不为空
  if (operators.isNotEmpty === true) {
    condition.not = []
  }

  return Object.keys(condition).length > 0 ? condition : null
}

/**
 * 检查操作符对象是否为空
 * @param operators 搜索操作符对象
 * @returns 是否为空
 */
export function isEmpty<T>(operators: SearchOperators<T>): boolean {
  if (typeof operators !== 'object') {
    return true
  }

  return Object.values(operators).every((value) => value === undefined || value === null)
}

/**
 * 检查是否为简单值查询（只有 eq 操作符）
 * @param operators 搜索操作符对象
 * @returns 是否为简单值查询
 */
export function isSimpleValue<T>(operators: SearchOperators<T>): boolean {
  if (typeof operators !== 'object') {
    return false
  }

  const keys = Object.keys(operators).filter((key) =>
    operators[key as keyof SearchOperators<T>] !== undefined,
  )

  return keys.length === 1 && keys[0] === 'eq'
}

/**
 * 验证日期范围操作符
 * @param operators 搜索操作符对象
 * @returns 验证结果
 */
export function validateDateRange(
  operators: SearchOperators<Date>,
): { isValid: boolean, error?: string } {
  if (operators.between) {
    const [start, end] = operators.between

    if (start >= end) {
      return { isValid: false, error: '开始日期必须小于结束日期' }
    }
  }

  if (operators.gte && operators.lte && operators.gte >= operators.lte) {
    return { isValid: false, error: '最小值必须小于最大值' }
  }

  return { isValid: true }
}

/**
 * 验证数值范围操作符
 * @param operators 搜索操作符对象
 * @returns 验证结果
 */
export function validateNumberRange(
  operators: SearchOperators<number>,
): { isValid: boolean, error?: string } {
  if (operators.between) {
    const [min, max] = operators.between

    if (min >= max) {
      return { isValid: false, error: '最小值必须小于最大值' }
    }
  }

  if (operators.gte && operators.lte && operators.gte >= operators.lte) {
    return { isValid: false, error: '最小值必须小于最大值' }
  }

  return { isValid: true }
}

/**
 * 创建数值范围查询条件
 * @param min 最小值
 * @param max 最大值
 * @returns 搜索操作符
 */
export function createNumberRange(min: number, max: number): SearchOperators<number> {
  return {
    gte: min,
    lte: max,
  }
}

/**
 * 创建日期范围查询条件
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 搜索操作符
 */
export function createDateRange(startDate: Date, endDate: Date): SearchOperators<Date> {
  return {
    gte: startDate,
    lte: endDate,
  }
}

/**
 * 创建字符串包含查询条件
 * @param text 搜索文本
 * @param caseSensitive 是否区分大小写
 * @returns 搜索操作符
 */
export function createStringContains(text: string, caseSensitive = false): SearchOperators<string> {
  return caseSensitive
    ? { contains: text }
    : { ilike: text }
}

/**
 * 创建数组包含查询条件
 * @param values 要包含的值
 * @param matchAll 是否匹配所有值（true）还是任一值（false）
 * @returns 搜索操作符
 */
export function createArrayContains<T>(values: T[], matchAll = false): SearchOperators<T[]> {
  return matchAll
    ? { hasAll: values }
    : { hasAny: values }
}
