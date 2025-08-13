import { useId } from 'react'
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
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EyeIcon, EyeOffIcon, GripVerticalIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import type { SearchField } from '~/types/advanced-search'

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
      size="sm"
      variant="ghost"
    >
      <GripVerticalIcon />
      <span className="sr-only">拖拽排序</span>
    </Button>
  )
}

interface ColumnVisibilityControlsProps {
  /** 所有字段列表 */
  allFields: SearchField[]
  /** 可见字段列表（已排序） */
  visibleFields: SearchField[]
  /** 隐藏字段列表 */
  hiddenFields: SearchField[]
  /** 切换字段可见性 */
  onToggleVisibility: (fieldKey: string) => void
  /** 重新排序可见列 */
  onReorder: (fromIndex: number, toIndex: number) => void
  /** 显示所有列 */
  onShowAll: () => void
  /** 重置到默认状态 */
  onReset: () => void
  /** 检查是否可以隐藏字段 */
  canHideField: (fieldKey: string) => boolean
}

interface FieldItemProps {
  field: SearchField
  isVisible: boolean
  canHide: boolean
  onToggleVisibility: (fieldKey: string) => void
}

function FieldItem(props: FieldItemProps) {
  const {
    field,
    isVisible,
    canHide = true,
    onToggleVisibility,
  } = props

  const handleToggleClick = useEvent(() => {
    onToggleVisibility(field.key)
  })

  return (
    <div className="flex items-center gap-3">
      {isVisible && (
        <DragHandle id={field.key} />
      )}

      <span className="flex-1 text-sm select-none">
        {field.label}
      </span>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={!canHide}
            size="sm"
            variant="ghost"
            onClick={() => {
              handleToggleClick()
            }}
          >
            {isVisible
              ? (
                  <EyeIcon />
                )
              : (
                  <EyeOffIcon />
                )}
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          {isVisible
            ? (canHide ? '隐藏此列' : '至少需要显示一列')
            : '显示此列'}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

/**
 * 可拖拽的字段项组件
 */
function DraggableFieldItem(props: FieldItemProps) {
  const { field } = props

  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: field.key,
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
        transition,
      }}
    >
      <FieldItem {...props} />
    </div>
  )
}

export function ColumnVisibilityControls(props: ColumnVisibilityControlsProps) {
  const {
    allFields,
    visibleFields,
    hiddenFields,
    onToggleVisibility,
    onReorder,
    onShowAll,
    onReset,
    canHideField,
  } = props

  const sortableId = useId()

  // 配置传感器
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  )

  const handleShowAll = useEvent(() => {
    onShowAll()
  })

  const handleReset = useEvent(() => {
    onReset()
  })

  const handleDragEnd = useEvent((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = visibleFields.findIndex((field) => field.key === active.id)
      const newIndex = visibleFields.findIndex((field) => field.key === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex)
      }
    }
  })

  return (
    <div className="space-y-4">
      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        {hiddenFields.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleShowAll}
          >
            全部显示
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
        >
          重置
        </Button>

        <div className="text-xs text-muted-foreground ml-auto">
          已显示 {visibleFields.length} / {allFields.length} 列
        </div>
      </div>

      {/* 字段列表 */}
      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {/* 可见字段（支持拖拽排序） */}
        {visibleFields.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">可见列</div>
            <DndContext
              collisionDetection={closestCenter}
              id={sortableId}
              modifiers={[restrictToVerticalAxis]}
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleFields.map((f) => f.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {visibleFields.map((field) => {
                    const canHide = canHideField(field.key)

                    return (
                      <DraggableFieldItem
                        key={field.key}
                        isVisible
                        canHide={canHide}
                        field={field}
                        onToggleVisibility={onToggleVisibility}
                      />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* 隐藏字段 */}
        {hiddenFields.length > 0 && (
          <div className="space-y-2 text-muted-foreground">
            <Separator />
            <div className="pt-1 text-sm font-medium">隐藏列</div>
            <div className="space-y-2">
              {hiddenFields
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((field) => (
                  <FieldItem
                    key={field.key}
                    canHide
                    field={field}
                    isVisible={false}
                    onToggleVisibility={onToggleVisibility}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
