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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon, XIcon } from 'lucide-react'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Button } from '~/components/ui/button'
import { UserAvatar } from '~/components/UserAvatar'
import { cn } from '~/lib/utils'

import type { UserListItemDto } from '~api/types.gen'

export interface MemberSelectedListProps {
  /** 已选中的完整对象列表（顺序即为展示顺序） */
  selected: UserListItemDto[]
  /** 是否为单选（单选时不启用拖拽） */
  single?: boolean
  /** 清空全部 */
  onClearAll: () => void
  /** 移除单个 */
  onRemove: (id: string) => void
  /** 当拖拽排序结束时上报新顺序（仅多选） */
  onReorder?: (next: string[]) => void
}

interface SortableItemProps {
  user: UserListItemDto
  disabled?: boolean
  onRemove: (id: string) => void
}

function SortableItem(props: SortableItemProps) {
  const { user, disabled, onRemove } = props

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: user.id })

  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      aria-disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-md py-1 px-0.5',
        isDragging ? 'bg-muted relative z-10 shadow' : 'bg-background',
        disabled && 'opacity-50 pointer-events-none',
      )}
      style={style}
    >
      <Button
        className="text-muted-foreground cursor-grab"
        size="iconSm"
        variant="ghost"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-3.5" />
      </Button>

      <UserAvatar avatarUrl={user.avatarUrl} name={user.name} />

      <div className="flex flex-col text-sm flex-1 min-w-0">
        <span className="font-medium truncate">{user.name ?? '-'}</span>
        <span className="text-muted-foreground text-xs truncate">{user.department?.name ?? '-'}</span>
      </div>

      <Button
        className="text-muted-foreground"
        size="iconSm"
        variant="ghost"
        onClick={() => { onRemove(user.id) }}
      >
        <XIcon className="size-3.5" />
      </Button>
    </div>
  )
}

export function MemberSelectedList(props: MemberSelectedListProps) {
  const { selected, single = false, onClearAll, onRemove, onReorder } = props

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    if (single || !onReorder) {
      return
    }

    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const ids = selected.map((s) => s.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    onReorder(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          已选择
          <span className="font-medium tabular-nums">{selected.length}</span>
          人
        </div>

        <Button
          disabled={selected.length === 0}
          size="sm"
          variant="ghost"
          onClick={() => { onClearAll() }}
        >
          清空全部
        </Button>
      </div>

      <ScrollGradientContainer>
        <div className="flex flex-col gap-2">
          {single
            ? (
                selected.map((u) => (
                  <SortableItem
                    key={u.id}
                    disabled
                    user={u}
                    onRemove={onRemove}
                  />
                ))
              )
            : (
                <DndContext
                  collisionDetection={closestCenter}
                  sensors={sensors}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selected.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {selected.map((u) => (
                      <SortableItem key={u.id} user={u} onRemove={onRemove} />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
        </div>
      </ScrollGradientContainer>
    </div>
  )
}
