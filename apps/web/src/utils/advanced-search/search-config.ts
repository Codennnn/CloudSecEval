import { nanoid } from 'nanoid'

import { type FieldTypeEnum, OPERATOR_CONFIGS, SearchOperatorEnum } from '~/constants/form'
import type {
  FilterCondition,
  OperatorConfig,
  QueryParams,
  QueryParamsValue,
  SearchConfig,
  SearchOperator,
  SearchValidationError,
  SortCondition,
} from '~/types/advanced-search'

import { LogicalOperator, SortOrder } from '~api/types.gen'

/**
 * 根据字段类型获取支持的操作符
 */
export function getOperatorsByFieldType(fieldType: FieldTypeEnum): OperatorConfig[] {
  return Object.values(OPERATOR_CONFIGS).filter((config) =>
    config.supportedTypes.includes(fieldType),
  )
}

/**
 * 根据字段类型获取默认操作符
 * 返回该字段类型支持的第一个操作符作为默认值
 */
export function getDefaultOperatorByFieldType(fieldType: FieldTypeEnum): SearchOperator {
  const supportedOperators = getOperatorsByFieldType(fieldType)

  if (supportedOperators.length === 0) {
    // 如果没有找到支持的操作符，返回最通用的等于操作符
    return SearchOperatorEnum.EQ
  }

  // 返回该字段类型支持的第一个操作符
  return supportedOperators[0].value
}

/**
 * 获取操作符配置
 */
export function getOperatorConfig(operator: SearchOperator): OperatorConfig | undefined {
  return OPERATOR_CONFIGS[operator]
}

/**
 * 生成唯一的条件ID
 */
export function generateConditionId(): string {
  return `condition_${nanoid(4)}`
}

/**
 * 创建新的搜索条件
 */
export function createSearchCondition(
  field: string,
  operator: SearchOperator,
  value?: QueryParamsValue,
): FilterCondition {
  return {
    id: generateConditionId(),
    field,
    operator,
    value,
    logicalOperator: LogicalOperator.AND,
    enabled: true,
  }
}

/**
 * 验证搜索条件
 */
export function validateSearchCondition(
  condition: FilterCondition,
  fieldType: FieldTypeEnum,
): SearchValidationError | null {
  const operatorConfig = getOperatorConfig(condition.operator)

  if (!operatorConfig) {
    return {
      conditionId: condition.id,
      field: condition.field,
      message: '无效的操作符',
      type: 'invalid',
    }
  }

  // 检查操作符是否支持该字段类型
  if (!operatorConfig.supportedTypes.includes(fieldType)) {
    return {
      conditionId: condition.id,
      field: condition.field,
      message: `操作符 "${operatorConfig.label}" 不支持 ${fieldType} 类型字段`,
      type: 'invalid',
    }
  }

  // 检查是否需要值但没有提供值
  if (operatorConfig.requiresValue && (condition.value === undefined || condition.value === null || condition.value === '')) {
    return {
      conditionId: condition.id,
      field: condition.field,
      message: '该操作符需要提供值',
      type: 'required',
    }
  }

  // 检查数组值
  if (
    operatorConfig.requiresArray
    && (!Array.isArray(condition.value) || condition.value.length === 0)
  ) {
    return {
      conditionId: condition.id,
      field: condition.field,
      message: '该操作符需要提供至少一个值',
      type: 'required',
    }
  }

  // 检查范围值
  if (operatorConfig.requiresRange) {
    if (!Array.isArray(condition.value) || condition.value.length !== 2) {
      return {
        conditionId: condition.id,
        field: condition.field,
        message: '该操作符需要提供起始值和结束值',
        type: 'required',
      }
    }
  }

  return null
}

/**
 * 将搜索配置转换为查询参数
 */
