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
import { cn } from '~/lib/utils'

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
  className?: string
}

/**
 * 表格分页组件
 *
 * 提供页码导航、每页条数设置、选中行数统计等功能
 * 基于 TanStack Table，支持响应式设计
 */
export function TablePagination<TData>({
  table,
  showPageSizeSelector = true,
  showSelection = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className = '',
}: TablePaginationProps<TData>) {
  // 从 React Table 实例获取分页信息
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const canPrevious = table.getCanPreviousPage()
  const canNext = table.getCanNextPage()
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalRows = table.getFilteredRowModel().rows.length

  /**
   * 处理页码变化
   */
  const handlePageIndexChange = (newPageIndex: number) => {
    table.setPageIndex(newPageIndex)
  }

  /**
   * 处理每页条数变化
   */
  const handlePageSizeChange = (newPageSize: number) => {
    table.setPageSize(newPageSize)
  }

  return (
    <div className={cn('flex items-center flex-wrap', className)}>
      {/* 选中行数统计 */}
      {showSelection && (
        <div className="px-1 text-muted-foreground hidden text-sm lg:flex">
          已选择 {selectedCount} / {totalRows} 行
        </div>
      )}

      <div className="flex items-center flex-wrap gap-x-8 gap-y-1.5 ml-auto lg:w-fit">
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
        <div className="flex w-fit items-center justify-center flex-wrap text-sm font-medium">
          <span className="whitespace-nowrap">第 {pageIndex + 1} 页，</span>
          <span className="whitespace-nowrap">共 {pageCount} 页</span>
        </div>

        {/* 分页按钮组 */}
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* 跳转到第一页 */}
          <Button
            className="hidden size-8 p-0 lg:flex"
            disabled={!canPrevious}
            variant="outline"
            onClick={() => {
              handlePageIndexChange(0)
            }}
          >
            <span className="sr-only">跳转到第一页</span>
            <ChevronsLeftIcon className="size-4" />
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
            <ChevronLeftIcon className="size-4" />
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
            <ChevronRightIcon className="size-4" />
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
            <ChevronsRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
