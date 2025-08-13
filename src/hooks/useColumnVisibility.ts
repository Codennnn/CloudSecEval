import { useCallback, useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import type { ColumnVisibilityConfig, SearchField } from '~/types/advanced-search'

interface UseColumnVisibilityOptions {
  /** 字段列表 */
  fields: SearchField[]
  /** 存储键名，用于localStorage持久化 */
  storageKey?: string
  /** 初始可见列配置 */
  initialConfig?: Partial<ColumnVisibilityConfig>
  /** 可见性变化回调 */
  onChange?: (config: ColumnVisibilityConfig) => void
}

interface UseColumnVisibilityReturn {
  /** 当前可见性配置 */
  config: ColumnVisibilityConfig
  /** 可见的字段列表（按顺序） */
  visibleFields: SearchField[]
  /** 隐藏的字段列表 */
  hiddenFields: SearchField[]
  /** 切换字段可见性 */
  toggleFieldVisibility: (fieldKey: string) => void
  /** 设置字段可见性 */
  setFieldVisibility: (fieldKey: string, visible: boolean) => void
  /** 设置多个字段的可见性 */
  setMultipleFieldsVisibility: (updates: { fieldKey: string, visible: boolean }[]) => void
  /** 重新排序可见列 */
  reorderVisibleColumns: (fromIndex: number, toIndex: number) => void
  /** 显示所有列 */
  showAllColumns: () => void
  /** 重置到初始状态 */
  resetToDefault: () => void
  /** 是否可以隐藏某个字段（至少保留一个可见） */
  canHideField: (fieldKey: string) => boolean
}

/**
 * 生成默认的列可见性配置
 */
function generateDefaultConfig(fields: SearchField[]): ColumnVisibilityConfig {
  const visibleColumns: string[] = []
  const hiddenColumns: string[] = []

  fields.forEach((field) => {
    // 如果字段明确设置了 visible: false 或 hidden: true，则隐藏
    if (field.visible === false) {
      hiddenColumns.push(field.key)
    }
    else {
      // 默认可见
      visibleColumns.push(field.key)
    }
  })

  return { visibleColumns, hiddenColumns }
}

/**
 * 从 localStorage 加载配置
 */
function loadConfigFromStorage(
  storageKey: string,
  defaultConfig: ColumnVisibilityConfig,
): ColumnVisibilityConfig {
  try {
    const saved = localStorage.getItem(storageKey)

    if (saved) {
      const parsed = JSON.parse(saved) as ColumnVisibilityConfig

      // 验证配置的有效性
      if (Array.isArray(parsed.visibleColumns)) {
        return parsed
      }
    }
  }
  catch (error) {
    console.warn('Failed to load column visibility config from localStorage:', error)
  }

  return defaultConfig
}

/**
 * 保存配置到 localStorage
 */
function saveConfigToStorage(storageKey: string, config: ColumnVisibilityConfig): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(config))
  }
  catch (error) {
    console.warn('Failed to save column visibility config to localStorage:', error)
  }
}

/**
 * 列可见性管理 Hook
 */
