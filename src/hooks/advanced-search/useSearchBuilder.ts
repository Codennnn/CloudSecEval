import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import type {
  LogicalOperator,
  QueryParams,
  QueryParamsValue,
  SearchCondition,
  SearchConfig,
  SearchField,
  SearchOperator,
  SearchValidationError,
} from '~/types/advanced-search'
import {
  createSearchCondition,
  generateQueryString,
  mergeSearchConfigs,
  queryParamsToSearchConfig,
  validateSearchCondition,
} from '~/utils/advanced-search/search-config'

import type { SortOrder } from '~api/types.gen'

/**
 * 搜索配置器 Hook 选项
 */
interface UseSearchBuilderOptions {
  /** 初始搜索配置 */
  initialConfig?: Partial<SearchConfig>
  /** 配置变更回调 */
  onChange?: (config: SearchConfig) => void
  /** 自动验证 */
  autoValidate?: boolean
}

/**
 * 搜索配置器 Hook 返回值
 */
interface UseSearchBuilderReturn {
  /** 当前搜索配置 */
  config: SearchConfig
  /** 设置搜索配置 */
  setConfig: (config: SearchConfig | ((prev: SearchConfig) => SearchConfig)) => void
  /** 添加搜索条件 */
  addCondition: (field: SearchField['key'], operator: SearchOperator, value?: QueryParamsValue) => void
  /** 更新搜索条件 */
  updateCondition: (conditionId: SearchCondition['id'], updates: Partial<SearchCondition>) => void
  /** 删除搜索条件 */
  removeCondition: (conditionId: SearchCondition['id']) => void
  /** 移动搜索条件 */
  moveCondition: (fromIndex: number, toIndex: number) => void
  /** 切换条件启用状态 */
  toggleCondition: (conditionId: SearchCondition['id']) => void
  /** 复制搜索条件 */
  duplicateCondition: (conditionId: SearchCondition['id']) => void
  /** 清除所有条件 */
  clearConditions: () => void
  /** 设置全局搜索 */
  setGlobalSearch: (search: string) => void
  /** 设置排序 */
  setSorting: (sortBy?: string, sortOrder?: SortOrder) => void

  /** 设置默认逻辑运算符 */
  setDefaultLogicalOperator: (operator: LogicalOperator) => void
  /** 验证搜索配置 */
  validateConfig: (fields: SearchField[]) => SearchValidationError[]
  /** 生成查询字符串 */
  generateQueryString: () => string
  /** 从查询参数导入配置 */
  importFromQueryParams: (params: QueryParams) => void
  /** 重置配置 */
  reset: () => void
  /** 是否有效 */
  isValid: boolean
  /** 验证错误 */
  errors: SearchValidationError[]
}

/**
 * 默认搜索配置
 */
const DEFAULT_CONFIG: SearchConfig = {
  conditions: [],
  globalSearch: '',
  defaultLogicalOperator: 'and',
}

/**
 * 搜索配置器 Hook
 */
