'use client'

import { useCallback, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { format } from 'date-fns'
import { Calendar, CalendarClock } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Calendar as CalendarComponent } from '~/components/ui/calendar'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { MultiSelect, type MultiSelectOption } from '~/components/ui/multi-select'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { FieldTypeEnum } from '~/constants/form'
import { cn } from '~/lib/utils'
import type { SearchField, SearchOperator } from '~/types/advanced-search'
import { getOperatorConfig } from '~/utils/advanced-search/search-config'

/**
 * 值输入组件属性
 */
interface ValueInputProps {
  /** 字段配置 */
  field: SearchField
  /** 操作符 */
  operator: SearchOperator
  /** 当前值 */
  value?: unknown
  /** 值变更回调 */
  onChange?: (value: unknown) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符 */
  placeholder?: string
  /** 自定义样式类名 */
  className?: string
  /** 错误消息 */
  error?: string
}

/**
 * 自由输入多选组件（用于数组值输入）
 * 基于 MultiSelect 组件，支持用户自由输入新值
 * 当字段类型为枚举时，仅支持选择预定义选项
 */
interface FreeInputMultiSelectProps {
  value?: string[]
  onChange?: (value: FreeInputMultiSelectProps['value']) => void
  placeholder?: string
  disabled?: boolean
  field: SearchField
}

function FreeInputMultiSelect({
  value = [],
  onChange,
  placeholder,
  disabled,
  field,
}: FreeInputMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // 检查是否为枚举类型
  const isEnumField = field.type === FieldTypeEnum.ENUM

  /**
   * 获取可用选项
   * 枚举类型：使用预定义选项并支持搜索过滤
   * 其他类型：支持自由输入
   */
  const availableOptions = useMemo((): MultiSelectOption[] => {
    if (isEnumField && field.options) {
      // 枚举类型：使用预定义的选项，支持搜索过滤
      let enumOptions = field.options.map((option) => ({
        label: option.label,
        value: option.value,
      }))

      // 如果有搜索词，过滤枚举选项
      if (searchTerm.trim()) {
        const searchText = searchTerm.toLowerCase()
        enumOptions = enumOptions.filter((option) =>
          option.label.toLowerCase().includes(searchText)
          || option.value.toLowerCase().includes(searchText),
        )
      }

      return enumOptions
    }

    // 非枚举类型：支持自由输入
    const searchTermValue = searchTerm.trim() ? [searchTerm.trim()] : []
    const uniqueValues = Array.from(new Set([...value, ...searchTermValue]))

    return uniqueValues.map((val) => ({
      label: val,
      value: val,
    }))
  }, [isEnumField, field.options, value, searchTerm])

  /**
   * 验证输入值
   */
  const validateInput = useCallback((input: string): boolean => {
    if (!input.trim()) {
      return false
    }

    // 枚举类型：检查是否在预定义选项中
    if (isEnumField && field.options) {
      return field.options.some((option) => option.value === input.trim())
    }

    // 数字类型：验证数字格式
    if (field.type === FieldTypeEnum.NUMBER) {
      return !isNaN(Number(input))
    }

    return true
  }, [isEnumField, field.options, field.type])

  /**
   * 处理搜索输入
   * 枚举类型：仅用于过滤现有选项
   * 其他类型：允许用户输入新值并自动添加到选项中
   */
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  /**
   * 处理值变更
   */
  const handleValueChange = useCallback((newValues: string[]) => {
    // 过滤掉空值和无效值
    const validValues = newValues.filter((val) => {
      const trimmedVal = val.trim()

      return trimmedVal && validateInput(trimmedVal)
    })

    onChange?.(validValues)
  }, [onChange, validateInput])

  return (
    <MultiSelect
      deduplicateOptions
      hideSelectAll
      searchable // 枚举类型支持搜索过滤，非枚举类型支持搜索添加
      defaultValue={value}
      disabled={disabled}
      emptyIndicator={
        isEnumField
          ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {searchTerm.trim() ? '未找到匹配的枚举选项' : '无可用的枚举选项'}
              </div>
            )
          : searchTerm.trim() && validateInput(searchTerm)
            ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  按 Enter 添加 "{searchTerm.trim()}"
                </div>
              )
            : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {searchTerm.trim()
                    ? '输入无效'
                    : '开始输入以添加新值'}
                </div>
              )
      }
      minSearchChars={isEnumField ? 0 : 1}
      options={availableOptions}
      placeholder={
        placeholder
        ?? (isEnumField ? '选择枚举值' : '输入值，支持搜索和添加新值')
      }
      resetOnDefaultValueChange={false}
      searchDebounceMs={200}
      onSearch={handleSearch}
      onValueChange={handleValueChange}
    />
  )
}

/**
 * 范围输入组件（用于 between 操作符）
 */
interface RangeInputProps {
  value?: [string | number | undefined, string | number | undefined]
  onChange?: (value: RangeInputProps['value']) => void
  fieldType: FieldTypeEnum
  disabled?: boolean
  placeholder?: [string, string]
}

