/**
 * 高级搜索配置器主组件
 *
 * 提供完整的搜索条件构建界面，包括条件管理、全局搜索、排序、分页等功能
 * 支持拖拽排序、导入导出、模板保存等高级特性
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Play,
  Plus,
  RotateCcw,
  SortAsc,
  SortDesc,
  Trash2,
} from 'lucide-react'

import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useSearchBuilder } from '~/hooks/advanced-search/useSearchBuilder'
import { cn } from '~/lib/utils'
import { type SearchBuilderProps, type SearchField } from '~/types/advanced-search'
import { getOperatorsByFieldType } from '~/utils/advanced-search/search-config'

import { SearchConditionCard } from './SearchConditionCard'
import { SearchPreview } from './SearchPreview'

/**
 * 可排序的搜索条件项
 */
interface SortableConditionItemProps {
  condition: any
  fields: SearchField[]
  onUpdate: (updates: any) => void
  onDelete: () => void
  onDuplicate: () => void
  error?: any
  isLast: boolean
  compact: boolean
}

function SortableConditionItem({
  condition,
  fields,
  onUpdate,
  onDelete,
  onDuplicate,
  error,
  isLast,
  compact,
}: SortableConditionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: condition.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <SearchConditionCard
        compact={compact}
        condition={condition}
        dragAttributes={attributes}
        dragListeners={listeners}
        dragStyle={style}
        error={error}
        fields={fields}
        isLast={isLast}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onUpdate={onUpdate}
      />
    </div>
  )
}

/**
 * 快速添加条件面板
 */
interface QuickAddPanelProps {
  fields: SearchField[]
  onAddCondition: (field: string) => void
  maxConditions: number
  currentCount: number
}

