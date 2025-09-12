'use client'

import { type ReactElement, useMemo } from 'react'

import { EllipsisVerticalIcon } from 'lucide-react'

import { ProTable, type ProTableRef, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { createDateColumn } from '~/components/table/table.util'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

import { STATUS_TO_LABEL, STATUS_TO_VARIANT, type BugStatus, type BugSeverity } from '../bugs/types'

// ============================================================================
// MARK: 类型
// ============================================================================

/** 基础的漏洞行数据结构（两处列表共有字段） */
export interface BugLikeRow {
  id: string
  title: string
  status: BugStatus
  createdAt: string
  severity: BugSeverity
}

interface BugListTableProps<Row extends BugLikeRow> {
  /** 本地列可见性存储键 */
  storageKey: string
  /** 查询键函数（透传给 ProTable） */
  queryKeyFn: QueryKeyFn
  /** 查询选项函数（透传给 ProTable） */
  queryOptionsFn: QueryOptionsFn<Row>
  /** 外部表格引用，用于刷新等 */
  tableRef?: React.RefObject<ProTableRef<Row> | null>
  /** 搜索输入框占位文案 */
  searchPlaceholder?: string
  /** 是否显示操作列（有回调时自动显示） */
  showActions?: boolean
  /** 行级回调：编辑 */
  onEdit?: (item: Row) => void
  /** 行级回调：提交 */
  onSubmit?: (item: Row) => void
  /** 行级回调：删除 */
  onDelete?: (item: Row) => void | Promise<void>
  /** 额外的容器类名 */
  className?: string
}

// ============================================================================
// MARK: 组件
// ============================================================================

/**
 * 统一漏洞列表表格（字段：标题/严重级别/状态/创建时间，可选操作列）
 */
export function BugListTable<Row extends BugLikeRow>(props: BugListTableProps<Row>): ReactElement {
  const {
    storageKey,
    queryKeyFn,
    queryOptionsFn,
    tableRef,
    searchPlaceholder = '搜索标题',
    showActions,
    onEdit,
    onSubmit,
    onDelete,
    className,
  } = props

  const computedShowActions = Boolean(showActions || onEdit || onSubmit || onDelete)

  const columns = useMemo<TableColumnDef<Row>[]>(() => {
    const list: TableColumnDef<Row>[] = [
      { accessorKey: 'title', header: '标题', enableSorting: false },
      {
        accessorKey: 'severity',
        header: '严重级别',
        enableSorting: false,
        cell: ({ row }) => {
          const sev = (row.original as Row).severity
          const label: Record<BugSeverity, string> = {
            low: '低',
            medium: '中',
            high: '高',
            critical: '严重',
          }

          return <Badge variant="outline">{label[sev]}</Badge>
        },
      },
      {
        accessorKey: 'status',
        header: '状态',
        enableSorting: false,
        cell: ({ row }) => {
          const status = (row.original as Row).status as BugStatus
          const classes = STATUS_TO_VARIANT[status]
          const text = STATUS_TO_LABEL[status]

          return <Badge className={`border ${classes}`}>{text}</Badge>
        },
      },
      createDateColumn<Row>({ accessorKey: 'createdAt', header: '创建时间', enableSorting: false }),
    ]

    if (computedShowActions) {
      list.push({
        id: 'actions',
        header: '操作',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original as Row

          return (
            <div className="flex items-center gap-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="data-[state=open]:bg-muted text-muted-foreground"
                    size="iconNormal"
                    variant="ghost"
                  >
                    <EllipsisVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-32">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => { onEdit(item) }}>
                      编辑
                    </DropdownMenuItem>
                  )}

                  {onSubmit && (
                    <DropdownMenuItem onClick={() => { onSubmit(item) }}>
                      提交
                    </DropdownMenuItem>
                  )}

                  {(onEdit || onSubmit) && (onDelete) && <DropdownMenuSeparator />}

                  {onDelete && (
                    <DropdownMenuItem variant="destructive" onClick={() => { void onDelete(item) }}>
                      删除
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      })
    }

    return list
  }, [computedShowActions, onDelete, onEdit, onSubmit])

  return (
    <ProTable<Row>
      className={className}
      columnVisibilityStorageKey={storageKey}
      columns={columns}
      paginationConfig={{ pageSizeOptions: [10, 20, 30, 40, 50], showPageSizeSelector: true, showSelection: false }}
      queryKeyFn={queryKeyFn}
      queryOptionsFn={queryOptionsFn}
      rowSelection={{ enabled: false }}
      tableRef={tableRef as unknown as React.RefObject<ProTableRef<Row> | null>}
      toolbar={{ search: { inputProps: { placeholder: searchPlaceholder } } }}
    />
  )
}

export default BugListTable