export function useSearchBuilder(options: UseSearchBuilderOptions = {}): UseSearchBuilderReturn {
  const {
    initialConfig,
    autoValidate = true,
    onChange,
  } = options

  // 初始化配置
  const [config, setConfigState] = useState<SearchConfig>(() => {
    return initialConfig ? mergeSearchConfigs(DEFAULT_CONFIG, initialConfig) : DEFAULT_CONFIG
  })

  // 验证错误状态
  const [errors, setErrors] = useState<SearchValidationError[]>([])

  /**
   * 设置配置并触发回调
   */
  const setConfig = useEvent(
    (configOrUpdater: SearchConfig | ((prev: SearchConfig) => SearchConfig)) => {
      setConfigState((prev) => {
        const newConfig = typeof configOrUpdater === 'function'
          ? configOrUpdater(prev)
          : configOrUpdater

        onChange?.(newConfig)

        return newConfig
      })
    },
  )

  /**
   * 添加搜索条件
   */
  const addCondition = useEvent(
    (field: string, operator: SearchOperator, value?: QueryParamsValue) => {
      setConfig((prev) => {
        const newCondition = createSearchCondition(field, operator, value)

        return {
          ...prev,
          conditions: [...prev.conditions, newCondition],
        }
      })
    },
  )

  /**
   * 更新搜索条件
   */
  const updateCondition = useEvent((conditionId: string, updates: Partial<SearchCondition>) => {
    setConfig((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition) =>
        condition.id === conditionId
          ? { ...condition, ...updates }
          : condition,
      ),
    }))
  })

  /**
   * 删除搜索条件
   */
  const removeCondition = useEvent((conditionId: string) => {
    setConfig((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((condition) => condition.id !== conditionId),
    }))
  })

  /**
   * 移动搜索条件
   */
  const moveCondition = useEvent((fromIndex: number, toIndex: number) => {
    setConfig((prev) => {
      const newConditions = [...prev.conditions]
      const [movedCondition] = newConditions.splice(fromIndex, 1)
      newConditions.splice(toIndex, 0, movedCondition)

      return {
        ...prev,
        conditions: newConditions,
      }
    })
  })

  /**
   * 切换条件启用状态
   */
  const toggleCondition = useEvent((conditionId: string) => {
    updateCondition(conditionId, {
      enabled: !config.conditions.find((c) => c.id === conditionId)?.enabled,
    })
  })

  /**
   * 复制搜索条件
   */
  const duplicateCondition = useEvent((conditionId: string) => {
    const condition = config.conditions.find((c) => c.id === conditionId)

    if (condition) {
      const newCondition = createSearchCondition(
        condition.field,
        condition.operator,
        condition.value,
      )

      newCondition.logicalOperator = condition.logicalOperator

      setConfig((prev) => ({
        ...prev,
        conditions: [...prev.conditions, newCondition],
      }))
    }
  })

  /**
   * 清除所有条件
   */
  const clearConditions = useEvent(() => {
    setConfig((prev) => ({
      ...prev,
      conditions: [],
    }))
  })

  /**
   * 设置全局搜索
   */
  const setGlobalSearch = useEvent((search: string) => {
    setConfig((prev) => ({
      ...prev,
      globalSearch: search,
    }))
  })

  /**
   * 设置排序
   */
  const setSorting = useEvent((sortBy?: string, sortOrder?: SortOrder) => {
    setConfig((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
    }))
  })

  /**
   * 设置默认逻辑运算符
   */
  const setDefaultLogicalOperator = useEvent((operator: LogicalOperator) => {
    setConfig((prev) => ({
      ...prev,
      defaultLogicalOperator: operator,
    }))
  })

  /**
   * 验证搜索配置
   */
  const validateConfig = useEvent((fields: SearchField[]) => {
    const fieldMap = new Map(fields.map((field) => [field.key, field]))
    const validationErrors: SearchValidationError[] = []

    config.conditions.forEach((condition) => {
      if (!condition.enabled) {
        return
      }

      const field = fieldMap.get(condition.field)

      if (!field) {
        validationErrors.push({
          conditionId: condition.id,
          field: condition.field,
          message: '未知的字段',
          type: 'invalid',
        })

        return
      }

      const error = validateSearchCondition(condition, field.type)

      if (error) {
        validationErrors.push(error)
      }
    })

    setErrors(validationErrors)

    return validationErrors
  })

  /**
   * 生成查询字符串
   */
  const generateQueryStringFn = useEvent(() => {
    return generateQueryString(config)
  })

  /**
   * 从查询参数导入配置
   */
  const importFromQueryParams = useEvent((params: QueryParams) => {
    const importedConfig = queryParamsToSearchConfig(params)
    setConfig((prev) => mergeSearchConfigs(prev, importedConfig))
  })

  /**
   * 重置配置
   */
  const reset = useEvent(() => {
    setConfig(initialConfig ? mergeSearchConfigs(DEFAULT_CONFIG, initialConfig) : DEFAULT_CONFIG)
    setErrors([])
  })

  /**
   * 是否有效（计算属性）
   */
  const isValid = useMemo(() => {
    return errors.length === 0
  }, [errors])

  /**
   * 自动验证
   */
  useEffect(() => {
    if (autoValidate) {
      // 这里需要字段信息才能验证，由组件层面处理
      // 或者可以通过 ref 或其他方式传递字段信息
    }
  }, [config, autoValidate])

  return {
    config,
    setConfig,
    addCondition,
    updateCondition,
    removeCondition,
    moveCondition,
    toggleCondition,
    duplicateCondition,
    clearConditions,
    setGlobalSearch,
    setSorting,
    setDefaultLogicalOperator,
    validateConfig,
    generateQueryString: generateQueryStringFn,
    importFromQueryParams,
    reset,
    isValid,
    errors,
  }
}