function QuickAddPanel(
  { fields, onAddCondition, maxConditions, currentCount }: QuickAddPanelProps,
) {
  const [isExpanded, setIsExpanded] = useState(false)

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

  const canAddMore = currentCount < maxConditions

  return (
    <Card className="border-dashed">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <CardTitle className="text-sm">添加搜索条件</CardTitle>
                <Badge variant="secondary">
                  {currentCount}/{maxConditions}
                </Badge>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            <CardDescription>
              点击字段快速添加搜索条件
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            {!canAddMore
              ? (
                  <Alert>
                    <AlertDescription>
                      已达到最大条件数量限制 ({maxConditions})
                    </AlertDescription>
                  </Alert>
                )
              : (
                  <div className="space-y-4">
                    {groupedFields.map((group) => (
                      <div key={group.label} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {group.label}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {group.fields.map((field) => (
                            <Button
                              key={field.key}
                              className="justify-start h-auto p-3"
                              size="sm"
                              variant="outline"
                              onClick={() => { onAddCondition(field.key) }}
                            >
                              <div className="flex flex-col items-start gap-1 w-full">
                                <div className="flex items-center gap-2 w-full">
                                  <Badge className="text-xs" variant="secondary">
                                    {field.type}
                                  </Badge>
                                  <span className="text-sm font-medium truncate">
                                    {field.label}
                                  </span>
                                </div>
                                {field.description && (
                                  <span className="text-xs text-muted-foreground text-left">
                                    {field.description}
                                  </span>
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

/**
 * 高级搜索配置器主组件
 */
export function SearchBuilder({
  fields,
  initialConfig,
  onChange,
  onSearch,
  showPreview = true,
  enableDragSort = true,
  maxConditions = 10,
  className,
  disabled = false,
}: SearchBuilderProps) {
  const [activeTab, setActiveTab] = useState('conditions')

  // 使用搜索配置器 Hook
  const {
    config,
    setConfig,
    addCondition,
    updateCondition,
    removeCondition,
    moveCondition,
    duplicateCondition,
    clearConditions,
    setGlobalSearch,
    setSorting,
    setPagination,
    setDefaultLogicalOperator,
    validateConfig,

    reset,
    isValid,
    errors,
  } = useSearchBuilder({
    initialConfig,
    onChange,
    maxConditions,
  })

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = config.conditions.findIndex((condition) => condition.id === active.id)
      const newIndex = config.conditions.findIndex((condition) => condition.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        moveCondition(oldIndex, newIndex)
      }
    }
  }, [config.conditions, moveCondition])

  /**
   * 快速添加条件
   */
  const handleQuickAddCondition = useCallback((fieldKey: string) => {
    const field = fields.find((f) => f.key === fieldKey)

    if (field) {
      const operators = getOperatorsByFieldType(field.type)
      const defaultOperator = operators[0]?.value || 'eq'
      addCondition(fieldKey, defaultOperator)
    }
  }, [fields, addCondition])

  /**
   * 执行搜索
   */
  const handleSearch = useCallback(() => {
    const validationErrors = validateConfig(fields)

    if (validationErrors.length === 0 && onSearch) {
      onSearch(config)
    }
  }, [validateConfig, fields, onSearch, config])

  // 验证配置
  useEffect(() => {
    validateConfig(fields)
  }, [config, fields, validateConfig])

  const conditionItems = config.conditions.map((condition) => condition.id)

  return (
    <div className={cn('space-y-6', className)}>
      {/* 头部工具栏 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                高级搜索配置器
              </CardTitle>
              <CardDescription>
                构建复杂的搜索条件，支持多字段、多操作符组合查询
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isValid ? 'default' : 'destructive'}>
                {isValid ? '有效' : '无效'}
              </Badge>
              <Badge variant="secondary">
                {config.conditions.filter((c) => c.enabled !== false).length} 条件
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              className="gap-2"
              disabled={!isValid || disabled}
              onClick={handleSearch}
            >
              <Play className="h-4 w-4" />
              执行搜索
            </Button>

            <Button
              className="gap-2"
              disabled={config.conditions.length === 0 || disabled}
              variant="outline"
              onClick={() => { clearConditions() }}
            >
              <Trash2 className="h-4 w-4" />
              清空条件
            </Button>

            <Button
              className="gap-2"
              disabled={disabled}
              variant="outline"
              onClick={reset}
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容区域 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conditions">搜索条件</TabsTrigger>
              <TabsTrigger value="global">全局设置</TabsTrigger>
              <TabsTrigger value="sorting">排序分页</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="conditions">
              {/* 快速添加面板 */}
              <QuickAddPanel
                currentCount={config.conditions.length}
                fields={fields}
                maxConditions={maxConditions}
                onAddCondition={handleQuickAddCondition}
              />

              {/* 搜索条件列表 */}
              {config.conditions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">搜索条件列表</CardTitle>
                    <CardDescription>
                      {enableDragSort ? '拖拽可调整条件顺序' : '按添加顺序排列'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[600px]">
                      <div className="space-y-4">
                        {enableDragSort
                          ? (
                              <DndContext
                                collisionDetection={closestCenter}
                                sensors={sensors}
                                onDragEnd={handleDragEnd}
                              >
                                <SortableContext items={conditionItems} strategy={verticalListSortingStrategy}>
                                  {config.conditions.map((condition, index) => (
                                    <SortableConditionItem
                                      key={condition.id}
                                      compact={false}
                                      condition={condition}
                                      error={errors.find((e) => e.conditionId === condition.id)}
                                      fields={fields}
                                      isLast={index === config.conditions.length - 1}
                                      onDelete={() => { removeCondition(condition.id) }}
                                      onDuplicate={() => { duplicateCondition(condition.id) }}
                                      onUpdate={(updates) => { updateCondition(condition.id, updates) }}
                                    />
                                  ))}
                                </SortableContext>
                              </DndContext>
                            )
                          : (
                              config.conditions.map((condition, index) => (
                                <SearchConditionCard
                                  key={condition.id}
                                  compact={false}
                                  condition={condition}
                                  error={errors.find((e) => e.conditionId === condition.id)}
                                  fields={fields}
                                  isLast={index === config.conditions.length - 1}
                                  showDragHandle={false}
                                  onDelete={() => { removeCondition(condition.id) }}
                                  onDuplicate={() => { duplicateCondition(condition.id) }}
                                  onUpdate={(updates) => { updateCondition(condition.id, updates) }}
                                />
                              ))
                            )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent className="space-y-4" value="global">
              <Card>
                <CardHeader>
                  <CardTitle>全局搜索设置</CardTitle>
                  <CardDescription>
                    配置全局搜索关键词和搜索模式
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="global-search">全局搜索关键词</Label>
                    <Input
                      disabled={disabled}
                      id="global-search"
                      placeholder="输入全局搜索关键词"
                      value={config.globalSearch ?? ''}
                      onChange={(e) => { setGlobalSearch(e.target.value) }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search-mode">搜索模式</Label>
                    <Select
                      value={config.searchMode ?? 'advanced'}
                      onValueChange={(value: any) => {
                        setConfig((prev) => ({ ...prev, searchMode: value }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">全局搜索</SelectItem>
                        <SelectItem value="exact">精确匹配</SelectItem>
                        <SelectItem value="combined">组合搜索</SelectItem>
                        <SelectItem value="advanced">高级搜索</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logical-operator">默认逻辑运算符</Label>
                    <Select
                      value={config.defaultLogicalOperator ?? 'and'}
                      onValueChange={setDefaultLogicalOperator}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="and">AND（且）</SelectItem>
                        <SelectItem value="or">OR（或）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-4" value="sorting">
              <Card>
                <CardHeader>
                  <CardTitle>排序设置</CardTitle>
                  <CardDescription>
                    配置结果排序字段和方向
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sort-field">排序字段</Label>
                      <Select
                        value={config.sortBy ?? '__none__'}
                        onValueChange={(value) => { setSorting(value === '__none__' ? undefined : value, config.sortOrder) }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择排序字段" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">无排序</SelectItem>
                          {fields.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sort-order">排序方向</Label>
                      <Select
                        disabled={!config.sortBy}
                        value={config.sortOrder ?? 'asc'}
                        onValueChange={(value: any) => { setSorting(config.sortBy, value) }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">
                            <div className="flex items-center gap-2">
                              <SortAsc className="h-4 w-4" />
                              升序
                            </div>
                          </SelectItem>
                          <SelectItem value="desc">
                            <div className="flex items-center gap-2">
                              <SortDesc className="h-4 w-4" />
                              降序
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>分页设置</CardTitle>
                  <CardDescription>
                    配置分页参数
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="page">当前页码</Label>
                      <Input
                        disabled={disabled}
                        id="page"
                        min="1"
                        type="number"
                        value={config.pagination.page}
                        onChange={(e) => { setPagination(Number(e.target.value) || 1) }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="page-size">每页条数</Label>
                      <Select
                        value={String(config.pagination.pageSize)}
                        onValueChange={(value) => {
                          setPagination(config.pagination.page, Number(value))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 条/页</SelectItem>
                          <SelectItem value="20">20 条/页</SelectItem>
                          <SelectItem value="50">50 条/页</SelectItem>
                          <SelectItem value="100">100 条/页</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 预览面板 */}
        {showPreview && (
          <div className="space-y-6">
            <SearchPreview config={config} />
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            发现 {errors.length} 个配置错误，请检查搜索条件设置
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
