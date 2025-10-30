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
 * 简单分页组件属性
 */
interface SimplePaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

/**
 * 简单分页组件
 * 提供页码导航、每页条数设置等功能
 */
export function SimplePagination(props: SimplePaginationProps) {
  const {
    currentPage,
    pageSize,
    totalItems,
    pageSizeOptions = [10, 20, 50],
    onPageChange,
    onPageSizeChange,
  } = props

  /**
   * 计算总页数
   */
  const totalPages = Math.ceil(totalItems / pageSize)

  /**
   * 是否可以上一页
   */
  const canPrevious = currentPage > 1

  /**
   * 是否可以下一页
   */
  const canNext = currentPage < totalPages

  /**
   * 跳转到第一页
   */
  const handleFirstPage = () => {
    if (canPrevious) {
      onPageChange(1)
    }
  }

  /**
   * 跳转到上一页
   */
  const handlePreviousPage = () => {
    if (canPrevious) {
      onPageChange(currentPage - 1)
    }
  }

  /**
   * 跳转到下一页
   */
  const handleNextPage = () => {
    if (canNext) {
      onPageChange(currentPage + 1)
    }
  }

  /**
   * 跳转到最后一页
   */
  const handleLastPage = () => {
    if (canNext) {
      onPageChange(totalPages)
    }
  }

  /**
   * 处理每页条数变化
   */
  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value)
    onPageSizeChange(newPageSize)
    // 重置到第一页
    onPageChange(1)
  }

  /**
   * 计算当前显示的数据范围
   */
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* 左侧：数据范围显示 */}
      <div className="text-sm text-muted-foreground">
        显示 {startItem} - {endItem} 条，共 {totalItems} 条
      </div>

      {/* 右侧：分页控制 */}
      <div className="flex items-center gap-6">
        {/* 每页条数选择器 */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium" htmlFor="page-size">
            每页显示
          </Label>

          <Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20" id="page-size" size="sm">
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

        {/* 页码信息 */}
        <div className="text-sm text-muted-foreground">
          第 {currentPage} / {totalPages} 页
        </div>

        {/* 分页按钮组 */}
        <div className="flex items-center gap-2">
          {/* 跳转到第一页 */}
          <Button
            className="hidden size-8 p-0 lg:flex"
            disabled={!canPrevious}
            variant="outline"
            onClick={handleFirstPage}
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
            onClick={handlePreviousPage}
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
            onClick={handleNextPage}
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
            onClick={handleLastPage}
          >
            <span className="sr-only">跳转到最后一页</span>
            <ChevronsRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