export function useColumnVisibility(
  options: UseColumnVisibilityOptions,
): UseColumnVisibilityReturn {
  const { fields, storageKey, initialConfig, onChange } = options

  // 生成默认配置
  const defaultConfig = generateDefaultConfig(fields)

  // 初始化状态
  const [config, setConfig] = useState<ColumnVisibilityConfig>(() => {
    let finalConfig = defaultConfig

    // 如果提供了初始配置，则合并
    if (initialConfig) {
      finalConfig = {
        visibleColumns: initialConfig.visibleColumns ?? defaultConfig.visibleColumns,
        hiddenColumns: initialConfig.hiddenColumns ?? defaultConfig.hiddenColumns,
      }
    }

    // 如果提供了存储键，则从 localStorage 加载
    if (storageKey) {
      finalConfig = loadConfigFromStorage(storageKey, finalConfig)
    }

    return finalConfig
  })

  // 计算可见和隐藏的字段列表
  const visibleFields = config.visibleColumns
    .map((key) => fields.find((field) => field.key === key))
    .filter((field): field is SearchField => field !== undefined)

  const hiddenFields = config.hiddenColumns
    .map((key) => fields.find((field) => field.key === key))
    .filter((field): field is SearchField => field !== undefined)

  // 切换字段可见性
  const toggleFieldVisibility = useEvent((fieldKey: string) => {
    setConfig((prev) => {
      const isCurrentlyVisible = prev.visibleColumns.includes(fieldKey)
      const field = fields.find((f) => f.key === fieldKey)

      // 如果字段设置了强制可见，不允许隐藏
      if (isCurrentlyVisible && field?.visible === true) {
        return prev
      }

      // 如果是唯一可见列，不允许隐藏
      if (isCurrentlyVisible && prev.visibleColumns.length === 1) {
        return prev
      }

      let newVisibleColumns: string[]
      let newHiddenColumns: string[]

      if (isCurrentlyVisible) {
        // 隐藏字段
        newVisibleColumns = prev.visibleColumns.filter((key) => key !== fieldKey)
        newHiddenColumns = [...prev.hiddenColumns, fieldKey]
      }
      else {
        // 显示字段，添加到可见列表末尾
        newVisibleColumns = [...prev.visibleColumns, fieldKey]
        newHiddenColumns = prev.hiddenColumns.filter((key) => key !== fieldKey)
      }

      return {
        visibleColumns: newVisibleColumns,
        hiddenColumns: newHiddenColumns,
      }
    })
  })

  // 设置字段可见性
  const setFieldVisibility = useEvent((fieldKey: string, visible: boolean) => {
    setConfig((prev) => {
      const isCurrentlyVisible = prev.visibleColumns.includes(fieldKey)

      // 如果要隐藏唯一可见列，则不允许
      if (!visible && isCurrentlyVisible && prev.visibleColumns.length === 1) {
        return prev
      }

      // 如果状态相同，无需改变
      if (visible === isCurrentlyVisible) {
        return prev
      }

      let newVisibleColumns: string[]
      let newHiddenColumns: string[]

      if (visible) {
        // 显示字段
        newVisibleColumns = [...prev.visibleColumns, fieldKey]
        newHiddenColumns = prev.hiddenColumns.filter((key) => key !== fieldKey)
      }
      else {
        // 隐藏字段
        newVisibleColumns = prev.visibleColumns.filter((key) => key !== fieldKey)
        newHiddenColumns = [...prev.hiddenColumns, fieldKey]
      }

      return {
        visibleColumns: newVisibleColumns,
        hiddenColumns: newHiddenColumns,
      }
    })
  })

  // 设置多个字段的可见性
  const setMultipleFieldsVisibility = useEvent(
    (updates: { fieldKey: string, visible: boolean }[]) => {
      setConfig((prev) => {
        let newVisibleColumns = [...prev.visibleColumns]
        let newHiddenColumns = [...prev.hiddenColumns]

        updates.forEach(({ fieldKey, visible }) => {
          const isCurrentlyVisible = newVisibleColumns.includes(fieldKey)

          if (visible && !isCurrentlyVisible) {
          // 显示字段
            newVisibleColumns.push(fieldKey)
            newHiddenColumns = newHiddenColumns.filter((key) => key !== fieldKey)
          }
          else if (!visible && isCurrentlyVisible) {
          // 隐藏字段（但要保证至少有一个可见）
            if (newVisibleColumns.length > 1) {
              newVisibleColumns = newVisibleColumns.filter((key) => key !== fieldKey)
              newHiddenColumns.push(fieldKey)
            }
          }
        })

        return {
          visibleColumns: newVisibleColumns,
          hiddenColumns: newHiddenColumns,
        }
      })
    },
  )

  // 重新排序可见列
  const reorderVisibleColumns = useEvent((fromIndex: number, toIndex: number) => {
    setConfig((prev) => {
      if (fromIndex === toIndex) {
        return prev
      }

      const newVisibleColumns = [...prev.visibleColumns]
      const [movedItem] = newVisibleColumns.splice(fromIndex, 1)
      newVisibleColumns.splice(toIndex, 0, movedItem)

      return {
        ...prev,
        visibleColumns: newVisibleColumns,
      }
    })
  })

  // 显示所有列
  const showAllColumns = useEvent(() => {
    setConfig({
      visibleColumns: fields.map((field) => field.key),
      hiddenColumns: [],
    })
  })

  // 重置到默认状态
  const resetToDefault = useEvent(() => {
    const newConfig = generateDefaultConfig(fields)
    setConfig(newConfig)
  })

  // 检查是否可以隐藏某个字段
  const canHideField = useCallback((fieldKey: string): boolean => {
    const field = fields.find((f) => f.key === fieldKey)

    if (field?.enableHiding === false) {
      return false
    }

    // 如果只剩一个可见列，则不能隐藏
    if (config.visibleColumns.length <= 1) {
      return false
    }

    // 当前字段必须是可见的才能隐藏
    return config.visibleColumns.includes(fieldKey)
  }, [config.visibleColumns, fields])

  // 使用 useEvent 避免 onChange 依赖变化
  const handleConfigChange = useEvent((newConfig: ColumnVisibilityConfig) => {
    onChange?.(newConfig)
  })

  // 持久化到 localStorage 和通知变化
  useEffect(() => {
    if (storageKey) {
      saveConfigToStorage(storageKey, config)
    }

    handleConfigChange(config)
  }, [config, storageKey, handleConfigChange])

  return {
    config,
    visibleFields,
    hiddenFields,
    toggleFieldVisibility,
    setFieldVisibility,
    setMultipleFieldsVisibility,
    reorderVisibleColumns,
    showAllColumns,
    resetToDefault,
    canHideField,
  }
}
