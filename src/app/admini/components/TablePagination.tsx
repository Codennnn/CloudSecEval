'use client'

import type { Table } from '@tanstack/react-table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

/**
 * 分页组件属性接口
 */
export interface TablePaginationProps<TData> {
  /** React Table 实例 */
  table: Table<TData>
  /** 是否显示每页条数选择器，默认为 true */
  showPageSizeSelector?: boolean
  /** 是否显示选中行数统计，默认为 true */
  showSelection?: boolean
  /** 每页条数选项，默认为 [10, 20, 30, 40, 50] */
  pageSizeOptions?: number[]
  /** 是否启用服务端分页模式，默认为 false */
  isServerSide?: boolean
  /** 总条数（仅在服务端分页模式下使用） */
  totalCount?: number
  /** 当前页码（仅在服务端分页模式下使用） */
  currentPage?: number
  /** 总页数（仅在服务端分页模式下使用） */
  totalPages?: number
  /** 页码变化回调（仅在服务端分页模式下使用） */
  onPageChange?: (page: number) => void
  /** 每页条数变化回调（仅在服务端分页模式下使用） */
  onPageSizeChange?: (pageSize: number) => void
  /** 是否有下一页（仅在服务端分页模式下使用） */
  hasNextPage?: boolean
  /** 是否有上一页（仅在服务端分页模式下使用） */
  hasPrevPage?: boolean
  /** 自定义样式类名 */
  className?: string
}

/**
 * 表格分页组件
 *
 * 支持两种模式：
 * 1. 客户端分页（默认）：数据在前端进行分页处理
 * 2. 服务端分页：分页逻辑在服务端处理，需要传入相关分页信息和回调函数
 *
 * @param props 分页组件属性
 * @returns 分页组件
 */
export function TablePagination<TData>({
  table,
  showPageSizeSelector = true,
  showSelection = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  isServerSide = false,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPrevPage,
  className = '',
}: TablePaginationProps<TData>) {
  // 客户端分页模式下的数据
  const clientPageIndex = table.getState().pagination.pageIndex
  const clientPageSize = table.getState().pagination.pageSize
  const clientTotalPages = table.getPageCount()
  const clientCanPrevious = table.getCanPreviousPage()
  const clientCanNext = table.getCanNextPage()
  const clientSelectedRows = table.getFilteredSelectedRowModel().rows.length
  const clientTotalRows = table.getFilteredRowModel().rows.length

  // 根据模式选择使用的数据
  const pageIndex = isServerSide ? (currentPage ?? 1) - 1 : clientPageIndex
  const pageSize = isServerSide ? (table.getState().pagination.pageSize || 10) : clientPageSize
  const pageCount = isServerSide ? (totalPages ?? 1) : clientTotalPages
  const canPrevious = isServerSide ? (hasPrevPage ?? false) : clientCanPrevious
  const canNext = isServerSide ? (hasNextPage ?? false) : clientCanNext
  const selectedCount = isServerSide ? 0 : clientSelectedRows
  const totalRows = isServerSide ? (totalCount ?? 0) : clientTotalRows

  /**
   * 处理页码变化
   * @param newPageIndex 新的页码索引（从 0 开始）
   */
  const handlePageIndexChange = (newPageIndex: number) => {
    if (isServerSide && onPageChange) {
      onPageChange(newPageIndex + 1) // 转换为从 1 开始的页码
    }
    else {
      table.setPageIndex(newPageIndex)
    }
  }

  /**
   * 处理每页条数变化
   * @param newPageSize 新的每页条数
   */
  const handlePageSizeChange = (newPageSize: number) => {
    if (isServerSide && onPageSizeChange) {
      onPageSizeChange(newPageSize)
    }
    else {
      table.setPageSize(newPageSize)
    }
  }

  return (
    <div className={`flex items-center justify-between px-4 ${className}`}>
      {/* 选中行数统计 */}
      {showSelection && !isServerSide && (
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          已选择 {selectedCount} / {totalRows} 行
        </div>
      )}

      {/* 如果不显示选择统计，添加一个占位符以保持布局 */}
      {(!showSelection || isServerSide) && (
        <div className="hidden flex-1 lg:flex" />
      )}

      <div className="flex w-full items-center gap-8 lg:w-fit">
        {/* 每页条数选择器 */}
        {showPageSizeSelector && (
          <div className="hidden items-center gap-2 lg:flex">
            <Label className="text-sm font-medium" htmlFor="rows-per-page">
              每页显示
            </Label>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                handlePageSizeChange(Number(value))
              }}
            >
              <SelectTrigger className="w-20" id="rows-per-page" size="sm">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">条</span>
          </div>
        )}

        {/* 当前页码显示 */}
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          第 {pageIndex + 1} 页，共 {pageCount} 页
        </div>

        {/* 分页按钮组 */}
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* 跳转到第一页 */}
          <Button
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!canPrevious}
            variant="outline"
            onClick={() => {
              handlePageIndexChange(0)
            }}
          >
            <span className="sr-only">跳转到第一页</span>
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>

          {/* 上一页 */}
          <Button
            className="size-8"
            disabled={!canPrevious}
            size="icon"
            variant="outline"
            onClick={() => {
              handlePageIndexChange(pageIndex - 1)
            }}
          >
            <span className="sr-only">上一页</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          {/* 下一页 */}
          <Button
            className="size-8"
            disabled={!canNext}
            size="icon"
            variant="outline"
            onClick={() => {
              handlePageIndexChange(pageIndex + 1)
            }}
          >
            <span className="sr-only">下一页</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          {/* 跳转到最后一页 */}
          <Button
            className="hidden size-8 lg:flex"
            disabled={!canNext}
            size="icon"
            variant="outline"
            onClick={() => {
              handlePageIndexChange(pageCount - 1)
            }}
          >
            <span className="sr-only">跳转到最后一页</span>
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
