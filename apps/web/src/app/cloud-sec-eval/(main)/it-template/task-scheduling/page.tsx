'use client'

import { useMemo, useState } from 'react'

import { SearchIcon } from 'lucide-react'

import { Input } from '~/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

import { SimplePagination } from './components/SimplePagination'
import { StatusFilterButtons } from './components/StatusFilterButtons'
import { TaskScheduleTable } from './components/TaskScheduleTable'
import {
  mockTaskScheduleData,
  tabConfig,
  type TabType,
  TaskStatus,
} from './lib/task-schedule-data'

/**
 * 任务调度台页面
 * 用于调度和管理任务执行
 */
export default function TaskSchedulingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('security-requirement')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /**
   * 根据当前 Tab 和筛选条件过滤任务数据
   */
  const filteredTasks = useMemo(() => {
    let filtered = mockTaskScheduleData

    // 在"汇总工单" Tab 中应用状态筛选
    if (activeTab === 'in-progress') {
      if (selectedStatus === 'all') {
        filtered = filtered.filter((task) => task.status === TaskStatus.Pending)
      }
      else {
        filtered = filtered.filter((task) => task.status === selectedStatus)
      }
    }

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
  }, [activeTab, selectedStatus, searchKeyword])

  /**
   * 根据分页参数计算当前页显示的数据
   */
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return filteredTasks.slice(startIndex, endIndex)
  }, [filteredTasks, currentPage, pageSize])

  /**
   * 处理 Tab 切换
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType)
    setSearchKeyword('')
    setSelectedStatus('all')
    setCurrentPage(1)
  }

  /**
   * 处理状态筛选变化
   */
  const handleStatusChange = (status: TaskStatus | 'all') => {
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
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Tabs
        className="flex-1"
        defaultValue="security-requirement"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        {/* Tab 导航 */}
        <TabsList>
          <TabsTrigger value="security-requirement">
            {tabConfig['security-requirement'].label}
          </TabsTrigger>
          <TabsTrigger value="check-item">
            {tabConfig['check-item'].label}
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            {tabConfig['in-progress'].label}
          </TabsTrigger>
        </TabsList>

        {/* 安全要求 Tab */}
        <TabsContent className="space-y-4" value="security-requirement">
          {/* 搜索框 */}
          <div className="relative w-80">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={tabConfig['security-requirement'].searchPlaceholder}
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* 任务表格 */}
          <TaskScheduleTable tasks={paginatedTasks} />

          {/* 分页组件 */}
          <SimplePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredTasks.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </TabsContent>

        {/* 检查项 Tab */}
        <TabsContent className="space-y-4" value="check-item">
          {/* 搜索框 */}
          <div className="relative w-80">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={tabConfig['check-item'].searchPlaceholder}
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* 任务表格 */}
          <TaskScheduleTable tasks={paginatedTasks} />

          {/* 分页组件 */}
          <SimplePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredTasks.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </TabsContent>

        {/* 汇总工单 Tab */}
        <TabsContent className="space-y-4" value="in-progress">
          {/* 搜索框和筛选按钮 */}
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={tabConfig['in-progress'].searchPlaceholder}
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
              tasks={mockTaskScheduleData}
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* 任务表格 */}
          <TaskScheduleTable tasks={paginatedTasks} />

          {/* 分页组件 */}
          <SimplePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredTasks.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
