'use client'

import { type ReactElement, useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useRouter } from 'next/navigation'
import { EllipsisVerticalIcon, PencilLineIcon } from 'lucide-react'

import { ProTable, type ProTableProps } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { createDateColumn } from '~/components/table/table.util'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

import { type BugSeverity, type BugStatus, NEW_BUG_ID, STATUS_TO_LABEL, STATUS_TO_VARIANT } from '../bugs/types'

import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'

export const enum BugReportRoleView {
  ADMIN,
  USER,
}

export interface BugLikeRow {
  id: string
  title: string
  status: BugStatus
  createdAt: string
  severity: BugSeverity
}

interface BugListTableProps<Row extends BugLikeRow>
  extends Pick<ProTableProps<Row>, 'className' | 'toolbar' | 'queryKeyFn' | 'queryOptionsFn' | 'tableRef' | 'columnVisibilityStorageKey'>
{
  roleView?: BugReportRoleView
  /** 行级回调：编辑 */
  onEdit?: (item: Row) => void
  /** 行级回调：删除 */
  onDelete?: (item: Row) => void | Promise<void>
}

export function BugListTable<Row extends BugLikeRow>(props: BugListTableProps<Row>): ReactElement {
  const {
    roleView = BugReportRoleView.USER,
    onEdit,
    onDelete,
    ...restProTableProps
  } = props

  const router = useRouter()

  const handleCreate = useEvent(() => {
    router.push(
      getRoutePath(AdminRoutes.CrowdTestBugsDetail, { bugReportId: NEW_BUG_ID }),
    )
  })

  const handleEdit = useEvent((item: Row) => {
    onEdit?.(item)
  })

  const handleDelete = useEvent((item: Row) => {
    void onDelete?.(item)
  })

  const columns = useMemo<TableColumnDef<Row>[]>(() => {
    const list: TableColumnDef<Row>[] = [
      { accessorKey: 'title', header: '标题', enableSorting: false },
      {
        accessorKey: 'severity',
        header: '严重级别',
        enableSorting: false,
        cell: ({ row }) => {
          const sev = (row.original).severity
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
          const status = (row.original).status
          const classes = STATUS_TO_VARIANT[status]
          const text = STATUS_TO_LABEL[status]

          return <Badge className={`border ${classes}`}>{text}</Badge>
        },
      },
      createDateColumn<Row>({ accessorKey: 'createdAt', header: '创建时间', enableSorting: false }),
    ]

    list.push({
      id: 'actions',
      header: '操作',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original

        return (
          <div className="flex items-center gap-0.5">
            {roleView === BugReportRoleView.ADMIN && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  router.push(
                    getRoutePath(AdminRoutes.CrowdTestBugsDetail, { bugReportId: item.id }),
                  )
                }}
              >
                查看详情
              </Button>
            )}

            {roleView === BugReportRoleView.USER && (
              <Button
                size="iconSm"
                variant="ghost"
                onClick={() => {
                  handleEdit(item)
                }}
              >
                <PencilLineIcon />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="data-[state=open]:bg-muted text-muted-foreground"
                  size="iconSm"
                  variant="ghost"
                >
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-32">
                {roleView === BugReportRoleView.USER && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={
                      () => { handleDelete(item) }
                    }
                  >
                    删除
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    })

    return list
  }, [handleDelete, handleEdit, roleView, router])

  return (
    <ProTable<Row>
      {...restProTableProps}
      columns={columns}
      paginationConfig={{
        pageSizeOptions: [10, 20, 30, 40, 50],
        showPageSizeSelector: true,
        showSelection: false,
      }}
      toolbar={{
        rightContent: roleView === BugReportRoleView.USER
          ? (
              <Button
                size="sm"
                onClick={() => {
                  handleCreate()
                }}
              >
                提交报告
              </Button>
            )
          : null,
      }}
    />
  )
}
