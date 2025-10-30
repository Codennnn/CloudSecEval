'use client'

import { useMemo, useState } from 'react'

import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'

import { TaskItemCard } from './components/TaskItemCard'
import { TaskNavigation } from './components/TaskNavigation'
import { mainTasks } from './lib/task-data'

/**
 * 任务创建台页面
 * 展示系统开发与供应链安全相关的任务分项，支持左侧导航切换
 */
export default function TaskCreationPage() {
  const [taskMode, setTaskMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('task-1')

  /**
   * 获取当前选中的任务
   */
  const selectedTask = useMemo(() => {
    return mainTasks.find((task) => task.id === selectedTaskId)
  }, [selectedTaskId])

  /**
   * 处理任务选择
   */
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  return (
    <div className="flex h-full flex-1">
      {/* 左侧任务导航 */}
      <TaskNavigation
        selectedTaskId={selectedTaskId}
        tasks={mainTasks}
        onTaskSelect={handleTaskSelect}
      />

      {/* 右侧内容区 */}
      <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">
        {/* 页面标题和控制区 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{selectedTask?.fullTitle}</h1>

          <div className="flex items-center gap-6">
            {/* 任务模式开关 */}
            <div className="flex items-center gap-2">
              <Label className="text-sm" htmlFor="task-mode">
                任务模式
              </Label>
              <Switch
                checked={taskMode}
                id="task-mode"
                onCheckedChange={setTaskMode}
              />
            </div>

            {/* 编辑模式开关 */}
            <div className="flex items-center gap-2">
              <Label className="text-sm" htmlFor="edit-mode">
                编辑模式
              </Label>
              <Switch
                checked={editMode}
                id="edit-mode"
                onCheckedChange={setEditMode}
              />
            </div>
          </div>
        </div>

        {/* 任务分项列表或空状态 */}
        {selectedTask?.items && selectedTask.items.length > 0
          ? (
              <div className="flex flex-col gap-4">
                {selectedTask.items.map((item, index) => (
                  <TaskItemCard
                    key={item.id}
                    index={index}
                    item={item}
                  />
                ))}
              </div>
            )
          : (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-muted-foreground/25">
                <div className="text-center">
                  <p className="text-lg font-medium text-muted-foreground">
                    暂无任务分项
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground/75">
                    该任务的详细内容正在准备中
                  </p>
                </div>
              </div>
            )}
      </div>
    </div>
  )
}
