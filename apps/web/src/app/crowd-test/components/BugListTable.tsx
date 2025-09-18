'use client'

import { useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { EllipsisVerticalIcon, PencilLineIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ProTable, type ProTableProps, type ProTableRef, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { createDateColumn, createEnumColumn } from '~/components/table/table.util'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'
import { bugReportsControllerDeleteMutation, bugReportsControllerFindManyOptions, bugReportsControllerFindManyQueryKey, bugReportsControllerFindMyReportsOptions } from '~api/@tanstack/react-query.gen'
import { type BugReportSummaryDto } from '~api/types.gen'
import { BugReportRoleView, getReportStatus, getVulSeverity, NEW_BUG_ID, reportStatusConfig, vulSeverityConfig } from '~crowd-test/constants'

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

  const isAdmin = roleView === BugReportRoleView.ADMIN
  const isUser = roleView === BugReportRoleView.USER

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
    return [
      {
        accessorKey: 'title',
        header: '标题',
        enableSorting: false,
        enableHiding: false,
      },
      createEnumColumn<Row>({
        accessorKey: 'severity',
        header: '漏洞等级',
        enableSorting: false,
        enumOptions: Object.values(vulSeverityConfig),
        getLabelFn: (value) => getVulSeverity(value).label,
      }),
      createEnumColumn<Row>({
        accessorKey: 'status',
        header: '状态',
        enableSorting: false,
        enumOptions: Object.values(reportStatusConfig),
        getLabelFn: (value) => getReportStatus(value).label,
      }),
      createDateColumn<Row>({ accessorKey: 'createdAt', header: '创建时间' }),
      {
        id: 'actions',
        header: '操作',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original

          return (
            <div className="flex items-center gap-0.5">
              {isAdmin && (
                <Link
                  href={
                    getRoutePath(AdminRoutes.CrowdTestBugsReview, { bugReportId: item.id })
                  }
                >
                  <Button
                    size="sm"
                    variant="ghost"
                  >
                    查看详情
                  </Button>
                </Link>
              )}

              {isUser && (
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
                  {isUser && (
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
      },
    ]
  }, [handleDeleteClick, handleEdit, isAdmin, isUser])

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
        queryOptionsFn={
          isUser
            ? bugReportsControllerFindMyReportsOptions as QueryOptionsFn<Row>
            : bugReportsControllerFindManyOptions as QueryOptionsFn<Row>
        }
        tableRef={tableRef}
        toolbar={{
          rightContent: isUser
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
