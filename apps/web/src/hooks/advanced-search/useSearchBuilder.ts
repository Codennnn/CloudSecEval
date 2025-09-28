import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useDebounce } from '~/hooks/useDebounce'
import type {
  FilterCondition,
  QueryParams,
  QueryParamsValue,
  SearchConfig,
  SearchField,
  SearchOperator,
  SearchValidationError,
  SortCondition,
} from '~/types/advanced-search'
import {
  createSearchCondition,
  createSortCondition,
  generateQueryString,
  mergeSearchConfigs,
  queryParamsToSearchConfig,
  validateSearchCondition,
} from '~/utils/advanced-search/search-config'

import { LogicalOperator, SortOrder } from '~api/types.gen'

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
  /** 防抖延迟时间（毫秒） */
  debounceMs?: number
  /** 是否启用搜索防抖 */
  enableDebounce?: boolean
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
  updateCondition: (conditionId: FilterCondition['id'], updates: Partial<FilterCondition>) => void
  /** 删除搜索条件 */
  removeCondition: (conditionId: FilterCondition['id']) => void
  /** 移动搜索条件 */
  moveCondition: (fromIndex: number, toIndex: number) => void
  /** 切换条件启用状态 */
  toggleCondition: (conditionId: FilterCondition['id']) => void
  /** 复制搜索条件 */
  duplicateCondition: (conditionId: FilterCondition['id']) => void
  /** 清除所有条件 */
  clearConditions: () => void
  /** 设置全局搜索 */
  setGlobalSearch: (search: string) => void

  // 排序相关功能
  /** 添加排序条件 */
  addSortCondition: (field: SearchField['key'], order?: SortOrder) => void
  /** 更新排序条件 */
  updateSortCondition: (conditionId: SortCondition['id'], updates: Partial<SortCondition>) => void
  /** 删除排序条件 */
  removeSortCondition: (conditionId: SortCondition['id']) => void
  /** 移动排序条件 */
  moveSortCondition: (fromIndex: number, toIndex: number) => void
  /** 复制排序条件 */
  duplicateSortCondition: (conditionId: SortCondition['id']) => void
  /** 清除所有排序条件 */
  clearSortConditions: () => void

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
  /** 手动触发搜索（跳过防抖） */
  triggerSearch: () => void
  /** 立即执行等待中的防抖函数 */
  flushSearch: () => void

}

/**
 * 默认搜索配置
 */
const DEFAULT_CONFIG: SearchConfig = {
  filterConditions: [],
  sortConditions: [],
  globalSearch: '',
  defaultLogicalOperator: LogicalOperator.AND,
}

/**
 * 搜索配置器 Hook
 */
