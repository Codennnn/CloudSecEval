'use client'

import { useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  EllipsisVerticalIcon,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

import { CopyButton } from '~/components/CopyButton'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import type { LicenseData, LicenseFormData } from '~/lib/api/types'
import { formatDate } from '~/utils/date'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { PageHeader } from '~admin/components/PageHeader'
import { TablePagination } from '~admin/components/TablePagination'
import { useDeleteLicense } from '~admin/hooks/api/useLicense'
import { useLicenseDialog } from '~admin/stores/useLicenseDialogStore'
import { licenseControllerGetLicenseListOptions } from '~api/@tanstack/react-query.gen'

// MARK: 表格列定义

/**
 * 创建授权码表格列定义
 */
const createColumns = (
  openEditDialog: (license: LicenseFormData) => void,
  onDeleteClick: (license: LicenseData) => void,
): ColumnDef<LicenseData>[] => [
  {
    accessorKey: 'email',
    header: '邮箱',
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.email}
      </div>
    ),
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
    enableHiding: false,
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
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDate(row.original.expiresAt)}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
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
            <EllipsisVerticalIcon className="h-4 w-4" />
            <span className="sr-only">打开菜单</span>
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
              // 转换为编辑表单需要的格式
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
              onDeleteClick(row.original)
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

/**
 * 授权码管理页面
 */
export function LicensesPage() {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [licenseToDelete, setLicenseToDelete] = useState<LicenseData | null>(null)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const { openCreateDialog, openEditDialog } = useLicenseDialog()

  const deleteLicenseMutation = useDeleteLicense()

  const { data: dataX, isLoading } = useQuery(licenseControllerGetLicenseListOptions({
    query: {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    },
  }))
  const list = dataX?.data
  const tablePagination = dataX?.pagination

  const handleDeleteClick = (license: LicenseData) => {
    setLicenseToDelete(license)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!licenseToDelete) {
      return
    }

    await deleteLicenseMutation.mutateAsync(licenseToDelete.id)
    toast.success(`授权码 ${licenseToDelete.code} 已成功删除`)

    setDeleteConfirmOpen(false)
    setLicenseToDelete(null)
  }

  // ==================== 表格配置 ====================
  const columns = useMemo(() => createColumns(openEditDialog, handleDeleteClick), [openEditDialog])

  const table = useReactTable({
    data: list ?? [],
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // 启用服务端分页
    pageCount: tablePagination?.totalPages ?? 0, // 设置总页数
  })

  const tableRows = table.getRowModel().rows

  return (
    <div className="px-admin-content-md lg:px-admin-content py-admin-content-md md:py-admin-content">
      <div className="space-y-6">
        {/* 页面标题 */}
        <PageHeader
          actions={(
            <Button onClick={() => { openCreateDialog() }}>
              <Plus className="size-4" />
              新增授权码
            </Button>
          )}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading
                ? (
                    <TableRow>
                      <TableCell
                        className="h-24 text-center"
                        colSpan={columns.length}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span>加载中...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : tableRows.length > 0
                  ? (
                      tableRows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )
                  : (
                      <TableRow>
                        <TableCell
                          className="h-24 text-center"
                          colSpan={columns.length}
                        >
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )}
            </TableBody>
          </Table>
        </div>

        {/* 分页组件 */}
        <TablePagination
          currentPage={tablePagination?.page}
          hasNextPage={tablePagination?.hasNextPage}
          hasPrevPage={tablePagination?.hasPrevPage}
          isServerSide={true}
          showSelection={false}
          table={table}
          totalCount={tablePagination?.total}
          totalPages={tablePagination?.totalPages}
          onPageChange={(page) => {
            setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
          }}
          onPageSizeChange={(pageSize) => {
            setPagination((prev) => ({ ...prev, pageIndex: 0, pageSize }))
          }}
        />
      </div>

      {/* 删除确认对话框 */}
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
        open={deleteConfirmOpen}
        title="删除授权码"
        onConfirm={handleDeleteConfirm}
        onOpenChange={setDeleteConfirmOpen}
      />
    </div>
  )
}