export function generateQueryParams(config: SearchConfig): QueryParams {
  const params: QueryParams = {}

  // 添加全局搜索
  if (config.globalSearch) {
    params.search = config.globalSearch
  }

  // 添加多字段排序
  if (config.sortConditions.length > 0) {
    const sortArray = config.sortConditions.map((condition) => ({
      field: condition.field,
      order: condition.order,
    }))
    params.sortBy = JSON.stringify(sortArray)
  }

  // 添加逻辑运算符
  if (config.defaultLogicalOperator) {
    params.operator = config.defaultLogicalOperator
  }

  // 处理搜索条件
  config.filterConditions.forEach((condition) => {
    if (!condition.enabled) {
      return
    }

    const operatorConfig = getOperatorConfig(condition.operator)

    if (!operatorConfig) {
      return
    }

    const fieldKey = condition.field

    // 不需要值的操作符（如 isNull, isNotNull）
    if (!operatorConfig.requiresValue) {
      params[`${fieldKey}[${condition.operator}]`] = true

      return
    }

    // 简单值操作符（如 eq, neq）
    if (!operatorConfig.requiresArray && !operatorConfig.requiresRange) {
      if (condition.value !== null && condition.value !== undefined) {
        params[`${fieldKey}[${condition.operator}]`] = condition.value
      }

      return
    }

    // 数组值操作符（如 in, notIn）
    if (
      operatorConfig.requiresArray && Array.isArray(condition.value) && condition.value.length > 0
    ) {
      params[`${fieldKey}[${condition.operator}]`] = condition.value

      return
    }

    // 范围值操作符（如 between）
    if (
      operatorConfig.requiresRange && Array.isArray(condition.value) && condition.value.length === 2
    ) {
      params[`${fieldKey}[${condition.operator}]`] = condition.value

      return
    }
  })

  return params
}

/**
 * 将查询参数转换为搜索配置
 */
export function queryParamsToSearchConfig(params: QueryParams): Partial<SearchConfig> {
  const config: Partial<SearchConfig> = {
    filterConditions: [],
    sortConditions: [],
  }

  // 解析基本参数
  if (typeof params.search === 'string') {
    config.globalSearch = params.search
  }

  // 解析排序参数
  if (typeof params.sortBy === 'string') {
    try {
      // 解析 JSON 格式的多字段排序
      const sortArray = JSON.parse(params.sortBy) as { field: string, order: SortOrder }[]

      if (Array.isArray(sortArray)) {
        const sortConditions: SortCondition[] = sortArray.map((item) => ({
          id: generateConditionId(),
          field: item.field,
          order: item.order,
        }))
        config.sortConditions = sortConditions
      }
    }
    catch {
      // 如果解析失败，忽略排序参数
      console.warn('Failed to parse sortBy parameter:', params.sortBy)
    }
  }

  if (typeof params.operator === 'string' && ['and', 'or'].includes(params.operator)) {
    config.defaultLogicalOperator = params.operator as LogicalOperator
  }

  // 解析搜索条件
  const conditions: FilterCondition[] = []

  Object.entries(params).forEach(([key, value]) => {
    // 跳过已处理的基本参数
    if (['search', 'sortBy', 'operator'].includes(key)) {
      return
    }

    // 解析带操作符的字段: field[operator]
    const operatorMatch = /^(.+)\[(.+)\]$/.exec(key)

    if (operatorMatch) {
      const [, field, operator] = operatorMatch

      const operatorKey = operator as SearchOperator

      if (operatorKey in OPERATOR_CONFIGS) {
        conditions.push(createSearchCondition(field, operatorKey, value))
      }
    }
    else {
      // 简单字段（默认为等于操作符）
      conditions.push(createSearchCondition(key, SearchOperatorEnum.EQ, value))
    }
  })

  config.filterConditions = conditions

  return config
}

/**
 * 生成查询参数的 URL 字符串
 */
export function generateQueryString(config: SearchConfig): string {
  const params = generateQueryParams(config)
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          searchParams.append(key, String(v))
        })
      }
      else {
        searchParams.append(key, String(value))
      }
    }
  })

  return searchParams.toString()
}

/**
 * 合并搜索配置
 */
export function mergeSearchConfigs(
  base: SearchConfig,
  override: Partial<SearchConfig>,
): SearchConfig {
  return {
    ...base,
    ...override,
    filterConditions: override.filterConditions ?? base.filterConditions,
    sortConditions: override.sortConditions ?? base.sortConditions,
  }
}

/**
 * 创建新的排序条件
 */
export function createSortCondition(
  field: string,
  order: SortOrder = SortOrder.ASC,
): SortCondition {
  return {
    id: generateConditionId(),
    field,
    order,
  }
}
