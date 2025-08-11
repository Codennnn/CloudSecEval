'use client'

import { useCallback, useMemo } from 'react'

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
import { cn } from '~/lib/utils'
import type { LogicalOperator, SearchCondition, SearchField, SearchValidationError } from '~/types/advanced-search'

import { OperatorSelect, SimpleOperatorSelect } from './OperatorSelect'
import { ValueInput } from './ValueInput'

interface SearchConditionProps {
  /** 搜索条件 */
  condition: SearchCondition
  /** 可选择的字段列表 */
  fields: SearchField[]
  /** 条件更新回调 */
  onUpdate?: (conditionId: string, updates: Partial<SearchCondition>) => void
  /** 删除条件回调 */
  onDelete?: (conditionId: string) => void
  /** 复制条件回调 */
  onDuplicate?: (conditionId: string) => void
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
    onUpdate,
    onDelete,
    onDuplicate,
    error,
    isLast = false,
    index,
    className,
  } = props

  /**
   * 获取当前字段配置
   */
  const currentField = useMemo(() => {
    return fields.find((field) => field.key === condition.field)
  }, [fields, condition.field])

  /**
   * 处理字段变更
   */
  const handleFieldChange = useCallback((fieldKey: string) => {
    const field = fields.find((f) => f.key === fieldKey)

    if (field) {
      // 重置操作符和值
      onUpdate?.(condition.id, {
        field: fieldKey,
        operator: 'eq', // 默认操作符
        value: undefined,
      })
    }
  }, [fields, onUpdate, condition.id])

  /**
   * 处理操作符变更
   */
  const handleOperatorChange = useCallback((operator: any) => {
    onUpdate?.(condition.id, {
      operator,
      value: undefined, // 重置值
    })
  }, [onUpdate, condition.id])

  /**
   * 处理值变更
   */
  const handleValueChange = useCallback((value: any) => {
    onUpdate?.(condition.id, { value })
  }, [onUpdate, condition.id])

  /**
   * 处理逻辑运算符变更
   */
  const handleLogicalOperatorChange = useCallback((logicalOperator: LogicalOperator) => {
    onUpdate?.(condition.id, { logicalOperator })
  }, [onUpdate, condition.id])

  /**
   * 处理删除条件
   */
  const handleDelete = useCallback(() => {
    onDelete?.(condition.id)
  }, [onDelete, condition.id])

  /**
   * 处理复制条件
   */
  const handleDuplicate = useCallback(() => {
    onDuplicate?.(condition.id)
  }, [onDuplicate, condition.id])

  /**
   * 渲染字段选择器
   */
  const renderFieldSelect = () => (
    <Select value={condition.field} onValueChange={handleFieldChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="选择字段">
          <TextSearchIcon className="size-4" />
          {currentField && (
            <span>{currentField.label}</span>
          )}
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
    if (!currentField) {
      return null
    }

    return (
      <SimpleOperatorSelect
        fieldType={currentField.type}
        value={condition.operator}
        onChange={handleOperatorChange}
      />
    )
  }

  /**
   * 渲染值输入器
   */
  const renderValueInput = () => {
    if (!currentField) {
      return null
    }

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
          'grid grid-cols-4 gap-3',
        )}
      >
        {/* 逻辑运算符（前置） */}
        {index > 0 && !isLast && (
          <div className="flex items-center">
            {renderLogicalOperatorSelect()}
          </div>
        )}

        {/* 字段选择 */}
        <div>
          {renderFieldSelect()}
        </div>

        {/* 操作符选择 */}
        <div>
          {renderOperatorSelect()}
        </div>

        {/* 值输入 */}
        <div>
          {renderValueInput()}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
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

interface SearchConditionsProps {
  /** 搜索条件列表 */
  conditions?: SearchCondition[]
  /** 可选择的字段列表 */
  fields: SearchField[]
  /** 条件更新回调 */
  onUpdateCondition?: (conditionId: string, updates: Partial<SearchCondition>) => void
  /** 删除条件回调 */
  onDeleteCondition?: (conditionId: string) => void
  /** 复制条件回调 */
  onDuplicateCondition?: (conditionId: string) => void
  /** 验证错误列表 */
  errors?: SearchValidationError[]
  /** 自定义样式类名 */
  className?: string
}

export function SearchConditions(props: SearchConditionsProps) {
  const {
    conditions,
    fields,
    onUpdateCondition,
    onDeleteCondition,
    onDuplicateCondition,
    errors = [],
    className,
  } = props

  /**
   * 获取条件的验证错误
   */
  const getConditionError = useCallback((conditionId: string) => {
    return errors.find((error) => error.conditionId === conditionId)
  }, [errors])

  return (
    <div className={cn('space-y-3', className)}>
      {Array.isArray(conditions) && conditions.length > 0
        ? (
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
          )
        : (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无搜索条件</p>
              <p className="text-sm">点击"添加条件"开始构建搜索</p>
            </div>
          )}
    </div>
  )
}
