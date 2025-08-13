'use client'

import { useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  EllipsisVerticalIcon,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

import { CopyButton } from '~/components/CopyButton'
import type { TableColumnDef } from '~/components/table/table.type'
import { generateSearchFields } from '~/components/table/table.util'
import { TableEmptyState } from '~/components/table/TableEmptyState'
import { TablePagination } from '~/components/table/TablePagination'
import { TableSkeleton } from '~/components/table/TableSkeleton'
import { TableToolbar } from '~/components/table/TableToolbar'
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
import { FieldTypeEnum } from '~/constants/form'
import type { LicenseData } from '~/lib/api/types'
import type { ColumnVisibilityConfig, QueryParams } from '~/types/advanced-search'
import { formatDate } from '~/utils/date'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { useDeleteLicense } from '~admin/hooks/api/useLicense'
import { useLicenseDialog } from '~admin/stores/useLicenseDialogStore'
import { licenseControllerGetLicenseListOptions } from '~api/@tanstack/react-query.gen'

export function LicensesPage() {
  const [licenseToDelete, setLicenseToDelete] = useState<LicenseData | null>(null)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const { openCreateDialog, openEditDialog } = useLicenseDialog()

  const deleteLicenseMutation = useDeleteLicense()

  const [queryParams, setQueryParams] = useState<QueryParams>()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([])

  const { data, isLoading } = useQuery(licenseControllerGetLicenseListOptions({
    query: {
      ...queryParams,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    },
  }))
  const list = data?.data
  const tablePagination = data?.pagination

  const handleDeleteClick = (license: LicenseData) => {
    setLicenseToDelete(license)
  }

  const handleDeleteConfirm = async () => {
    if (licenseToDelete) {
      await deleteLicenseMutation.mutateAsync(licenseToDelete.id)
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

  // MARK: 动态生成搜索字段
  const searchFields = useMemo(() => generateSearchFields<LicenseData>(columns), [columns])

  // 处理列可见性变化
  const handleColumnVisibilityChange = useEvent((config: ColumnVisibilityConfig) => {
    const newVisibilityState: VisibilityState = {}

    // 所有字段先设为不可见
    searchFields.forEach((field) => {
      newVisibilityState[field.key] = false
    })

    // 设置可见字段
    config.visibleColumns.forEach((key) => {
      newVisibilityState[key] = true
    })

    // 对于不能隐藏的列（如操作列），强制设为可见
    columns.forEach((column) => {
      if (column.enableHiding === false) {
        const key = 'accessorKey' in column ? column.accessorKey : column.id

        if (key) {
          newVisibilityState[key] = true
        }
      }
    })

    // 更新列的顺序：按照可见列的顺序，然后添加强制可见的列
    const newColumnOrder: string[] = []

    // 首先添加按顺序排列的可见列
    config.visibleColumns.forEach((key) => {
      newColumnOrder.push(key)
    })

    // 添加强制可见的列（如果还没有在列表中）
    columns.forEach((column) => {
      if (column.enableHiding === false) {
        const key = 'accessorKey' in column ? column.accessorKey : column.id

        if (key && !newColumnOrder.includes(key)) {
          newColumnOrder.push(key)
        }
      }
    })

    setColumnVisibility(newVisibilityState)
    setColumnOrder(newColumnOrder)
  })

  // 根据列可见性配置和顺序重新排序列
  const orderedColumns = useMemo(() => {
    if (columnOrder.length === 0) {
      return columns
    }

    // 创建列的映射
    const columnMap = new Map<string, typeof columns[0]>()
    columns.forEach((column) => {
      const key = 'accessorKey' in column ? column.accessorKey : column.id

      if (key) {
        columnMap.set(key, column)
      }
    })

    // 按照 columnOrder 的顺序重新排列列
    const orderedCols: typeof columns = []

    // 首先添加按顺序排列的列
    columnOrder.forEach((key) => {
      const column = columnMap.get(key)

      if (column) {
        orderedCols.push(column)
        columnMap.delete(key) // 移除已添加的列
      }
    })

    // 添加剩余的列（如新增的列或未在 order 中的列）
    columnMap.forEach((column) => {
      orderedCols.push(column)
    })

    return orderedCols
  }, [columns, columnOrder])

  const table = useReactTable({
    data: list ?? [],
    columns: orderedColumns,
    state: {
      pagination,
      columnVisibility,
      columnOrder,
    },
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // 启用服务端分页
    pageCount: tablePagination?.totalPages, // 设置总页数
  })

  const tableRows = table.getRowModel().rows

  return (
    <div className="px-admin-content-md lg:px-admin-content py-admin-content-md md:py-admin-content">
      <div className="space-y-6">
        <TableToolbar
          columnVisibilityStorageKey="licenses-table-columns"
          fields={searchFields}
          right={(
            <Button size="sm" onClick={() => { openCreateDialog() }}>
              <Plus />
              新增授权码
            </Button>
          )}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onQueryParamsChange={(params) => {
            setQueryParams(params)
          }}
        />

        <div className="rounded-md border overflow-hidden">
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
              {
                isLoading
                  ? (
                      <TableSkeleton
                        columns={columns.length}
                        rows={pagination.pageSize}
                      />
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
                    : <TableEmptyState columnsCount={columns.length} />
              }
            </TableBody>
          </Table>
        </div>

        <TablePagination
          showSelection={false}
          table={table}
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
