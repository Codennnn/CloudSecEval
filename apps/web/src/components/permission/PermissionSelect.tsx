'use client'

import { useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { MultiSelect, type MultiSelectGroup, type MultiSelectOption } from '~/components/ui/multi-select'
import { cn } from '~/lib/utils'

import {
  permissionsControllerFindAllOptions,
} from '~api/@tanstack/react-query.gen'

/**
 * 权限选择模式
 */
export type PermissionSelectMode = 'single' | 'multiple'

/**
 * 权限选择组件属性
 */
export interface PermissionSelectProps {
  /** 选择模式，默认为多选 */
  mode?: PermissionSelectMode
  /** 当前选中的权限ID列表 */
  value?: string[]
  /** 默认选中的权限ID列表 */
  defaultValue?: string[]
  /** 选择变更回调 */
  onChange?: (value: string[]) => void
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 最大选择数量（仅多选模式有效） */
  maxSelect?: number
  /** 是否按资源分组显示 */
  groupByResource?: boolean
}

/**
 * 权限选择组件
 *
 * 支持单选和多选模式，提供搜索和过滤功能
 */
export function PermissionSelect(props: PermissionSelectProps) {
  const {
    className,
    defaultValue = [],
    disabled = false,
    groupByResource = true,
    maxSelect,
    mode = 'multiple',
    onChange,
    placeholder = '请选择权限',
    value,
  } = props

  // 内部状态管理
  const [internalValue, setInternalValue] = useState<string[]>(value ?? defaultValue)
  const currentValue = value ?? internalValue

  const isSingle = mode === 'single'
  const maxAllowed = isSingle ? 1 : (maxSelect ?? Number.POSITIVE_INFINITY)

  const permissionsQuery = useQuery({
    ...permissionsControllerFindAllOptions({
      query: {
        page: 1,
        pageSize: 100,
      },
    }),
  })

  const permissions = useMemo(
    () => permissionsQuery.data?.data ?? [],
    [permissionsQuery.data?.data],
  )

  // 处理选择变更
  const handleValueChange = (newValue: string[]) => {
    if (!disabled) {
      setInternalValue(newValue)
      onChange?.(newValue)
    }
  }

  /**
   * 将权限数组映射为 MultiSelect 所需的选项结构；支持分组与非分组两种形态。
   */
  const multiSelectOptions = useMemo<MultiSelectOption[] | MultiSelectGroup[]>(() => {
    if (!groupByResource) {
      return permissions.map((p) => ({
        label: p.slug,
        value: p.id,
      }))
    }

    const map = new Map<string, { heading: string, options: MultiSelectOption[] }>()
    permissions.forEach((p) => {
      const key = p.resource

      if (!map.has(key)) {
        map.set(key, { heading: key, options: [] })
      }

      map.get(key)!.options.push({ label: p.slug, value: p.id })
    })

    return Array.from(map.values())
  }, [permissions, groupByResource])

  /**
   * 处理 MultiSelect 的值变更：封装单选/多选限制与上限裁剪。
   */
  const handleMultiSelectChange = (nextValues: string[]) => {
    let finalValues = nextValues

    if (isSingle) {
      if (nextValues.length > 1) {
        finalValues = [nextValues[nextValues.length - 1]]
      }
    }
    else {
      if (Number.isFinite(maxAllowed) && nextValues.length > maxAllowed) {
        finalValues = nextValues.slice(0, maxAllowed)
      }
    }

    handleValueChange(finalValues)
  }

  return (
    <div className={cn('w-full', className)}>
      <MultiSelect
        deduplicateOptions
        resetOnDefaultValueChange
        responsive
        searchable
        closeOnSelect={isSingle}
        defaultValue={currentValue}
        disabled={disabled || permissionsQuery.isLoading}
        hideSelectAll={isSingle}
        options={multiSelectOptions}
        placeholder={permissionsQuery.isLoading ? '加载中...' : placeholder}
        popoverClassName="min-w-[400px]"
        onValueChange={handleMultiSelectChange}
      />

      {!isSingle && maxSelect && (
        <div className="px-1 pt-1 text-xs text-muted-foreground">
          最多可选择 {maxSelect} 个权限
        </div>
      )}
    </div>
  )
}