function RangeInput(props: RangeInputProps) {
  const { value, onChange, fieldType, disabled, placeholder } = props

  const [startValue, endValue] = value ?? []

  const handleStartChange = useEvent((newValue: string | number | undefined) => {
    onChange?.([newValue, endValue])
  })

  const handleEndChange = useEvent((newValue: string | number | undefined) => {
    onChange?.([startValue, newValue])
  })

  if (fieldType === FieldTypeEnum.DATE) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-sm text-muted-foreground">开始日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startValue && 'text-muted-foreground',
                  )}
                  disabled={disabled}
                  variant="outline"
                >
                  <CalendarClock className="mr-2 size-4" />
                  {startValue ? format(new Date(startValue), 'yyyy-MM-dd') : '选择日期'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startValue ? new Date(startValue) : undefined}
                  onSelect={(date) => {
                    handleStartChange(date?.toISOString().split('T')[0])
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">结束日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endValue && 'text-muted-foreground',
                  )}
                  disabled={disabled}
                  variant="outline"
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  {endValue ? format(new Date(endValue), 'yyyy-MM-dd') : '选择日期'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endValue ? new Date(endValue) : undefined}
                  onSelect={(date) => {
                    handleEndChange(date?.toISOString().split('T')[0])
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-sm text-muted-foreground">最小值</Label>
          <Input
            disabled={disabled}
            placeholder={placeholder?.[0] ?? '最小值'}
            type="number"
            value={startValue ?? ''}
            onChange={(e) => {
              handleStartChange(e.target.value ? Number(e.target.value) : undefined)
            }}
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">最大值</Label>
          <Input
            disabled={disabled}
            placeholder={placeholder?.[1] ?? '最大值'}
            type="number"
            value={endValue ?? ''}
            onChange={(e) => {
              handleEndChange(e.target.value ? Number(e.target.value) : undefined)
            }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * 安全地将值转换为字符串
 */
function safeStringify(val: unknown): string {
  if (val === null || val === undefined) {
    return ''
  }

  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val)
  }

  if (val instanceof Date) {
    return val.toISOString().split('T')[0]
  }

  return ''
}

/**
 * 动态值输入组件
 *
 * 根据字段类型和操作符自动选择合适的输入组件
 * 支持文本、数值、日期、布尔值、枚举、数组、范围等多种输入类型
 */
export function ValueInput(props: ValueInputProps) {
  const {
    field,
    operator,
    value,
    onChange,
    disabled = false,
    placeholder,
    className,
    error,
  } = props

  const operatorConfig = useMemo(() => getOperatorConfig(operator), [operator])

  /**
   * 渲染输入组件
   */
  const renderInput = useCallback(() => {
    // 不需要值的操作符
    if (!operatorConfig?.requiresValue) {
      return (
        <div className="flex items-center justify-center h-10 text-sm text-muted-foreground bg-muted/30 rounded-md">
          无需输入值
        </div>
      )
    }

    // 数组值输入
    if (operatorConfig.requiresArray) {
      return (
        <FreeInputMultiSelect
          disabled={disabled}
          field={field}
          placeholder={placeholder}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      )
    }

    // 范围值输入
    if (operatorConfig.requiresRange) {
      return (
        <RangeInput
          disabled={disabled}
          fieldType={field.type}
          placeholder={[placeholder ?? '最小值', '最大值']}
          value={Array.isArray(value) && value.length === 2
            ? (value as [string | number | undefined, string | number | undefined])
            : [undefined, undefined]}
          onChange={onChange}
        />
      )
    }

    // 根据字段类型渲染输入组件
    switch (field.type) {
      case FieldTypeEnum.BOOLEAN: {
        if (field.options) {
          return (
            <Select
              disabled={disabled}
              value={value as string | undefined}
              onValueChange={onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder ?? '请选择'} />
              </SelectTrigger>

              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }

        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(value)}
              disabled={disabled}
              onCheckedChange={onChange}
            />
            <Label className="text-sm">
              {value ? '是' : '否'}
            </Label>
          </div>
        )
      }

      case FieldTypeEnum.ENUM:
        return (
          <Select
            disabled={disabled}
            value={safeStringify(value)}
            onValueChange={onChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder ?? '请选择'} />
            </SelectTrigger>

            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case FieldTypeEnum.DATE:
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                )}
                disabled={disabled}
                variant="outline"
              >
                <Calendar className="mr-2" />
                {value !== null && value !== undefined
                  ? format(new Date(safeStringify(value)), 'yyyy-MM-dd')
                  : (placeholder ?? '选择日期')}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={
                  value !== null && value !== undefined
                    ? new Date(safeStringify(value))
                    : undefined
                }
                onSelect={(date) => {
                  onChange?.(date?.toISOString().split('T')[0])
                }}
              />
            </PopoverContent>
          </Popover>
        )

      case FieldTypeEnum.NUMBER:
        return (
          <Input
            disabled={disabled}
            placeholder={placeholder ?? '输入数值'}
            type="number"
            value={safeStringify(value)}
            onChange={(e) => {
              onChange?.(e.target.value ? Number(e.target.value) : undefined)
            }}
          />
        )

      default:
        return (
          <Input
            disabled={disabled}
            placeholder={placeholder ?? '输入文本'}
            type="text"
            value={safeStringify(value)}
            onChange={(e) => { onChange?.(e.target.value) }}
          />
        )
    }
  }, [field, operatorConfig, value, onChange, disabled, placeholder])

  return (
    <div className={cn('space-y-1', className)}>
      {renderInput()}
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
