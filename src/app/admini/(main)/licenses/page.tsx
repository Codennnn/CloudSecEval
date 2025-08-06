'use client'

import { useState } from 'react'

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import type { License, LicenseQueryParams } from '~/lib/api/types'

import { useLicenses } from '~admin/hooks/api/useLicense'

/**
 * 获取状态徽章样式
 * @param status 授权码状态
 * @returns 状态徽章组件
 */
function getStatusBadge(status: License['status']) {
  const statusConfig = {
    active: { label: '有效', variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    inactive: { label: '无效', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
    expired: { label: '已过期', variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
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
  if (!dateString) { return '-' }

  try {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm', { locale: zhCN })
  }
  catch {
    return dateString
  }
}

/**
 * 授权码管理页面
 */
export default function LicensesPage() {
  const [queryParams, setQueryParams] = useState<LicenseQueryParams>({
    page: 1,
    limit: 10,
  })

  const { data: licenseData, isLoading, error } = useLicenses(queryParams)

  /**
   * 处理搜索
   * @param value 搜索关键词
   */
  const handleSearch = (value: string) => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      search: value || undefined,
    }))
  }

  /**
   * 处理状态筛选
   * @param status 状态值
   */
  const handleStatusFilter = (status: string) => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      status: status === 'all' ? undefined : status as License['status'],
    }))
  }

  /**
   * 处理分页
   * @param page 页码
   */
  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }))
  }

  /**
   * 处理每页条数变更
   * @param limit 每页条数
   */
  const handleLimitChange = (limit: number) => {
    setQueryParams((prev) => ({ ...prev, page: 1, limit }))
  }

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

  const licenses = licenseData?.data || []
  const pagination = licenseData?.pagination

  return (
    <div className="px-admin-content-md lg:px-admin-content py-admin-content-md md:py-admin-content">
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">授权码管理</h1>
            <p className="text-muted-foreground">管理系统授权码，查看使用状态和有效期</p>
          </div>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            新增授权码
          </Button>
        </div>

        {/* 筛选和搜索 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              defaultValue={queryParams.search || ''}
              placeholder="搜索授权码..."
              onChange={(e) => {
                const value = e.target.value
                // 防抖处理
                const timeoutId = setTimeout(() => { handleSearch(value) }, 300)

                return () => { clearTimeout(timeoutId) }
              }}
            />
          </div>

          <Select
            value={queryParams.status || 'all'}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="active">有效</SelectItem>
              <SelectItem value="inactive">无效</SelectItem>
              <SelectItem value="expired">已过期</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 数据表格 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>授权码</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>过期时间</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
              // 加载状态
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="h-16" colSpan={7}>
                      <div className="flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : licenses.length === 0 ? (
              // 空状态
                <TableRow>
                  <TableCell className="h-32 text-center" colSpan={7}>
                    <div className="text-muted-foreground">
                      {queryParams.search || queryParams.status ? '没有找到匹配的授权码' : '暂无授权码数据'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
              // 数据行
                licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-sm">
                      {license.code}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(license.status)}
                    </TableCell>
                    <TableCell>
                      {license.type
                        ? (
                            <Badge variant="outline">{license.type}</Badge>
                          )
                        : (
                            <span className="text-muted-foreground">-</span>
                          )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {license.description || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(license.expiresAt)}
                    </TableCell>
                    <TableCell>
                      {formatDate(license.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-8 w-8"
                            size="icon"
                            variant="ghost"
                          >
                            <EllipsisVerticalIcon className="h-4 w-4" />
                            <span className="sr-only">打开菜单</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>查看详情</DropdownMenuItem>
                          <DropdownMenuItem>编辑</DropdownMenuItem>
                          <DropdownMenuItem>复制授权码</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        {pagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共 {pagination.total} 条记录，第 {pagination.page} 页，共 {pagination.totalPages} 页
            </div>

            <div className="flex items-center gap-2">
              {/* 每页条数选择 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">每页</span>
                <Select
                  value={queryParams.limit?.toString() || '10'}
                  onValueChange={(value) => { handleLimitChange(Number(value)) }}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">条</span>
              </div>

              {/* 分页按钮 */}
              <div className="flex items-center gap-1">
                <Button
                  className="h-8 w-8"
                  disabled={!pagination.hasPrevPage}
                  size="icon"
                  variant="outline"
                  onClick={() => { handlePageChange(1) }}
                >
                  <ChevronsLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  className="h-8 w-8"
                  disabled={!pagination.hasPrevPage}
                  size="icon"
                  variant="outline"
                  onClick={() => { handlePageChange(pagination.page - 1) }}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground px-2">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                </div>

                <Button
                  className="h-8 w-8"
                  disabled={!pagination.hasNextPage}
                  size="icon"
                  variant="outline"
                  onClick={() => { handlePageChange(pagination.page + 1) }}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
                <Button
                  className="h-8 w-8"
                  disabled={!pagination.hasNextPage}
                  size="icon"
                  variant="outline"
                  onClick={() => { handlePageChange(pagination.totalPages) }}
                >
                  <ChevronsRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
