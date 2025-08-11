/**
 * 搜索条件卡片组件
 *
 * 单个搜索条件的可视化卡片，包含字段选择、操作符选择、值输入等功能
 * 支持拖拽排序、条件启用/禁用、复制删除等操作
 */

'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Settings,
  Trash2,
} from 'lucide-react'

import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'
import { cn } from '~/lib/utils'
import type { LogicalOperator, SearchCondition, SearchField, SearchValidationError } from '~/types/advanced-search'

import { OperatorSelect } from './OperatorSelect'
import { ValueInput } from './ValueInput'

/**
 * 搜索条件卡片组件属性
 */
interface SearchConditionCardProps {
  /** 搜索条件 */
  condition: SearchCondition
  /** 可选择的字段列表 */
  fields: SearchField[]
  /** 条件更新回调 */
  onUpdate: (updates: Partial<SearchCondition>) => void
  /** 删除条件回调 */
  onDelete: () => void
  /** 复制条件回调 */
  onDuplicate: () => void
  /** 验证错误 */
  error?: SearchValidationError
  /** 是否显示拖拽手柄 */
  showDragHandle?: boolean
  /** 是否显示逻辑运算符选择 */
  showLogicalOperator?: boolean
  /** 是否是最后一个条件 */
  isLast?: boolean
  /** 是否紧凑模式 */
  compact?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 拖拽属性（由 DndKit 提供） */
  dragAttributes?: any
  /** 拖拽监听器（由 DndKit 提供） */
  dragListeners?: any
  /** 拖拽样式 */
  dragStyle?: React.CSSProperties
}

/**
 * 搜索条件卡片组件
 */
