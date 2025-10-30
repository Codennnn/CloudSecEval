'use client'

import { useMemo, useState } from 'react'

import { SimplePagination } from './components/simple-pagination'
import { TaskTrackingTable } from './components/task-tracking-table'
import { mockTaskTrackingData } from './lib/mock-data'

/**
 * 任务跟踪台页面
 * 用于跟踪和监控任务进度
 */
export default function TaskTrackingPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /**
   * 根据分页参数计算当前页显示的数据
   */
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return mockTaskTrackingData.slice(startIndex, endIndex)
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
        <h1 className="text-3xl font-bold">任务跟踪台</h1>
        <p className="text-muted-foreground">跟踪和监控任务执行进度</p>
      </div>

      {/* 任务跟踪表格 */}
      <TaskTrackingTable tasks={paginatedTasks} />

      {/* 分页组件 */}
      <SimplePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={mockTaskTrackingData.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
