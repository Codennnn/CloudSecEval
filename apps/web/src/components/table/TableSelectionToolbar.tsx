'use client'

import { useEvent } from 'react-use-event-hook'

import type { Table } from '@tanstack/react-table'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export interface SelectionToolbarContext<TData> {
  /** 选中数量 */
  selectedCount: number
  /** 选中行的内部 id 列表 */
  selectedRowIds: string[]
  /** 选中行的数据实体 */
  selectedRows: TData[]
  /** 清空选择 */
  clearSelection: () => void
  /** TanStack Table 实例（进阶使用） */
  table: Table<TData>
}

export interface TableSelectionToolbarProps<TData> {
  /** 是否启用（默认 true） */
  enabled?: boolean
  /** 固定位置（默认 bottom） */
  position?: 'top' | 'bottom'
  /** 自定义容器样式类 */
  className?: string
  /** 自定义渲染函数 */
  render?: (ctx: SelectionToolbarContext<TData>) => React.ReactNode
  /** TanStack Table 实例 */
  table: Table<TData>
}

export function TableSelectionToolbar<TData>(props: TableSelectionToolbarProps<TData>) {
  const {
    enabled = true,
    position = 'bottom',
    className,
    render,
    table,
  } = props

  const selectedRowModel = table.getSelectedRowModel()
  const selectedCount = selectedRowModel.rows.length
  const selectedRowIds = selectedRowModel.rows.map((r) => r.id)
  const selectedRows = selectedRowModel.rows.map((r) => r.original)

  const handleClearSelection = useEvent(() => {
    table.resetRowSelection()
  })

  if (!enabled) {
    return null
  }

  if (selectedCount <= 0) {
    return null
  }

  const content = render
    ? render({
        selectedCount,
        selectedRowIds,
        selectedRows,
        clearSelection: handleClearSelection,
        table,
      })
    : (
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <span>已选择</span>
            <span className="font-medium tabular-nums">{selectedCount}</span>
            <span>项</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => { handleClearSelection() }}
          >
            清除选择
          </Button>
        </div>
      )

  return (
    <div
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-50',
        position === 'bottom' ? 'bottom-4' : 'top-4',
      )}
    >
      <div className={cn('bg-background border shadow-lg rounded-lg px-4 py-2', className)}>
        {content}
      </div>
    </div>
  )
}
