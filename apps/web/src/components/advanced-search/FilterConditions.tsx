'use client'

import { useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import {
  CopyIcon,
  EllipsisVerticalIcon,
  TextSearchIcon,
  Trash2Icon,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { SearchOperatorEnum } from '~/constants/form'
import { cn } from '~/lib/utils'
import type {
  FilterCondition,
  SearchField,
  SearchOperator,
  SearchValidationError,
} from '~/types/advanced-search'
import { isSameOperatorGroup } from '~/utils/advanced-search/search-config'

import { SearchConditionOperatorSelect } from './SearchConditionOperatorSelect'
import { ValueInput } from './ValueInput'

import type { LogicalOperator } from '~api/types.gen'

interface SearchConditionProps {
  /** 搜索条件 */
  condition: FilterCondition
  /** 可选择的字段列表 */
  fields: SearchField[]
  /** 条件更新回调 */
  onUpdate?: (condition: FilterCondition['id'], updates: Partial<FilterCondition>) => void
  /** 删除条件回调 */
  onDelete?: (condition: FilterCondition['id']) => void
  /** 复制条件回调 */
  onDuplicate?: (condition: FilterCondition['id']) => void
  /** 验证错误 */
  error?: SearchValidationError
  /** 是否为最后一个条件 */
  isLast?: boolean
  /** 条件索引 */
  index: number
  /** 自定义样式类名 */
  className?: string
}

function SearchConditionRow(props: SearchConditionProps) {
  const {
    condition,
    fields,
    error,
    isLast = false,
    index,
    className,

    onUpdate,
    onDelete,
    onDuplicate,
  } = props

  /**
   * 获取当前字段配置
   */
  const currentField = useMemo(() => {
    return fields.find((field) => field.key === condition.field)
  }, [fields, condition.field])

  const handleFieldChange = useEvent((fieldKey: string) => {
    const field = fields.find((f) => f.key === fieldKey)

    if (field) {
      // 重置操作符和值
      onUpdate?.(condition.id, {
        field: fieldKey,
        operator: SearchOperatorEnum.EQ, // 默认操作符
        value: undefined,
      })
    }
  })

  const handleOperatorChange = useEvent((operator: SearchOperator) => {
    // 判断新操作符与当前操作符是否属于同一分组
    const shouldResetValue = !isSameOperatorGroup(condition.operator, operator)

    onUpdate?.(condition.id, {
      operator,
      // 只有在切换到不同分组时才重置值
      value: shouldResetValue ? undefined : condition.value,
    })
  })

  const handleValueChange = useEvent((value: unknown) => {
    onUpdate?.(condition.id, { value: value as FilterCondition['value'] })
  })

  const handleLogicalOperatorChange = useEvent((logicalOperator: LogicalOperator) => {
    onUpdate?.(condition.id, { logicalOperator })
  })

  /**
   * 处理删除条件
   */
  const handleDelete = useEvent(() => {
    onDelete?.(condition.id)
  })

  /**
   * 处理复制条件
   */
  const handleDuplicate = useEvent(() => {
    onDuplicate?.(condition.id)
  })

  /**
   * 渲染字段选择器
   */
  const renderFieldSelect = () => (
    <Select
      value={condition.field}
      onValueChange={handleFieldChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="选择字段">
          <TextSearchIcon />
          {currentField?.label ?? '选择字段'}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {fields.map((field) => (
          <SelectItem key={field.key} value={field.key}>
            <span>{field.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  /**
   * 渲染操作符选择器
   */
  const renderOperatorSelect = () => {
    if (currentField) {
      return (
        <SearchConditionOperatorSelect
          fieldType={currentField.type}
          value={condition.operator}
          onChange={handleOperatorChange}
        />
      )
    }

    return null
  }

  /**
   * 渲染值输入器
   */
  const renderValueInput = () => {
    if (currentField) {
      return (
        <ValueInput
          error={error?.message}
          field={currentField}
          operator={condition.operator}
          value={condition.value}
          onChange={handleValueChange}
        />
      )
    }

    return null
  }

  /**
   * 渲染逻辑运算符选择器
   */
  const renderLogicalOperatorSelect = () => {
    return (
      <Select
        value={condition.logicalOperator ?? 'and'}
        onValueChange={handleLogicalOperatorChange}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="and">与</SelectItem>
          <SelectItem value="or">或</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* 条件行 */}
      <div
        className={cn(
          'grid gap-3',
          'grid-cols-[1fr_130px_1fr_auto]',
        )}
      >
        {/* 逻辑运算符（前置） */}
        {index > 0 && !isLast && (
          <div className="flex items-center">
            {renderLogicalOperatorSelect()}
          </div>
        )}

        {/* MARK: 字段选择 */}
        <div>
          {renderFieldSelect()}
        </div>

        {/* MARK: 操作符选择 */}
        <div>
          {renderOperatorSelect()}
        </div>

        {/* MARK: 值输入 */}
        <div>
          {renderValueInput()}
        </div>

        {/* 操作按钮 */}
        <div className="pt-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="data-[state=open]:bg-muted text-muted-foreground"
                size="iconNormal"
                variant="ghost"
              >
                <EllipsisVerticalIcon className="h-4 w-4" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>
                <CopyIcon />
                复制条件
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2Icon />
                删除条件
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 错误提示 */}
      {!!error && <div>{error.message}</div>}
    </div>
  )
}

interface FilterConditionsProps {
  /** 筛选条件列表 */
  conditions?: FilterCondition[]
  /** 可选择的字段列表 */
  fields: SearchField[]
  /** 验证错误列表 */
  errors?: SearchValidationError[]
  /** 自定义样式类名 */
  className?: string

  /** 条件更新回调 */
  onUpdateCondition?: (condition: FilterCondition['id'], updates: Partial<FilterCondition>) => void
  /** 删除条件回调 */
  onDeleteCondition?: (condition: FilterCondition['id']) => void
  /** 复制条件回调 */
  onDuplicateCondition?: (condition: FilterCondition['id']) => void
}

export function FilterConditions(props: FilterConditionsProps) {
  const {
    conditions,
    fields,
    errors = [],
    className,

    onUpdateCondition,
    onDeleteCondition,
    onDuplicateCondition,
  } = props

  /**
   * 获取条件的验证错误
   */
  const getConditionError: (conditionId: FilterCondition['id']) => SearchValidationError | undefined
    = (conditionId) => {
      return errors.find((error) => error.conditionId === conditionId)
    }

  return (
    <div className={className}>
      {Array.isArray(conditions) && conditions.length > 0
        ? (
            <div className="space-y-3">
              {
                conditions.map((condition, idx) => (
                  <SearchConditionRow
                    key={condition.id}
                    condition={condition}
                    error={getConditionError(condition.id)}
                    fields={fields}
                    index={idx}
                    isLast={idx === conditions.length - 1}
                    onDelete={onDeleteCondition}
                    onDuplicate={onDuplicateCondition}
                    onUpdate={onUpdateCondition}
                  />
                ))
              }
            </div>
          )
        : (
            <div className="text-center py-8 space-y-1 text-muted-foreground">
              <div>暂无筛选条件</div>
              <div className="text-sm">点击「添加条件」开始构建筛选</div>
            </div>
          )}
    </div>
  )
}