export function useSearchBuilder(options: UseSearchBuilderOptions = {}): UseSearchBuilderReturn {
  const {
    initialConfig,
    autoValidate = true,
    onChange,
    debounceMs = 600,
    enableDebounce = false,
  } = options

  // 初始化配置
  const [config, setConfigState] = useState<SearchConfig>(() => {
    return initialConfig ? mergeSearchConfigs(DEFAULT_CONFIG, initialConfig) : DEFAULT_CONFIG
  })

  // 验证错误状态
  const [errors, setErrors] = useState<SearchValidationError[]>([])

  // 使用防抖hook，内部自动处理配置稳定化
  const {
    debouncedCallback: debouncedOnChange,
    cancel: cancelSearch,
    flush: flushSearch,
  } = useDebounce<[SearchConfig]>(
    (nextConfig) => {
      onChange?.(nextConfig)
    },
    {
      delay: debounceMs,
      enabled: enableDebounce && !!onChange,
      leading: false,
      trailing: true,
      maxWait: debounceMs * 3, // 最长等待时间，避免长时间不触发
    },
  )

  // 追踪是否为初始渲染，避免初始时触发 onChange
  const [isInitialized, setIsInitialized] = useState(false)

  const setConfig = useEvent(
    (configOrUpdater: SearchConfig | ((prev: SearchConfig) => SearchConfig)) => {
      setConfigState((prev) => {
        const newConfig = typeof configOrUpdater === 'function'
          ? configOrUpdater(prev)
          : configOrUpdater

        return newConfig
      })
    },
  )

  // 监听配置变化，根据防抖设置决定是否延迟触发回调
  useEffect(() => {
    if (isInitialized) {
      if (enableDebounce && onChange) {
        debouncedOnChange(config)
      }
      else {
        onChange?.(config)
      }
    }
    else {
      setIsInitialized(true)
    }
  }, [config, isInitialized, enableDebounce, onChange, debouncedOnChange])

  /**
   * 添加搜索条件
   */
  const addCondition = useEvent(
    (field: string, operator: SearchOperator, value?: QueryParamsValue) => {
      setConfig((prev) => {
        const newCondition = createSearchCondition(field, operator, value)

        return {
          ...prev,
          filterConditions: [...prev.filterConditions, newCondition],
        }
      })
    },
  )

  /**
   * 更新搜索条件
   */
  const updateCondition = useEvent((conditionId: string, updates: Partial<FilterCondition>) => {
    setConfig((prev) => ({
      ...prev,
      filterConditions: prev.filterConditions.map((condition) =>
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
      filterConditions: prev.filterConditions.filter((condition) => condition.id !== conditionId),
    }))
  })

  /**
   * 移动搜索条件
   */
  const moveCondition = useEvent((fromIndex: number, toIndex: number) => {
    setConfig((prev) => {
      const newConditions = [...prev.filterConditions]
      const [movedCondition] = newConditions.splice(fromIndex, 1)
      newConditions.splice(toIndex, 0, movedCondition)

      return {
        ...prev,
        filterConditions: newConditions,
      }
    })
  })

  /**
   * 切换条件启用状态
   */
  const toggleCondition = useEvent((conditionId: string) => {
    updateCondition(conditionId, {
      enabled: !config.filterConditions.find((c) => c.id === conditionId)?.enabled,
    })
  })

  /**
   * 复制搜索条件
   */
  const duplicateCondition = useEvent((conditionId: string) => {
    const condition = config.filterConditions.find((c) => c.id === conditionId)

    if (condition) {
      const newCondition = createSearchCondition(
        condition.field,
        condition.operator,
        condition.value,
      )

      newCondition.logicalOperator = condition.logicalOperator

      setConfig((prev) => ({
        ...prev,
        filterConditions: [...prev.filterConditions, newCondition],
      }))
    }
  })

  /**
   * 清除所有条件
   */
  const clearConditions = useEvent(() => {
    setConfig((prev) => ({
      ...prev,
      filterConditions: [],
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
   * 设置默认逻辑运算符
   */
  const setDefaultLogicalOperator = useEvent((operator: LogicalOperator) => {
    setConfig((prev) => ({
      ...prev,
      defaultLogicalOperator: operator,
    }))
  })

  // ========================= 排序相关功能 =========================

  /**
   * 添加排序条件
   */
  const addSortCondition = useEvent(
    (field: string, order: SortOrder = SortOrder.ASC) => {
      setConfig((prev) => {
        // 检查字段是否已存在排序条件
        const existingCondition = prev.sortConditions.find((condition) => condition.field === field)

        if (existingCondition) {
          // 如果字段已存在，更新现有条件的排序方向
          return {
            ...prev,
            sortConditions: prev.sortConditions.map((condition) =>
              condition.field === field
                ? { ...condition, order }
                : condition,
            ),
          }
        }

        // 如果字段不存在，添加新的排序条件
        const newCondition = createSortCondition(field, order)

        return {
          ...prev,
          sortConditions: [...prev.sortConditions, newCondition],
        }
      })
    },
  )

  /**
   * 更新排序条件
   */
  const updateSortCondition = useEvent((conditionId: string, updates: Partial<SortCondition>) => {
    setConfig((prev) => ({
      ...prev,
      sortConditions: prev.sortConditions.map((condition) =>
        condition.id === conditionId
          ? { ...condition, ...updates }
          : condition,
      ),
    }))
  })

  /**
   * 删除排序条件
   */
  const removeSortCondition = useEvent((conditionId: string) => {
    setConfig((prev) => ({
      ...prev,
      sortConditions: prev.sortConditions.filter((condition) => condition.id !== conditionId),
    }))
  })

  /**
   * 移动排序条件
   */
  const moveSortCondition = useEvent((fromIndex: number, toIndex: number) => {
    setConfig((prev) => {
      const newConditions = [...prev.sortConditions]
      const [movedCondition] = newConditions.splice(fromIndex, 1)
      newConditions.splice(toIndex, 0, movedCondition)

      return {
        ...prev,
        sortConditions: newConditions,
      }
    })
  })

  /**
   * 复制排序条件
   */
  const duplicateSortCondition = useEvent((conditionId: string) => {
    const condition = config.sortConditions.find((c) => c.id === conditionId)

    if (condition) {
      // 检查是否已存在相同字段的排序条件
      const hasExistingField = config.sortConditions.some((c) =>
        c.id !== conditionId && c.field === condition.field,
      )

      // 如果字段已存在，不进行复制，避免重复
      if (hasExistingField) {
        console.warn(`字段 "${condition.field}" 已存在排序条件，无法复制`)

        return
      }

      const newCondition = createSortCondition(
        condition.field,
        condition.order,
      )

      setConfig((prev) => ({
        ...prev,
        sortConditions: [...prev.sortConditions, newCondition],
      }))
    }
  })

  /**
   * 清除所有排序条件
   */
  const clearSortConditions = useEvent(() => {
    setConfig((prev) => ({
      ...prev,
      sortConditions: [],
    }))
  })

  /**
   * 验证搜索配置
   */
  const validateConfig = useEvent((fields: SearchField[]) => {
    const fieldMap = new Map(fields.map((field) => [field.key, field]))
    const validationErrors: SearchValidationError[] = []

    // 验证搜索条件
    config.filterConditions.forEach((condition) => {
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
    addSortCondition,
    updateSortCondition,
    removeSortCondition,
    moveSortCondition,
    duplicateSortCondition,
    clearSortConditions,
    setDefaultLogicalOperator,
    validateConfig,
    generateQueryString: generateQueryStringFn,
    importFromQueryParams,
    reset,
    isValid,
    errors,

    // 手动触发搜索（跳过防抖）
    triggerSearch: useEvent(() => {
      cancelSearch()
      onChange?.(config)
    }),

    // 立即执行等待中的防抖函数
    flushSearch: useEvent(() => {
      flushSearch()
    }),
  }
}
