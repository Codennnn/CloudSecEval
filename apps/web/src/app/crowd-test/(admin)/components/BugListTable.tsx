'use client'

import { useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { EllipsisVerticalIcon, PencilLineIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ProTable, type ProTableProps, type ProTableRef, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
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

import { getReportStatus, getVulSeverity, NEW_BUG_ID } from '../constants'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'
import { bugReportsControllerDeleteMutation, bugReportsControllerFindManyOptions, bugReportsControllerFindManyQueryKey } from '~api/@tanstack/react-query.gen'
import { type BugReportSummaryDto } from '~api/types.gen'

export const enum BugReportRoleView {
  ADMIN,
  USER,
}

interface BugListTableProps<Row extends BugReportSummaryDto>
  extends Pick<ProTableProps<Row>, 'className' | 'toolbar' | 'queryKeyFn' | 'queryOptionsFn' | 'columnVisibilityStorageKey'>
{
  roleView?: BugReportRoleView
  /** 行级回调：编辑 */
  onEdit?: (item: Row) => void
  /** 行级回调：删除 */
  onDelete?: (item: Row) => void | Promise<void>
}

export function BugListTable<Row extends BugReportSummaryDto>(
  props: BugListTableProps<Row>,
) {
  const {
    roleView = BugReportRoleView.USER,
    onEdit,
    onDelete,
    ...restProTableProps
  } = props

  const router = useRouter()

  const tableRef = useRef<ProTableRef<Row> | null>(null)

  const [bugToDelete, setBugToDelete] = useState<Row | null>(null)

  const deleteBugMutation = useMutation({
    ...bugReportsControllerDeleteMutation(),
    onSuccess: () => {
      toast.success('漏洞报告已成功删除')
    },
  })

  const handleCreate = useEvent(() => {
    router.push(
      getRoutePath(AdminRoutes.CrowdTestBugsDetail, { bugReportId: NEW_BUG_ID }),
    )
  })

  const handleEdit = useEvent((item: Row) => {
    onEdit?.(item)
    router.push(
      getRoutePath(AdminRoutes.CrowdTestBugsDetail, { bugReportId: item.id }),
    )
  })

  const handleDeleteClick = useEvent((item: Row) => {
    setBugToDelete(item)
  })

  const handleDeleteConfirm = useEvent(async () => {
    if (bugToDelete) {
      void onDelete?.(bugToDelete)

      await deleteBugMutation.mutateAsync({
        path: { id: bugToDelete.id },
      })

      void tableRef.current?.refresh()
      setBugToDelete(null)
    }
  })

  const columns = useMemo<TableColumnDef<Row>[]>(() => {
    const list: TableColumnDef<Row>[] = [
      { accessorKey: 'title', header: '标题', enableSorting: false },
      {
        accessorKey: 'severity',
        header: '严重级别',
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <Badge variant="outline">
              {getVulSeverity(row.original.severity).label}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'status',
        header: '状态',
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.status

          return (
            <Badge>
              {getReportStatus(status).label}
            </Badge>
          )
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
                      () => { handleDeleteClick(item) }
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
  }, [handleDeleteClick, handleEdit, roleView, router])

  return (
    <>
      <ProTable<Row>
        {...restProTableProps}
        columns={columns}
        paginationConfig={{
          pageSizeOptions: [10, 20, 30, 40, 50],
          showPageSizeSelector: true,
          showSelection: false,
        }}
        queryKeyFn={bugReportsControllerFindManyQueryKey as QueryKeyFn}
        queryOptionsFn={bugReportsControllerFindManyOptions as QueryOptionsFn<Row>}
        tableRef={tableRef}
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

      {/* MARK: 删除确认对话框 */}
      <DeleteConfirmDialog
        confirmText="DELETE"
        deleteButtonText="确认删除"
        description={
          bugToDelete
            ? (
                <div>
                  你即将删除：
                  <ul className="list-disc list-inside space-y-1.5 py-2">
                    <li>
                      标题：
                      <span className="text-muted-foreground">
                        {bugToDelete.title}
                      </span>
                    </li>
                    <li>
                      状态：
                      <span className="text-muted-foreground">
                        {getReportStatus(bugToDelete.status).label}
                      </span>
                    </li>
                  </ul>
                </div>
              )
            : null
        }
        isDeleting={deleteBugMutation.isPending}
        open={!!bugToDelete}
        title="删除漏洞报告"
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setBugToDelete(null)
          }
        }}
      />
    </>
  )
}
