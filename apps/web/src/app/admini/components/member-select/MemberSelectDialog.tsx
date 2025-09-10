'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useEvent } from 'react-use-event-hook'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { SidebarProvider } from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'
import { QueryProvider } from '~/providers/QueryProvider'

import { MemberList, type MemberListProps } from './MemberList'
import { MemberSelectedList } from './MemberSelectedList'

import type { UserListItemDto } from '~api/types.gen'

/**
 * 成员选择对话框属性
 */
export interface MemberSelectDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void

  /** 选择模式：单选/多选（默认多选） */
  mode?: 'single' | 'multiple'

  /** 受控值：选中的用户（完整对象） */
  value?: UserListItemDto[]
  /** 非受控初始值 */
  defaultValue?: UserListItemDto[]
  /** 选择变化回调（返回完整对象列表） */
  onChange?: (selected: UserListItemDto[]) => void
  /** 确认回调（返回完整对象列表） */
  onConfirm?: (selected: UserListItemDto[]) => void

  /** 最大可选数量（默认不限制；单选模式内部视为 1） */
  maxSelect?: number
  /** 禁用的用户 ID 列表 */
  disabledIds?: string[]

  /** 搜索占位文案 */
  searchPlaceholder?: string
  /** 搜索去抖毫秒（默认 300） */
  debounceMs?: number

  /** 文案/外观 */
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  className?: string
}

/**
 * 用于内部维护选择顺序与查找的结构
 */
interface SelectedState {
  /** id -> UserData */
  map: Map<string, UserListItemDto>
  /** 右侧排序用的 id 列表 */
  order: string[]
}

function createSelectedState(initial: UserListItemDto[] | undefined): SelectedState {
  const map = new Map<string, UserListItemDto>()
  const order: string[] = []

  if (initial) {
    for (const u of initial) {
      map.set(u.id, u)
      order.push(u.id)
    }
  }

  return { map, order }
}

/**
 * 成员选择对话框
 */
