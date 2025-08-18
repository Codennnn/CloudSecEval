'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'
import type { RowSelectionState } from '@tanstack/react-table'
import {
  EllipsisVerticalIcon,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

import { CopyButton } from '~/components/CopyButton'
import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { emitter, EVENT_KEY } from '~/constants/common'
import { FieldTypeEnum } from '~/constants/form'
import type { LicenseData } from '~/lib/api/types'
import { formatDate } from '~/utils/date'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { LicenseDetailDrawer } from '~admin/components/LicenseDetailDrawer'
import { useDeleteLicense } from '~admin/hooks/api/useLicense'
import { useLicenseDialog } from '~admin/stores/useLicenseDialogStore'
import { licenseControllerAdminCheckLicenseMutation, licenseControllerGetLicenseListOptions, licenseControllerGetLicenseListQueryKey } from '~api/@tanstack/react-query.gen'

export function LicensesTable() {
  const queryClient = useQueryClient()

  const [queryKey, setQueryKey] = useState<QueryKey>()
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({})

  const [licenseToDelete, setLicenseToDelete] = useState<LicenseData | null>(null)
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null)

  const { openCreateDialog, openEditDialog } = useLicenseDialog()

  const handleRefreshTable = useEvent(() => {
    void queryClient.invalidateQueries({
      queryKey,
    })
  })

  useEffect(() => {
    emitter.on(EVENT_KEY.REFRESH_TABLE, handleRefreshTable)

    return () => {
      emitter.off(EVENT_KEY.REFRESH_TABLE, handleRefreshTable)
    }
  }, [handleRefreshTable])

  const deleteLicenseMutation = useDeleteLicense({
    onSuccess: () => {
      handleRefreshTable()
    },
  })

  const checkLicenseValidityMutation = useMutation(licenseControllerAdminCheckLicenseMutation())

  const handleDeleteClick = (license: LicenseData) => {
    setLicenseToDelete(license)
  }

  const handleViewDetail = (licenseId: string) => {
    setSelectedLicenseId(licenseId)
  }

  // 处理行选择变化
  const handleRowSelectionChange = useEvent((selection: RowSelectionState) => {
    setSelectedRows(selection)
    console.log('选中的授权码:', selection)

    // 获取选中行的数量
    const selectedCount = Object.keys(selection).filter((key) => selection[key]).length

    if (selectedCount > 0) {
      console.log(`已选择 ${selectedCount} 个授权码`)
    }
  })

  // 处理检测授权码有效性
  const handleCheckValidity = useEvent(async (license: LicenseData) => {
    try {
      const { data } = await checkLicenseValidityMutation.mutateAsync({
        body: {
          id: license.id,
          email: license.email,
          code: license.code,
        },
      })

      const valid = data.valid
      const message = data.message
      const details = data.details

      if (valid) {
        toast.success(`授权码 ${license.code} 检测完成：${message}`, {
          description: details.expiresAt ? `过期时间：${details.expiresAt}` : undefined,
        })
      }
      else {
        let description = message

        const status: string[] = []

        if (details.expired) {
          status.push('已过期')
        }

        if (details.locked) {
          status.push('已锁定')
        }

        if (details.isUsed) {
          status.push('已使用')
        }

        if (status.length > 0) {
          description = `${message} (${status.join('、')})`
        }

        toast.error(`授权码 ${license.code} 检测完成：${description}`)
      }
    }
    catch (error) {
      toast.error(`检测授权码 ${license.code} 时发生错误`)
      console.error('License validity check error:', error)
    }
  })

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
          <div className="inline-flex items-center gap-1 group/email">
            <div className="text-sm">
              {row.original.email}
            </div>

            <div className="group-hover/email:opacity-100 opacity-0">
              <CopyButton text={row.original.email} />
            </div>
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: 'code',
        header: '授权码',
        cell: ({ row }) => (
          <div className="font-mono text-sm">
            {row.original.code}
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
        accessorKey: 'updatedAt',
        header: '更新时间',
        type: FieldTypeEnum.DATE,
        hiddenInTable: true,
      },
      {
        accessorKey: 'isUsed',
        header: '是否已使用',
        type: FieldTypeEnum.BOOLEAN,
        hiddenInTable: true,
        cell: ({ row }) => (
          <div className="text-sm">
            <Badge
              variant={row.original.isUsed ? 'secondary' : 'default'}
            >
              {row.original.isUsed ? '已使用' : '未使用'}
            </Badge>
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
                  handleViewDetail(row.original.id)
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

              <DropdownMenuItem
                disabled={checkLicenseValidityMutation.isPending}
                onClick={() => {
                  void handleCheckValidity(row.original)
                }}
              >
                {checkLicenseValidityMutation.isPending ? '检测中...' : '检测有效性'}
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
  }, [openEditDialog, checkLicenseValidityMutation.isPending, handleCheckValidity])

  // 获取选中的授权码数量
  const selectedCount = Object.keys(selectedRows).filter((key) => selectedRows[key]).length

  return (
    <div className="px-admin-content-md lg:px-admin-content py-admin-content-md md:py-admin-content">
      {/* 选中信息显示 */}
      {selectedCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              已选择
              {' '}
              <span className="font-medium">{selectedCount}</span>
              {' '}
              个授权码
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setSelectedRows({}) }}
              >
                清除选择
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  // 这里可以添加批量删除逻辑
                  toast.info('批量删除功能待实现')
                }}
              >
                批量删除
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProTable<LicenseData>
        columns={columns}
        headerTitle="授权码列表"
        paginationConfig={{
          showSelection: true,
          showPageSizeSelector: true,
        }}
        queryKeyFn={licenseControllerGetLicenseListQueryKey as QueryKeyFn}
        queryOptionsFn={licenseControllerGetLicenseListOptions as QueryOptionsFn<LicenseData>}
        rowSelection={{
          enabled: true,
          initialSelection: {},
          onSelectionChange: handleRowSelectionChange,
          getRowId: (row) => row.id,
        }}
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

      {/* MARK: 授权码详情抽屉 */}
      <LicenseDetailDrawer
        licenseId={selectedLicenseId}
        open={!!selectedLicenseId}
        onOpenChange={() => {
          setSelectedLicenseId(null)
        }}
      />
    </div>
  )
}
