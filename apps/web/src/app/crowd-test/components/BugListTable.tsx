'use client'

import { useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { EllipsisVerticalIcon, ExternalLinkIcon, PencilLineIcon } from 'lucide-react'
import { toast } from 'sonner'

import { MemberInfo } from '~/components/MemberInfo'
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
import { FieldTypeEnum } from '~/constants/form'
import { cn } from '~/lib/utils'
import { downloadBlob, sanitizeFileName } from '~/utils/file'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'
import { bugReportsControllerDeleteMutation, bugReportsControllerFindManyOptions, bugReportsControllerFindManyQueryKey, bugReportsControllerFindMyReportsOptions, bugReportsControllerFindMyReportsQueryKey } from '~api/@tanstack/react-query.gen'
import { bugReportsControllerExportBugReport } from '~api/sdk.gen'
import { type BugReportSummaryDto } from '~api/types.gen'
import { BugReportRoleView, getReportStatus, getVulSeverity, NEW_BUG_ID, reportStatusConfig, vulSeverityConfig } from '~crowd-test/constants'

interface BugListTableProps<Row extends BugReportSummaryDto>
  extends Pick<ProTableProps<Row>, 'className' | 'toolbar' | 'queryKeyFn' | 'queryOptionsFn' | 'columnVisibilityStorageKey'>
{
  roleView?: BugReportRoleView
}

export function BugListTable<Row extends BugReportSummaryDto>(
  props: BugListTableProps<Row>,
) {
  const {
    roleView = BugReportRoleView.USER,
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

  const exportBugMutation = useMutation({
    mutationFn: async (item: Row) => {
      const response = await bugReportsControllerExportBugReport({
        path: { id: item.id },
        query: {
          includeHistory: true,
          includeAttachmentContent: false,
        },
      })

      return { response, item }
    },
    onSuccess: ({ response, item }) => {
      const filename = sanitizeFileName(item.title || `bug-report-${item.id}`)

      downloadBlob(response.data, `${filename}-${Date.now()}.json`, {
        type: 'application/json',
        stringify: true,
        formatting: 2,
      })

      toast.success('漏洞报告导出成功')
    },
    onError: () => {
      toast.error('导出失败，请稍后重试')
    },
  })

  const handleEdit = useEvent((item: Row) => {
    router.push(
      getRoutePath(AdminRoutes.CrowdTestBugsDetail, { bugReportId: item.id }),
    )
  })

  const handleDeleteClick = useEvent((item: Row) => {
    setBugToDelete(item)
  })

  const handleExportClick = useEvent((item: Row) => {
    if (!exportBugMutation.isPending) {
      exportBugMutation.mutate(item)
    }
  })

  const handleDeleteConfirm = useEvent(async () => {
    if (bugToDelete) {
      await deleteBugMutation.mutateAsync({
        path: { id: bugToDelete.id },
      })

      void tableRef.current?.refresh()
      setBugToDelete(null)
    }
  })

  const columns = useMemo<TableColumnDef<Row>[]>(() => {
    return [
      ...(!isUser
        ? [
            {
              id: 'user',
              accessorKey: 'user',
              header: '提交人',
              enableSorting: false,
              enableHiding: false,
              cell: ({ row }) => {
                return (
                  <MemberInfo
                    avatarUrl={row.original.user?.avatarUrl}
                    email={row.original.user?.email}
                    name={row.original.user?.name}
                  />
                )
              },
            },
          ] as TableColumnDef<Row>[]
        : []),
      {
        accessorKey: 'title',
        header: '标题',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <Link
              className="hover:underline underline-offset-2"
              href={
                getRoutePath(AdminRoutes.CrowdTestBugsDetail, { bugReportId: row.original.id })
              }
            >
              {row.original.title}
            </Link>
          )
        },
      },
      {
        accessorKey: 'severity',
        header: '漏洞等级',
        enableSorting: false,
        type: FieldTypeEnum.ENUM,
        enumOptions: Object.values(vulSeverityConfig),
        cell: ({ row }) => {
          const severity = row.original.severity
          const severityConfig = getVulSeverity(severity)

          return (
            <Badge
              className={cn(
                severityConfig.frontColor,
                severityConfig.bgColor,
                severityConfig.borderColor,
              )}
              variant="outline"
            >
              {severityConfig.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'status',
        header: '状态',
        enableSorting: false,
        type: FieldTypeEnum.ENUM,
        enumOptions: Object.values(reportStatusConfig),
        cell: ({ row }) => {
          const status = row.original.status
          const statusConfig = getReportStatus(status)

          return (
            <Badge className={statusConfig.frontColor} variant="outline">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          )
        },
      },
      createDateColumn<Row>({ accessorKey: 'createdAt', header: '创建时间' }),
      {
        id: 'actions',
        header: '操作',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original
          const detailRoute = isAdmin
            ? AdminRoutes.CrowdTestBugsReview
            : AdminRoutes.CrowdTestBugsDetail

          return (
            <div className="flex items-center gap-0.5">
              {!isUser && (
                <Link
                  href={getRoutePath(detailRoute, { bugReportId: item.id })}
                  target="_blank"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                  >
                    <ExternalLinkIcon />
                    详情
                  </Button>
                </Link>
              )}

              {isUser && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    handleEdit(item)
                  }}
                >
                  <PencilLineIcon />
                  编辑
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
                  {!isUser && (
                    <Link
                      href={getRoutePath(detailRoute, { bugReportId: item.id })}
                    >
                      <DropdownMenuItem>
                        查看详情
                      </DropdownMenuItem>
                    </Link>
                  )}

                  <DropdownMenuItem
                    disabled={exportBugMutation.isPending}
                    onClick={() => { handleExportClick(item) }}
                  >
                    导出报告
                  </DropdownMenuItem>

                  {(isUser || isAdmin) && (
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
  }, [
    handleDeleteClick,
    handleEdit,
    handleExportClick,
    exportBugMutation.isPending,
    isAdmin,
    isUser,
  ])

  return (
    <>
      <ProTable<Row>
        {...restProTableProps}
        columns={columns}
        queryKeyFn={
          isUser
            ? bugReportsControllerFindMyReportsQueryKey as QueryKeyFn
            : bugReportsControllerFindManyQueryKey as QueryKeyFn
        }
        queryOptionsFn={
          isUser
            ? bugReportsControllerFindMyReportsOptions as QueryOptionsFn<Row>
            : bugReportsControllerFindManyOptions as QueryOptionsFn<Row>
        }
        tableRef={tableRef}
        toolbar={{
          rightContent: isUser
            ? (
                <Link
                  href={
                    getRoutePath(
                      AdminRoutes.CrowdTestBugsDetail,
                      { bugReportId: NEW_BUG_ID },
                    )
                  }
                >
                  <Button
                    size="sm"
                  >
                    提交报告
                  </Button>
                </Link>
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
