/**
 * 搜索配置器工具函数
 *
 * 提供操作符配置、查询参数生成、验证等功能
 */

import { FieldTypeEnum } from '~/constants/form'
import type {
  OperatorConfig,
  QueryParams,
  SearchCondition,
  SearchConfig,
  SearchOperator,
  SearchValidationError,
} from '~/types/advanced-search'

/**
 * 操作符配置定义
 * 定义每个操作符的显示标签、描述、是否需要值等属性
 */
const OPERATOR_CONFIGS: Record<SearchOperator, OperatorConfig> = {
  // 字符串操作符
  eq: {
    value: 'eq',
    label: '等于',
    description: '完全匹配指定值',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.STRING, FieldTypeEnum.NUMBER, FieldTypeEnum.DATE, FieldTypeEnum.BOOLEAN, FieldTypeEnum.ENUM],
  },
  neq: {
    value: 'neq',
    label: '不等于',
    description: '不匹配指定值',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.STRING, FieldTypeEnum.NUMBER, FieldTypeEnum.DATE, FieldTypeEnum.BOOLEAN, FieldTypeEnum.ENUM],
  },
  in: {
    value: 'in',
    label: '包含于',
    description: '值在指定列表中',
    requiresValue: true,
    requiresArray: true,
    supportedTypes: [FieldTypeEnum.STRING, FieldTypeEnum.NUMBER, FieldTypeEnum.ENUM],
  },
  notIn: {
    value: 'notIn',
    label: '不包含于',
    description: '值不在指定列表中',
    requiresValue: true,
    requiresArray: true,
    supportedTypes: [FieldTypeEnum.STRING, FieldTypeEnum.NUMBER, FieldTypeEnum.ENUM],
  },
  contains: {
    value: 'contains',
    label: '包含',
    description: '包含指定子字符串',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.STRING],
  },
  startsWith: {
    value: 'startsWith',
    label: '开始于',
    description: '以指定字符串开始',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.STRING],
  },
  endsWith: {
    value: 'endsWith',
    label: '结束于',
    description: '以指定字符串结束',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.STRING],
  },
  regex: {
    value: 'regex',
    label: '正则匹配',
    description: '使用正则表达式匹配',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.STRING],
  },
  ilike: {
    value: 'ilike',
    label: '模糊匹配',
    description: '不区分大小写的模糊匹配',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.STRING],
  },
  isNull: {
    value: 'isNull',
    label: '为空',
    description: '字段值为空或未设置',
    requiresValue: false,
    supportedTypes: [FieldTypeEnum.STRING, FieldTypeEnum.NUMBER, FieldTypeEnum.DATE, FieldTypeEnum.BOOLEAN, FieldTypeEnum.ENUM],
  },
  isNotNull: {
    value: 'isNotNull',
    label: '不为空',
    description: '字段值不为空且已设置',
    requiresValue: false,
    supportedTypes: [FieldTypeEnum.STRING, FieldTypeEnum.NUMBER, FieldTypeEnum.DATE, FieldTypeEnum.BOOLEAN, FieldTypeEnum.ENUM],
  },
  // 数值操作符
  gt: {
    value: 'gt',
    label: '大于',
    description: '大于指定值',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.NUMBER, FieldTypeEnum.DATE],
  },
  gte: {
    value: 'gte',
    label: '大于等于',
    description: '大于或等于指定值',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.NUMBER, FieldTypeEnum.DATE],
  },
  lt: {
    value: 'lt',
    label: '小于',
    description: '小于指定值',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.NUMBER, FieldTypeEnum.DATE],
  },
  lte: {
    value: 'lte',
    label: '小于等于',
    description: '小于或等于指定值',
    requiresValue: true,
    supportedTypes: [FieldTypeEnum.NUMBER, FieldTypeEnum.DATE],
  },
  between: {
    value: 'between',
    label: '范围内',
    description: '在指定范围内（包含边界值）',
    requiresValue: true,
    requiresRange: true,
    supportedTypes: [FieldTypeEnum.NUMBER, FieldTypeEnum.DATE],
  },
}

/**
 * 根据字段类型获取支持的操作符
 */
