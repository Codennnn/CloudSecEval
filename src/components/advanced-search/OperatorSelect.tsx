/**
 * 操作符选择组件
 *
 * 根据字段类型动态显示支持的操作符
 * 提供操作符描述和分组显示功能
 */

'use client'

import { useMemo } from 'react'

import { Info, Search } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import type { FieldType, SearchOperator } from '~/types/advanced-search'
import { getOperatorConfig, getOperatorsByFieldType } from '~/utils/advanced-search/search-config'

/**
 * 操作符选择组件属性
 */
interface OperatorSelectProps {
  /** 字段类型 */
  fieldType: FieldType
  /** 当前选中的操作符 */
  value: SearchOperator | undefined
  /** 操作符变更回调 */
  onChange: (operator: SearchOperator) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符 */
  placeholder?: string
  /** 自定义样式类名 */
  className?: string
  /** 是否显示操作符描述 */
  showDescription?: boolean
}

/**
 * 操作符分组配置
 */
const OPERATOR_GROUPS = {
  equality: {
    label: '相等性',
    operators: ['eq', 'neq'] as SearchOperator[],
  },
  inclusion: {
    label: '包含性',
    operators: ['in', 'notIn', 'contains', 'startsWith', 'endsWith'] as SearchOperator[],
  },
  comparison: {
    label: '比较',
    operators: ['gt', 'gte', 'lt', 'lte', 'between'] as SearchOperator[],
  },
  pattern: {
    label: '模式匹配',
    operators: ['regex', 'ilike'] as SearchOperator[],
  },
  nullability: {
    label: '空值检查',
    operators: ['isNull', 'isNotNull'] as SearchOperator[],
  },
} as const

/**
 * 操作符选择组件
 */
export function OperatorSelect({
  fieldType,
  value,
  onChange,
  disabled = false,
  placeholder = '选择操作符',
  className,
  showDescription = true,
}: OperatorSelectProps) {
  /**
   * 获取支持的操作符
   */
  const supportedOperators = useMemo(() => {
    return getOperatorsByFieldType(fieldType)
  }, [fieldType])

  /**
   * 按分组组织操作符
   */
  const groupedOperators = useMemo(() => {
    const groups: { label: string, operators: typeof supportedOperators }[] = []

    Object.entries(OPERATOR_GROUPS).forEach(([groupKey, groupConfig]) => {
      const groupOperators = supportedOperators.filter((operator) =>
        groupConfig.operators.includes(operator.value),
      )

      if (groupOperators.length > 0) {
        groups.push({
          label: groupConfig.label,
          operators: groupOperators,
        })
      }
    })

    return groups
  }, [supportedOperators])

  /**
   * 获取当前选中操作符的配置
   */
  const selectedOperatorConfig = useMemo(() => {
    return value ? getOperatorConfig(value) : undefined
  }, [value])

  /**
   * 渲染操作符选项
   */
  const renderOperatorOption = (operator: typeof supportedOperators[0]) => (
    <SelectItem key={operator.value} value={operator.value}>
      <div className="flex items-center gap-2 w-full">
        <span className="font-medium">{operator.label}</span>
        {showDescription && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-medium">{operator.label}</p>
                  {operator.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {operator.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {operator.requiresValue && (
                      <Badge className="text-xs" variant="outline">
                        需要值
                      </Badge>
                    )}
                    {operator.requiresArray && (
                      <Badge className="text-xs" variant="outline">
                        数组
                      </Badge>
                    )}
                    {operator.requiresRange && (
                      <Badge className="text-xs" variant="outline">
                        范围
                      </Badge>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </SelectItem>
  )

  return (
    <div className={cn('space-y-1', className)}>
      <Select
        disabled={disabled}
        value={value || undefined}
        onValueChange={(newValue) => { onChange(newValue as SearchOperator) }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {selectedOperatorConfig && (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>{selectedOperatorConfig.label}</span>
                {showDescription && (
                  <div className="flex gap-1">
                    {selectedOperatorConfig.requiresValue && (
                      <Badge className="text-xs" variant="outline">
                        需要值
                      </Badge>
                    )}
                    {selectedOperatorConfig.requiresArray && (
                      <Badge className="text-xs" variant="outline">
                        数组
                      </Badge>
                    )}
                    {selectedOperatorConfig.requiresRange && (
                      <Badge className="text-xs" variant="outline">
                        范围
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {groupedOperators.map((group, groupIndex) => (
            <div key={group.label}>
              {groupIndex > 0 && <Separator className="my-1" />}
              <div className="px-2 py-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </div>
              </div>
              {group.operators.map(renderOperatorOption)}
            </div>
          ))}
        </SelectContent>
      </Select>

      {/* 显示操作符详细信息 */}
      {value && selectedOperatorConfig && showDescription && (
        <div className="text-xs text-muted-foreground">
          {selectedOperatorConfig.description}
        </div>
      )}
    </div>
  )
}

type SimpleOperatorSelectProps = Omit<OperatorSelectProps, 'showDescription'>

/**
 * 简化版操作符选择组件（不分组）
 */
export function SimpleOperatorSelect({
  fieldType,
  value,
  onChange,
  disabled = false,
  placeholder = '选择操作符',
  className,
}: SimpleOperatorSelectProps) {
  const supportedOperators = useMemo(() => {
    return getOperatorsByFieldType(fieldType)
  }, [fieldType])

  return (
    <Select
      disabled={disabled}
      value={value}
      onValueChange={(newValue: SearchOperator) => { onChange(newValue) }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {supportedOperators.map((operator) => (
          <SelectItem key={operator.value} value={operator.value}>
            {operator.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
