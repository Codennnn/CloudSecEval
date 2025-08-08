'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Check,
  Copy,
  EllipsisVerticalIcon,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '~/components/ui/badge'
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
import type { LicenseQueryParams } from '~/lib/api/types'
import { copyToClipboard } from '~/utils/copy'

// API实际返回的授权码数据结构
interface ApiLicenseData {
  id: string
  email: string
  code: string
  verified: boolean
  locked: boolean
  warningCount: number
  createdAt: string
  stats: {
    totalAccesses: number
    commonIPs: string[]
    riskLevel: string
    isRisky: boolean
  }
}

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { PageHeader } from '~admin/components/PageHeader'
import { TablePagination } from '~admin/components/TablePagination'
import { useDeleteLicense, useLicenses } from '~admin/hooks/api/useLicense'
import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'
import { type LicenseFormData, useLicenseDialog } from '~admin/stores/useLicenseDialogStore'

// MARK: 数据类型

/**
 * 授权码数据类型
 */
interface LicenseData {
  id: string
  code: string
  email: string
  purchaseAmount: number
  status: 'active' | 'inactive' | 'expired'
  remark?: string
  expiresAt?: string
  createdAt?: string
  updatedAt?: string
}

// MARK: 辅助组件

/**
 * 复制按钮组件
 * @param code 要复制的授权码
 * @returns 复制按钮组件
 */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const result = await copyToClipboard(code)

    if (result.success) {
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }

  return (
    <Button
      className="size-6 text-muted-foreground hover:text-foreground"
      size="icon"
      variant="ghost"
      onClick={() => {
        void handleCopy()
      }}
    >
      {copied
        ? (
            <Check className="size-3 text-success" strokeWidth={3} />
          )
        : (
            <Copy className="size-3" />
          )}
      <span className="sr-only">
        {copied ? '已复制' : '复制授权码'}
      </span>
    </Button>
  )
}

/**
 * 获取状态徽章样式
 * @param status 授权码状态
 * @returns 状态徽章组件
 */
function getStatusBadge(status: LicenseData['status']) {
  const statusConfig = {
    active: { label: '有效', variant: 'default' as const, className: 'bg-success-background text-success' },
    inactive: { label: '无效', variant: 'secondary' as const, className: 'bg-warning-background text-warning' },
    expired: { label: '已过期', variant: 'destructive' as const, className: 'bg-error-background text-error' },
  }

  const config = statusConfig[status]

  return (
    <Badge className={config.className} variant={config.variant}>
      {config.label}
    </Badge>
  )
}

/**
 * 格式化日期
 * @param dateString 日期字符串
 * @returns 格式化后的日期
 */
function formatDate(dateString?: string) {
  if (!dateString) {
    return '-'
  }

  try {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm', { locale: zhCN })
  }
  catch {
    return dateString
  }
}

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
          <CopyButton code={row.original.code} />
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => getStatusBadge(row.original.status),
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
export default function LicensesPage() {
  const [data, setData] = useState<LicenseData[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [licenseToDelete, setLicenseToDelete] = useState<LicenseData | null>(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // 设置页面标题
  useEffect(() => {
    document.title = generatePageTitle(AdminRoutes.Licenses)
  }, [])

  const { openCreateDialog, openEditDialog } = useLicenseDialog()
  const deleteLicenseMutation = useDeleteLicense()

  // 构建查询参数
  const queryParams: LicenseQueryParams = {
    page: pagination.pageIndex + 1, // API 使用从1开始的页码
    pageSize: pagination.pageSize,
  }

  const { data: licenseData, isLoading, error } = useLicenses(queryParams)

  // 使用 useMemo 来稳定 licenses 数组的引用，避免无限重渲染
  const licenses = useMemo(() => {
    return (licenseData?.data ?? []) as unknown as ApiLicenseData[]
  }, [licenseData?.data])

  // 更新本地数据 - 将API数据转换为页面需要的格式
  useEffect(() => {
    if (licenses.length > 0) {
      setData(licenses.map((license) => {
        // 根据API返回的字段映射到我们需要的格式
        const mappedLicense: LicenseData = {
          id: license.id,
          code: license.code,
          email: license.email,
          // 根据verified和locked状态计算status
          status: license.verified
            ? (license.locked ? 'inactive' : 'active')
            : 'expired',
          purchaseAmount: 0,
          remark: undefined, // API暂时没有返回remark字段
          expiresAt: undefined, // API暂时没有返回expiresAt字段
          createdAt: license.createdAt,
          updatedAt: undefined, // API暂时没有返回updatedAt字段
        }

        return mappedLicense
      }))
    }
    else {
      setData([])
    }
  }, [licenses])

  // ==================== 删除处理 ====================
  const handleDeleteClick = (license: LicenseData) => {
    setLicenseToDelete(license)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!licenseToDelete) {
      return
    }

    try {
      await deleteLicenseMutation.mutateAsync(licenseToDelete.id)
      toast.success(`授权码 ${licenseToDelete.code} 已成功删除`)
      setDeleteConfirmOpen(false)
      setLicenseToDelete(null)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除授权码失败，请稍后重试'
      toast.error(errorMessage)
    }
  }

  // ==================== 表格配置 ====================
  const columns = useMemo(() => createColumns(openEditDialog, handleDeleteClick), [openEditDialog])

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // 启用服务端分页
    pageCount: licenseData?.pagination.totalPages ?? 0, // 设置总页数
  })

  // ==================== 错误处理 ====================
  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">加载失败</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : '未知错误'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-admin-content-md lg:px-admin-content py-admin-content-md md:py-admin-content">
      <div className="space-y-6">
        {/* 页面标题 */}
        <PageHeader
          actions={(
            <Button onClick={openCreateDialog}>
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
                : table.getRowModel().rows.length
                  ? (
                      table.getRowModel().rows.map((row) => (
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
          currentPage={licenseData?.pagination.page}
          hasNextPage={licenseData?.pagination.hasNextPage}
          hasPrevPage={licenseData?.pagination.hasPrevPage}
          isServerSide={true}
          showSelection={false}
          table={table}
          totalCount={licenseData?.pagination.total}
          totalPages={licenseData?.pagination.totalPages}
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
