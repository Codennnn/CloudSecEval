'use client'

import { useMemo, useState } from 'react'

import { SimplePagination } from './components/simple-pagination'
import { TaskReviewTable } from './components/task-review-table'
import { mockTaskReviewData } from './lib/mock-data'

/**
 * 任务审核台页面
 * 用于审核和验证任务信息
 */
export default function TaskReviewPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /**
   * 根据分页参数计算当前页显示的数据
   * 数据按创建时间倒序排列（最新的在前）
   */
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return mockTaskReviewData.slice(startIndex, endIndex)
  }, [currentPage, pageSize])

  /**
   * 处理页码变化
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  /**
   * 处理每页条数变化
   */
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 页面标题 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">任务审核台</h1>
        <p className="text-muted-foreground">审核和验证任务提交的信息</p>
      </div>

      {/* 任务审核表格 */}
      <TaskReviewTable tasks={paginatedTasks} />

      {/* 分页组件 */}
      <SimplePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={mockTaskReviewData.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
