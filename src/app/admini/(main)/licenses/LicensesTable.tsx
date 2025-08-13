'use client'

import { useMemo, useState } from 'react'

import { type QueryKey, useQueryClient } from '@tanstack/react-query'
import {
  EllipsisVerticalIcon,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

import { CopyButton } from '~/components/CopyButton'
import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { FieldTypeEnum } from '~/constants/form'
import type { LicenseData } from '~/lib/api/types'
import { formatDate } from '~/utils/date'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { useDeleteLicense } from '~admin/hooks/api/useLicense'
import { useLicenseDialog } from '~admin/stores/useLicenseDialogStore'
import { licenseControllerGetLicenseListOptions, licenseControllerGetLicenseListQueryKey } from '~api/@tanstack/react-query.gen'

export function LicensesTable() {
  const queryClient = useQueryClient()

  const [queryKey, setQueryKey] = useState<QueryKey>()

  const [licenseToDelete, setLicenseToDelete] = useState<LicenseData | null>(null)

  const { openCreateDialog, openEditDialog } = useLicenseDialog()

  const deleteLicenseMutation = useDeleteLicense({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey,
      })
    },
  })

  const handleDeleteClick = (license: LicenseData) => {
    setLicenseToDelete(license)
  }

  const handleDeleteConfirm = async () => {
    if (licenseToDelete) {
      await deleteLicenseMutation.mutateAsync({
        path: {
          id: licenseToDelete.id,
        },
      })
      toast.success(`授权码 ${licenseToDelete.code} 已成功删除`)
      setLicenseToDelete(null)
    }
  }

  // MARK: 表格列定义
  const columns = useMemo<TableColumnDef<LicenseData>[]>(() => {
    return [
      {
        accessorKey: 'email',
        header: '邮箱',
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.email}
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: 'code',
        header: '授权码',
        cell: ({ row }) => (
          <div className="inline-flex items-center gap-1 group/code">
            <div className="font-mono text-sm">
              {row.original.code}
            </div>

            <div className="group-hover/code:opacity-100 opacity-0">
              <CopyButton text={row.original.code} />
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'remark',
        header: '备注',
        cell: ({ row }) => (
          <div className="max-w-xs truncate">
            {row.original.remark ?? (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'expiresAt',
        header: '过期时间',
        type: FieldTypeEnum.DATE,
        cell: ({ row }) => (
          <div className="text-sm">
            {formatDate(row.original.expiresAt)}
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: '创建时间',
        type: FieldTypeEnum.DATE,
        cell: ({ row }) => (
          <div className="text-sm">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
                variant="ghost"
              >
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => {
                  // TODO: 实现查看详情功能
                  // 暂时使用 row.original.id 来避免 ESLint 警告
                  void row.original.id
                }}
              >
                查看详情
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  const licenseForEdit = {
                    ...row.original,
                    email: row.original.email,
                    remark: row.original.remark,
                  }
                  openEditDialog(licenseForEdit)
                }}
              >
                编辑
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  handleDeleteClick(row.original)
                }}
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ]
  }, [openEditDialog])

  return (
    <div className="px-admin-content-md lg:px-admin-content py-admin-content-md md:py-admin-content">
      <ProTable<LicenseData>
        columns={columns}
        queryKeyFn={licenseControllerGetLicenseListQueryKey as QueryKeyFn}
        queryOptionsFn={licenseControllerGetLicenseListOptions as QueryOptionsFn<LicenseData>}
        toolbar={{
          rightContent: (
            <Button
              size="sm"
              onClick={() => {
                openCreateDialog()
              }}
            >
              <Plus />
              新增授权码
            </Button>
          ),
        }}
        onQueryKeyChange={setQueryKey}
      />

      {/* MARK: 删除确认对话框 */}
      <DeleteConfirmDialog
        confirmText="DELETE"
        deleteButtonText="确认删除"
        description={
          licenseToDelete
            ? (
                <div>
                  你即将删除：
                  <ul className="list-disc list-inside space-y-1.5 py-2">
                    <li>
                      授权码：
                      <code>
                        {licenseToDelete.code}
                      </code>
                    </li>
                    <li>
                      邮箱：
                      <span className="text-muted-foreground">
                        {licenseToDelete.email}
                      </span>
                    </li>
                  </ul>
                </div>
              )
            : null
        }
        isDeleting={deleteLicenseMutation.isPending}
        open={!!licenseToDelete}
        title="删除授权码"
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setLicenseToDelete(null)
          }
        }}
      />
    </div>
  )
}
