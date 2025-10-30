'use client'

import { useMemo, useState } from 'react'

import { SearchIcon } from 'lucide-react'

import { Input } from '~/components/ui/input'

import { SimplePagination } from '../task-scheduling/components/SimplePagination'

import { StatusFilterButtons } from './components/StatusFilterButtons'
import { TaskFillingTable } from './components/TaskFillingTable'
import { TaskNavigation } from './components/TaskNavigation'
import {
  mainTasks,
  mockTaskFillingData,
  TaskFillingStatus,
} from './lib/task-filling-data'

/**
 * 任务填报台页面
 * 用于填报和提交任务信息
 */
export default function TaskFillingPage() {
  const [selectedTaskId, setSelectedTaskId] = useState('task-1')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<TaskFillingStatus>(
    TaskFillingStatus.PendingSubmit,
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /**
   * 根据搜索关键词和状态筛选过滤任务数据
   */
  const filteredTasks = useMemo(() => {
    let filtered = mockTaskFillingData

    // 应用状态筛选
    filtered = filtered.filter((task) => task.status === selectedStatus)

    // 应用搜索过滤
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter((task) => {
        return (
          task.workOrderTitle.toLowerCase().includes(keyword)
          || task.titleCategory.toLowerCase().includes(keyword)
          || task.securityRequirement.toLowerCase().includes(keyword)
          || task.checkItem.toLowerCase().includes(keyword)
          || task.assignedBy.toLowerCase().includes(keyword)
        )
      })
    }

    return filtered
  }, [selectedStatus, searchKeyword])

  /**
   * 根据分页参数计算当前页显示的数据
   */
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return filteredTasks.slice(startIndex, endIndex)
  }, [filteredTasks, currentPage, pageSize])

  /**
   * 处理任务导航切换
   */
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId)
    setSearchKeyword('')
    setSelectedStatus(TaskFillingStatus.PendingSubmit)
    setCurrentPage(1)
  }

  /**
   * 处理状态筛选变化
   */
  const handleStatusChange = (status: TaskFillingStatus) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

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
    <div className="flex h-full">
      {/* 左侧任务导航 */}
      <TaskNavigation
        selectedTaskId={selectedTaskId}
        tasks={mainTasks}
        onTaskSelect={handleTaskSelect}
      />

      {/* 右侧内容区 */}
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* 搜索框和筛选按钮 */}
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="请输入检查项"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* 状态筛选按钮组 */}
          <StatusFilterButtons
            selectedStatus={selectedStatus}
            tasks={mockTaskFillingData}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* 任务填报表格 */}
        <TaskFillingTable tasks={paginatedTasks} />

        {/* 分页组件 */}
        <SimplePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredTasks.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}