export function getOperatorsByFieldType(fieldType: FieldTypeEnum): OperatorConfig[] {
  return Object.values(OPERATOR_CONFIGS).filter((config) =>
    config.supportedTypes.includes(fieldType),
  )
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
  return `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 创建新的搜索条件
 */
export function createSearchCondition(
  field: string,
  operator: SearchOperator,
  value?: any,
): SearchCondition {
  return {
    id: generateConditionId(),
    field,
    operator,
    value,
    logicalOperator: 'and',
    enabled: true,
  }
}

/**
 * 验证搜索条件
 */
export function validateSearchCondition(
  condition: SearchCondition,
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
  if (operatorConfig.requiresArray && (!Array.isArray(condition.value) || condition.value.length === 0)) {
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

    if (condition.value[0] === undefined || condition.value[1] === undefined) {
      return {
        conditionId: condition.id,
        field: condition.field,
        message: '起始值和结束值都不能为空',
        type: 'required',
      }
    }
  }

  // 检查正则表达式
  if (condition.operator === 'regex' && typeof condition.value === 'string') {
    try {
      new RegExp(condition.value)
    }
    catch {
      return {
        conditionId: condition.id,
        field: condition.field,
        message: '无效的正则表达式',
        type: 'format',
      }
    }
  }

  return null
}

/**
 * 将搜索配置转换为查询参数
 */
export function searchConfigToQueryParams(config: SearchConfig): QueryParams {
  const params: QueryParams = {}

  // 添加全局搜索
  if (config.globalSearch) {
    params.search = config.globalSearch
  }

  // 添加搜索模式
  if (config.searchMode) {
    params.searchMode = config.searchMode
  }

  // 添加排序
  if (config.sortBy) {
    params.sortBy = config.sortBy
  }

  if (config.sortOrder) {
    params.sortOrder = config.sortOrder
  }

  // 添加逻辑运算符
  if (config.defaultLogicalOperator) {
    params.operator = config.defaultLogicalOperator
  }

  // 处理搜索条件
  config.conditions.forEach((condition) => {
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
        if (condition.operator === 'eq') {
          // 等于操作符可以简化为直接赋值
          params[fieldKey] = condition.value
        }
        else {
          params[`${fieldKey}[${condition.operator}]`] = condition.value
        }
      }

      return
    }

    // 数组值操作符（如 in, notIn）
    if (operatorConfig.requiresArray && Array.isArray(condition.value) && condition.value.length > 0) {
      params[`${fieldKey}[${condition.operator}]`] = condition.value

      return
    }

    // 范围值操作符（如 between）
    if (operatorConfig.requiresRange && Array.isArray(condition.value) && condition.value.length === 2) {
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
    conditions: [],
  }

  // 解析基本参数
  if (typeof params.search === 'string') {
    config.globalSearch = params.search
  }

  if (typeof params.searchMode === 'string' && ['global', 'exact', 'combined', 'advanced'].includes(params.searchMode)) {
    config.searchMode = params.searchMode as any
  }

  if (typeof params.sortBy === 'string') {
    config.sortBy = params.sortBy
  }

  if (typeof params.sortOrder === 'string' && ['asc', 'desc'].includes(params.sortOrder)) {
    config.sortOrder = params.sortOrder as any
  }

  if (typeof params.operator === 'string' && ['and', 'or'].includes(params.operator)) {
    config.defaultLogicalOperator = params.operator as any
  }

  // 解析搜索条件
  const conditions: SearchCondition[] = []

  Object.entries(params).forEach(([key, value]) => {
    // 跳过已处理的基本参数
    if (['search', 'searchMode', 'sortBy', 'sortOrder', 'operator'].includes(key)) {
      return
    }

    // 解析带操作符的字段: field[operator]
    const operatorMatch = /^(.+)\[(.+)\]$/.exec(key)

    if (operatorMatch) {
      const [, field, operator] = operatorMatch

      if (OPERATOR_CONFIGS[operator as SearchOperator]) {
        conditions.push(createSearchCondition(field, operator as SearchOperator, value))
      }
    }
    else {
      // 简单字段（默认为等于操作符）
      conditions.push(createSearchCondition(key, 'eq', value))
    }
  })

  config.conditions = conditions

  return config
}

/**
 * 生成查询参数的 URL 字符串
 */
export function generateQueryString(config: SearchConfig): string {
  const params = searchConfigToQueryParams(config)
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => { searchParams.append(key, String(v)) })
      }
      else {
        searchParams.append(key, String(value))
      }
    }
  })

  return searchParams.toString()
}

/**
 * 克隆搜索配置
 */
export function cloneSearchConfig(config: SearchConfig): SearchConfig {
  return JSON.parse(JSON.stringify(config))
}

/**
 * 合并搜索配置
 */
export function mergeSearchConfigs(base: SearchConfig, override: Partial<SearchConfig>): SearchConfig {
  return {
    ...base,
    ...override,
    conditions: override.conditions || base.conditions,
  }
}
