'use client'

import { useId, useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CopyIcon,
  EllipsisVerticalIcon,
  GripVerticalIcon,
  SortAscIcon,
  SortDescIcon,
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
import type {
  SearchField,
  SortCondition,
} from '~/types/advanced-search'

import type { SortOrder } from '~api/types.gen'

/**
 * 拖拽手柄组件
 */
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
      size="icon"
      variant="ghost"
    >
      <GripVerticalIcon className="text-muted-foreground size-4" />
      <span className="sr-only">拖拽排序</span>
    </Button>
  )
}

interface SortConditionProps {
  /** 排序条件 */
  condition: SortCondition
  /** 可选择的字段列表 */
  fields: SearchField[]
  /** 已使用的字段列表 */
  usedFields?: string[]
  /** 自定义样式类名 */
  className?: string

  /** 条件更新回调 */
  onUpdate?: (condition: SortCondition['id'], updates: Partial<SortCondition>) => void
  /** 删除条件回调 */
  onDelete?: (condition: SortCondition['id']) => void
  /** 复制条件回调 */
  onDuplicate?: (condition: SortCondition['id']) => void
}

function SortConditionRow(props: SortConditionProps) {
  const {
    condition,
    fields,
    usedFields = [],
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

  /**
   * 处理字段变更
   */
  const handleFieldChange = useEvent((fieldKey: string) => {
    onUpdate?.(condition.id, {
      field: fieldKey,
    })
  })

  /**
   * 处理排序方向变更
   */
  const handleOrderChange = useEvent((order: SortOrder) => {
    onUpdate?.(condition.id, {
      order,
    })
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
        {fields.map((field) => {
          const isUsed = usedFields.includes(field.key) && field.key !== condition.field

          return (
            <SelectItem
              key={field.key}
              disabled={isUsed}
              value={field.key}
            >
              <div
                className={cn(
                  'flex items-center justify-between w-full',
                  isUsed && 'text-muted-foreground',
                )}
              >
                <span>{field.label}</span>
                {isUsed && (
                  <span className="text-xs ml-2">(已使用)</span>
                )}
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )

  /**
   * 渲染排序方向选择器
   */
  const renderOrderSelect = () => (
    <Select
      value={condition.order}
      onValueChange={handleOrderChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="asc">
          <div className="flex items-center gap-2">
            <SortAscIcon />
            升序
          </div>
        </SelectItem>
        <SelectItem value="desc">
          <div className="flex items-center gap-2">
            <SortDescIcon />
            降序
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )

  return (
    <div className={cn('relative', className)}>
      {/* 条件行 */}
      <div
        className={cn(
          'grid gap-3 items-center',
          'grid-cols-[auto_1fr_1fr_auto]',
        )}
      >
        {/* 拖拽手柄 */}
        <div>
          <DragHandle id={condition.id} />
        </div>

        {/* 字段选择 */}
        <div>
          {renderFieldSelect()}
        </div>

        {/* 排序方向选择 */}
        <div>
          {renderOrderSelect()}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1">
          {/* 更多操作 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
                variant="ghost"
              >
                <EllipsisVerticalIcon />
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
    </div>
  )
}

/**
 * 可拖拽的排序条件组件
 */
function DraggableSortCondition(props: SortConditionProps) {
  const { condition } = props
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: condition.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative z-0',
        isDragging && 'z-10 opacity-80',
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      <SortConditionRow {...props} />
    </div>
  )
}

interface SortConditionsProps {
  /** 排序条件列表 */
  conditions?: SortCondition[]
  /** 可选择的字段列表 */
  fields: SearchField[]
  /** 自定义样式类名 */
  className?: string

  /** 条件更新回调 */
  onUpdateCondition?: (condition: SortCondition['id'], updates: Partial<SortCondition>) => void
  /** 删除条件回调 */
  onDeleteCondition?: (condition: SortCondition['id']) => void
  /** 复制条件回调 */
  onDuplicateCondition?: (condition: SortCondition['id']) => void
  /** 条件列表变更回调 */
  onConditionsChange?: (conditions: SortCondition[]) => void
}

export function SortConditions(props: SortConditionsProps) {
  const {
    conditions = [],
    fields,
    className,

    onUpdateCondition,
    onDeleteCondition,
    onDuplicateCondition,
    onConditionsChange,
  } = props

  // 生成拖拽上下文的唯一 ID
  const sortableId = useId()
  // 设置传感器
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  // 计算已使用的字段列表
  const usedFields = useMemo(() => {
    return conditions.map((condition) => condition.field)
  }, [conditions])

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = useEvent((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = conditions.findIndex((c) => c.id === active.id)
      const newIndex = conditions.findIndex((c) => c.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newConditions = arrayMove(conditions, oldIndex, newIndex)
        onConditionsChange?.(newConditions)
      }
    }
  })

  return (
    <div className={className}>
      {conditions.length > 0
        ? (
            <div className="space-y-3">
              {/* 排序说明 */}
              <div className="text-sm text-muted-foreground">
                排前面的优先级高，可拖拽调整顺序
              </div>

              {/* 排序条件列表 */}
              <DndContext
                collisionDetection={closestCenter}
                id={sortableId}
                modifiers={[restrictToVerticalAxis]}
                sensors={sensors}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={conditions.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {conditions.map((condition) => (
                      <DraggableSortCondition
                        key={condition.id}
                        condition={condition}
                        fields={fields}
                        usedFields={usedFields}
                        onDelete={onDeleteCondition}
                        onDuplicate={onDuplicateCondition}
                        onUpdate={onUpdateCondition}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )
        : (
            <div className="text-center py-8 space-y-1 text-muted-foreground">
              <div>暂无排序条件</div>
              <div className="text-sm">点击「添加排序」开始配置</div>
            </div>
          )}
    </div>
  )
}