export function SearchConditionCard({
  condition,
  fields,
  onUpdate,
  onDelete,
  onDuplicate,
  error,
  showDragHandle = true,
  showLogicalOperator = true,
  isLast = false,
  compact = false,
  className,
  dragAttributes,
  dragListeners,
  dragStyle,
}: SearchConditionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  /**
   * 获取当前字段配置
   */
  const currentField = useMemo(() => {
    return fields.find((field) => field.key === condition.field)
  }, [fields, condition.field])

  /**
   * 按分组组织字段
   */
  const groupedFields = useMemo(() => {
    const groups = new Map<string, SearchField[]>()

    fields.forEach((field) => {
      const group = field.group || '其他'

      if (!groups.has(group)) {
        groups.set(group, [])
      }

      groups.get(group)!.push(field)
    })

    return Array.from(groups.entries()).map(([group, groupFields]) => ({
      label: group,
      fields: groupFields,
    }))
  }, [fields])

  /**
   * 处理字段变更
   */
  const handleFieldChange = useCallback((fieldKey: string) => {
    const field = fields.find((f) => f.key === fieldKey)

    if (field) {
      // 重置操作符和值
      onUpdate({
        field: fieldKey,
        operator: 'eq', // 默认操作符
        value: undefined,
      })
    }
  }, [fields, onUpdate])

  /**
   * 处理操作符变更
   */
  const handleOperatorChange = useCallback((operator: any) => {
    onUpdate({
      operator,
      value: undefined, // 重置值
    })
  }, [onUpdate])

  /**
   * 处理值变更
   */
  const handleValueChange = useCallback((value: any) => {
    onUpdate({ value })
  }, [onUpdate])

  /**
   * 处理逻辑运算符变更
   */
  const handleLogicalOperatorChange = useCallback((logicalOperator: LogicalOperator) => {
    onUpdate({ logicalOperator })
  }, [onUpdate])

  /**
   * 切换启用状态
   */
  const toggleEnabled = useCallback(() => {
    onUpdate({ enabled: !condition.enabled })
  }, [condition.enabled, onUpdate])

  /**
   * 渲染字段选择器
   */
  const renderFieldSelect = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">字段</Label>
      <Select value={condition.field} onValueChange={handleFieldChange}>
        <SelectTrigger>
          <SelectValue placeholder="选择字段">
            {currentField && (
              <div className="flex items-center gap-2">
                <Badge className="text-xs" variant="outline">
                  {currentField.type}
                </Badge>
                <span>{currentField.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {groupedFields.map((group) => (
            <div key={group.label}>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </div>
              {group.fields.map((field) => (
                <SelectItem key={field.key} value={field.key}>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs" variant="outline">
                      {field.type}
                    </Badge>
                    <span>{field.label}</span>
                    {field.description && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {field.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
              {group !== groupedFields[groupedFields.length - 1] && (
                <Separator className="my-1" />
              )}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  /**
   * 渲染操作符选择器
   */
  const renderOperatorSelect = () => {
    if (!currentField) {
      return null
    }

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">操作符</Label>
        <OperatorSelect
          fieldType={currentField.type}
          showDescription={!compact}
          value={condition.operator}
          onChange={handleOperatorChange}
        />
      </div>
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
      <div className="space-y-2">
        <Label className="text-sm font-medium">值</Label>
        <ValueInput
          error={error?.message}
          field={currentField}
          operator={condition.operator}
          value={condition.value}
          onChange={handleValueChange}
        />
      </div>
    )
  }

  /**
   * 渲染逻辑运算符选择
   */
  const renderLogicalOperatorSelect = () => {
    if (!showLogicalOperator || isLast) {
      return null
    }

    return (
      <div className="flex items-center justify-center">
        <Select
          value={condition.logicalOperator ?? 'and'}
          onValueChange={handleLogicalOperatorChange}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and">AND</SelectItem>
            <SelectItem value="or">OR</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} style={dragStyle}>
      <Card
        className={cn(
          'transition-all duration-200',
          condition.enabled === false && 'opacity-60',
          error && 'border-destructive/50 bg-destructive/5',
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {/* 拖拽手柄 */}
            {showDragHandle && (
              <div
                {...dragAttributes}
                {...dragListeners}
                className="flex cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}

            {/* 条件启用开关 */}
            <Switch
              checked={condition.enabled !== false}
              className="data-[state=unchecked]:bg-muted"
              onCheckedChange={toggleEnabled}
            />

            {/* 条件标题 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium truncate">
                  {currentField?.label ?? '未选择字段'}
                </h3>
                {currentField && (
                  <Badge className="text-xs" variant="secondary">
                    {currentField.type}
                  </Badge>
                )}
              </div>
              {currentField && (
                <p className="text-xs text-muted-foreground">
                  使用 "{condition.operator}" 操作符
                </p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1">
              {!compact && (
                <Button
                  className="h-8 w-8 p-0"
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowAdvanced(!showAdvanced) }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              )}

              <Button
                className="h-8 w-8 p-0"
                size="sm"
                variant="ghost"
                onClick={onDuplicate}
              >
                <Copy className="h-3 w-3" />
              </Button>

              <Button
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                size="sm"
                variant="ghost"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              {/* 折叠按钮 */}
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button className="h-8 w-8 p-0" size="sm" variant="ghost">
                    {isExpanded
                      ? (
                          <ChevronUp className="h-3 w-3" />
                        )
                      : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert className="mt-3" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* 主要配置 */}
              <div
                className={cn(
                  'grid gap-4',
                  compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3',
                )}
              >
                {renderFieldSelect()}
                {renderOperatorSelect()}
                {renderValueInput()}
              </div>

              {/* 高级设置 */}
              {showAdvanced && !compact && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">高级设置</h4>
                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>条件ID</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {condition.id}
                        </code>
                      </div>
                      {currentField?.description && (
                        <div className="flex items-start justify-between">
                          <span>字段描述</span>
                          <span className="text-muted-foreground text-right max-w-[200px]">
                            {currentField.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* 逻辑运算符 */}
      {renderLogicalOperatorSelect()}
    </div>
  )
}