export function MemberSelectDialog(props: MemberSelectDialogProps) {
  const {
    open,
    onOpenChange,
    mode = 'multiple',
    value,
    defaultValue,
    onChange,
    onConfirm,
    maxSelect,
    disabledIds = [],
    debounceMs = 300,
    title = '选择成员',
    description,
    confirmText = '确认',
    cancelText = '取消',
    className,
  } = props

  const isSingle = mode === 'single'
  const maxAllowed = isSingle ? 1 : maxSelect ?? Number.POSITIVE_INFINITY

  // 受控/非受控合并
  const initialSelected = useMemo(() => value ?? defaultValue ?? [], [value, defaultValue])
  const [internalSelected, setInternalSelected] = useState<SelectedState>(
    () => createSelectedState(initialSelected),
  )

  // 当受控 value 变化时同步内部
  useEffect(() => {
    if (value) {
      setInternalSelected(createSelectedState(value))
    }
  }, [value])

  const selectedCount = internalSelected.order.length

  const emitChange = useEvent((next: SelectedState) => {
    const nextList = next.order.map((id) => next.map.get(id)!).filter(Boolean)
    onChange?.(nextList)
  })

  // 选择逻辑（双保险，尽管 MemberList 已经做了限制）
  const disabledIdSet = useMemo(() => new Set(disabledIds), [disabledIds])

  const handleToggle = useEvent<NonNullable<MemberListProps['onToggle']>>((user) => {
    if (disabledIdSet.has(user.id)) {
      return
    }

    const next: SelectedState = {
      map: new Map(internalSelected.map),
      order: [...internalSelected.order],
    }

    if (isSingle) {
      next.map.clear()
      next.order = []
      next.map.set(user.id, user)
      next.order.push(user.id)
    }
    else {
      if (next.map.has(user.id)) {
        next.map.delete(user.id)
        next.order = next.order.filter((x) => x !== user.id)
      }
      else {
        if (next.order.length >= maxAllowed) {
          return
        }

        next.map.set(user.id, user)
        next.order.push(user.id)
      }
    }

    setInternalSelected(next)
    emitChange(next)
  })

  const handleRemove = useEvent((id: string) => {
    const next: SelectedState = {
      map: new Map(internalSelected.map),
      order: internalSelected.order.filter((x) => x !== id),
    }
    next.map.delete(id)
    setInternalSelected(next)
    emitChange(next)
  })

  const handleClearAll = useEvent(() => {
    const next: SelectedState = { map: new Map(), order: [] }
    setInternalSelected(next)
    emitChange(next)
  })

  const handleConfirm = useEvent(() => {
    if (selectedCount <= 0) {
      return
    }

    const list = internalSelected.order.map((id) => internalSelected.map.get(id)!).filter(Boolean)
    onConfirm?.(list)
  })

  const handleCancel = useEvent(() => {
    onOpenChange?.(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-3xl h-[550px] pb-0 overflow-hidden flex flex-col',
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0">
          <div className="w-2/3 h-full">
            <MemberList
              debounceMs={debounceMs}
              disabledIds={disabledIds}
              maxSelect={isSingle ? 1 : (Number.isFinite(maxAllowed) ? maxAllowed : undefined)}
              mode={mode}
              pageSize={20}
              selectedIds={internalSelected.order}
              onToggle={handleToggle}
            />
          </div>

          <div className="w-1/3 flex flex-col gap-4 h-full">
            <div className="flex-1 min-h-0">
              <MemberSelectedList
                selected={
                  internalSelected.order
                    .map((id) => internalSelected.map.get(id)!)
                    .filter(Boolean)
                }
                single={isSingle}
                onClearAll={handleClearAll}
                onRemove={handleRemove}
                onReorder={(nextOrder) => {
                  const next = { map: new Map(internalSelected.map), order: nextOrder }
                  setInternalSelected(next)
                  emitChange(next)
                }}
              />
            </div>

            <div className="flex justify-end gap-2 mt-auto pb-4">
              <Button variant="outline" onClick={() => { handleCancel() }}>
                {cancelText}
              </Button>

              <Button
                disabled={selectedCount === 0}
                onClick={() => { handleConfirm() }}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 指令式打开对话框的选项
 * - 去除了 open/onOpenChange/onConfirm，这些由 Host 内部接管
 */
export type OpenMemberSelectDialogOptions = Omit<
  MemberSelectDialogProps,
  'open' | 'onOpenChange' | 'onConfirm'
>

/**
 * 指令式打开成员选择对话框
 * - 返回 Promise：确认返回选中用户数组，关闭/取消返回 null
 * - 仅在浏览器端调用（'use client'）
 */
export function openMemberSelectDialog(
  options: OpenMemberSelectDialogOptions,
): Promise<UserListItemDto[] | null> {
  return new Promise<UserListItemDto[] | null>((resolve) => {
    const container = document.createElement('div')
    container.setAttribute('data-member-select-dialog', 'true')
    document.body.appendChild(container)

    const root = createRoot(container)

    function cleanup(): void {
      try {
        root.unmount()
      }
      catch {
        // ignore
      }

      const parent = container.parentNode

      if (parent) {
        parent.removeChild(container)
      }
    }

    function MemberSelectDialogHost() {
      const [isOpen, setIsOpen] = useState(true)
      const settledRef = useRef(false)

      const handleOpenChange = useEvent((nextOpen: boolean): void => {
        setIsOpen(nextOpen)

        if (!nextOpen) {
          if (!settledRef.current) {
            settledRef.current = true
            resolve(null)
          }

          cleanup()
        }
      })

      const handleConfirm = useEvent((list: UserListItemDto[]): void => {
        if (!settledRef.current) {
          settledRef.current = true
          resolve(list)
        }

        setIsOpen(false)
      })

      return (
        <MemberSelectDialog
          {...options}
          open={isOpen}
          onConfirm={handleConfirm}
          onOpenChange={handleOpenChange}
        />
      )
    }

    root.render(
      <QueryProvider>
        <SidebarProvider>
          <MemberSelectDialogHost />
        </SidebarProvider>
      </QueryProvider>,
    )
  })
}
