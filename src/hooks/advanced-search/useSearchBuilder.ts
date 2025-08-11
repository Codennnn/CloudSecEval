/**
 * 搜索配置器 Hook
 *
 * 提供搜索配置状态管理、条件操作、验证等功能
 */

import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import type {
  LogicalOperator,
  SearchCondition,
  SearchConfig,
  SearchField,
  SearchOperator,
  SearchValidationError } from '~/types/advanced-search'
import {
  createSearchCondition,
  generateQueryString,
  mergeSearchConfigs,
  queryParamsToSearchConfig,
  searchConfigToQueryParams,
  validateSearchCondition } from '~/utils/advanced-search/search-config'

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
  /** 最大条件数量 */
  maxConditions?: number
  /** 默认分页大小 */
  defaultPageSize?: number
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
  addCondition: (field: string, operator: SearchOperator, value?: any) => void
  /** 更新搜索条件 */
  updateCondition: (conditionId: string, updates: Partial<SearchCondition>) => void
  /** 删除搜索条件 */
  removeCondition: (conditionId: string) => void
  /** 移动搜索条件 */
  moveCondition: (fromIndex: number, toIndex: number) => void
  /** 切换条件启用状态 */
  toggleCondition: (conditionId: string) => void
  /** 复制搜索条件 */
  duplicateCondition: (conditionId: string) => void
  /** 清除所有条件 */
  clearConditions: () => void
  /** 设置全局搜索 */
  setGlobalSearch: (search: string) => void
  /** 设置排序 */
  setSorting: (sortBy?: string, sortOrder?: 'asc' | 'desc') => void
  /** 设置分页 */
  setPagination: (page: number, pageSize?: number) => void
  /** 设置默认逻辑运算符 */
  setDefaultLogicalOperator: (operator: LogicalOperator) => void
  /** 验证搜索配置 */
  validateConfig: (fields: SearchField[]) => SearchValidationError[]
  /** 生成查询参数 */
  generateQueryParams: () => Record<string, any>
  /** 生成查询字符串 */
  generateQueryString: () => string
  /** 从查询参数导入配置 */
  importFromQueryParams: (params: Record<string, any>) => void
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
  searchMode: 'advanced',
  pagination: {
    page: 1,
    pageSize: 20,
  },
  defaultLogicalOperator: 'and',
}

/**
 * 搜索配置器 Hook
 */
export function useSearchBuilder(options: UseSearchBuilderOptions = {}): UseSearchBuilderReturn {
  const {
    initialConfig,
    onChange,
    autoValidate = true,
    maxConditions = 10,
    defaultPageSize = 20,
  } = options

  // 初始化配置
  const [config, setConfigState] = useState<SearchConfig>(() => {
    const base = {
      ...DEFAULT_CONFIG,
      pagination: {
        ...DEFAULT_CONFIG.pagination,
        pageSize: defaultPageSize,
      },
    }

    return initialConfig ? mergeSearchConfigs(base, initialConfig) : base
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

        // 触发 onChange 回调
        if (onChange) {
          setTimeout(() => {
            onChange(newConfig)
          }, 0)
        }

        return newConfig
      })
    },
  )

  /**
   * 添加搜索条件
   */
  const addCondition = useEvent((field: string, operator: SearchOperator, value?: any) => {
    setConfig((prev) => {
      if (prev.conditions.length >= maxConditions) {
        return prev
      }

      const newCondition = createSearchCondition(field, operator, value)

      return {
        ...prev,
        conditions: [...prev.conditions, newCondition],
      }
    })
  })

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

    if (condition && config.conditions.length < maxConditions) {
      const newCondition = createSearchCondition(condition.field, condition.operator, condition.value)
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
  const setSorting = useEvent((sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    setConfig((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
    }))
  })

  /**
   * 设置分页
   */
  const setPagination = useEvent((page: number, pageSize?: number) => {
    setConfig((prev) => ({
      ...prev,
      pagination: {
        page: Math.max(1, page),
        pageSize: pageSize ? Math.min(100, Math.max(1, pageSize)) : prev.pagination.pageSize,
      },
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
      if (!condition.enabled) { return }

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
   * 生成查询参数
   */
  const generateQueryParams = useEvent(() => {
    return searchConfigToQueryParams(config)
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
  const importFromQueryParams = useEvent((params: Record<string, any>) => {
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
    setPagination,
    setDefaultLogicalOperator,
    validateConfig,
    generateQueryParams,
    generateQueryString: generateQueryStringFn,
    importFromQueryParams,
    reset,
    isValid,
    errors,
  }
}
