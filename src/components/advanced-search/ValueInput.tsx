/**
 * 动态值输入组件
 *
 * 根据字段类型和操作符自动选择合适的输入组件
 * 支持文本、数值、日期、布尔值、枚举、数组、范围等多种输入类型
 */

'use client'

import { useCallback, useMemo, useState } from 'react'

import { format } from 'date-fns'
import { Calendar, CalendarClock, Plus, X } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Calendar as CalendarComponent } from '~/components/ui/calendar'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import type { FieldTypeEnum } from '~/constants/form'
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
  value: unknown
  /** 值变更回调 */
  onChange: (value: unknown) => void
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
 * 标签输入组件（用于数组值输入）
 */
interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  fieldType?: FieldTypeEnum
}

function TagInput({ value = [], onChange, placeholder, disabled, fieldType }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  /**
   * 添加标签
   */
  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim()

    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag])
    }

    setInputValue('')
  }, [value, onChange])

  /**
   * 删除标签
   */
  const removeTag = useCallback((index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }, [value, onChange])

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    }
    else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    }
  }, [inputValue, addTag, value.length, removeTag])

  /**
   * 验证输入值
   */
  const validateInput = useCallback((input: string): boolean => {
    if (!input.trim()) {
      return false
    }

    if (fieldType === FieldTypeEnum.NUMBER) {
      return !isNaN(Number(input))
    }

    return true
  }, [fieldType])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-[2.5rem] p-2 border rounded-md bg-background">
        {value.map((tag, index) => (
          <Badge key={index} className="flex items-center gap-1" variant="secondary">
            {tag}
            {!disabled && (
              <button
                className="ml-1 h-3 w-3 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                type="button"
                onClick={() => { removeTag(index) }}
              >
                <X className="h-2 w-2" />
              </button>
            )}
          </Badge>
        ))}
        {!disabled && (
          <Input
            className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0"
            placeholder={value.length === 0 ? placeholder : '添加更多...'}
            style={{ minHeight: '1.5rem' }}
            value={inputValue}
            onBlur={() => { addTag(inputValue) }}
            onChange={(e) => { setInputValue(e.target.value) }}
            onKeyDown={handleKeyDown}
          />
        )}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Button
            disabled={!validateInput(inputValue)}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => { addTag(inputValue) }}
          >
            <Plus className="h-3 w-3 mr-1" />
            添加
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * 范围输入组件（用于 between 操作符）
 */
interface RangeInputProps {
  value: [any, any]
  onChange: (value: [any, any]) => void
  fieldType: FieldTypeEnum
  disabled?: boolean
  placeholder?: [string, string]
}

function RangeInput({ value, onChange, fieldType, disabled, placeholder }: RangeInputProps) {
  const [startValue, endValue] = value || [undefined, undefined]

  const handleStartChange = useCallback((newValue: any) => {
    onChange([newValue, endValue])
  }, [onChange, endValue])

  const handleEndChange = useCallback((newValue: any) => {
    onChange([startValue, newValue])
  }, [onChange, startValue])

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
                  <CalendarClock className="mr-2 h-4 w-4" />
                  {startValue ? format(new Date(startValue), 'yyyy-MM-dd') : '选择日期'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startValue ? new Date(startValue) : undefined}
                  onSelect={(date) => { handleStartChange(date?.toISOString().split('T')[0]) }}
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
                  initialFocus
                  mode="single"
                  selected={endValue ? new Date(endValue) : undefined}
                  onSelect={(date) => { handleEndChange(date?.toISOString().split('T')[0]) }}
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
            placeholder={placeholder?.[0] || '最小值'}
            type="number"
            value={startValue || ''}
            onChange={(e) => { handleStartChange(e.target.value ? Number(e.target.value) : undefined) }}
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">最大值</Label>
          <Input
            disabled={disabled}
            placeholder={placeholder?.[1] || '最大值'}
            type="number"
            value={endValue || ''}
            onChange={(e) => { handleEndChange(e.target.value ? Number(e.target.value) : undefined) }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * 值输入组件主体
 */
export function ValueInput({
  field,
  operator,
  value,
  onChange,
  disabled = false,
  placeholder,
  className,
  error,
}: ValueInputProps) {
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
        <TagInput
          disabled={disabled}
          fieldType={field.type}
          placeholder={placeholder || '输入值，按 Enter 或逗号分隔'}
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
          placeholder={[placeholder || '最小值', '最大值']}
          value={Array.isArray(value) && value.length === 2 ? value as [any, any] : [undefined, undefined]}
          onChange={onChange}
        />
      )
    }

    // 根据字段类型渲染输入组件
    switch (field.type) {
      case FieldTypeEnum.BOOLEAN:
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

      case FieldTypeEnum.ENUM:
        return (
          <Select disabled={disabled} value={value || undefined} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || '请选择'} />
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
                <Calendar className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'yyyy-MM-dd') : (placeholder || '选择日期')}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <CalendarComponent
                initialFocus
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => { onChange(date?.toISOString().split('T')[0]) }}
              />
            </PopoverContent>
          </Popover>
        )

      case FieldTypeEnum.NUMBER:
        return (
          <Input
            disabled={disabled}
            placeholder={placeholder || '输入数值'}
            type="number"
            value={value || ''}
            onChange={(e) => { onChange(e.target.value ? Number(e.target.value) : undefined) }}
          />
        )

      case FieldTypeEnum.STRING:

      default:
        // 正则表达式使用 textarea
        if (operator === 'regex') {
          return (
            <div className="space-y-2">
              <Textarea
                disabled={disabled}
                placeholder={placeholder || '输入正则表达式'}
                rows={3}
                value={value || ''}
                onChange={(e) => { onChange(e.target.value) }}
              />
              <div className="text-xs text-muted-foreground">
                示例：^[a-zA-Z0-9]+$，.*@gmail\\.com$
              </div>
            </div>
          )
        }

        return (
          <Input
            disabled={disabled}
            placeholder={placeholder || '输入文本'}
            type="text"
            value={value || ''}
            onChange={(e) => { onChange(e.target.value) }}
          />
        )
    }
  }, [field, operator, operatorConfig, value, onChange, disabled, placeholder])

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
