import { FileTextIcon } from 'lucide-react'

import { cn } from '~/lib/utils'

import type { MainTask } from '../lib/task-data'

/**
 * 任务导航组件属性
 */
interface TaskNavigationProps {
  tasks: MainTask[]
  selectedTaskId: string
  onTaskSelect: (taskId: string) => void
}

/**
 * 任务导航组件
 * 展示左侧垂直的任务列表导航
 */
export function TaskNavigation(props: TaskNavigationProps) {
  const { tasks, selectedTaskId, onTaskSelect } = props

  return (
    <div className="flex h-full w-64 flex-col gap-2 border-r bg-muted/30 p-4">
      {tasks.map((task) => {
        const isSelected = task.id === selectedTaskId

        return (
          <button
            key={task.id}
            type="button"
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all',
              isSelected
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-background text-foreground hover:bg-muted',
            )}
            onClick={() => {
              onTaskSelect(task.id)
            }}
          >
            <FileTextIcon
              className={cn(
                'h-5 w-5 flex-shrink-0',
                isSelected ? 'text-white' : 'text-blue-500',
              )}
            />
            <span className="flex-1">{task.fullTitle}</span>
          </button>
        )
      })}
    </div>
  )
}

