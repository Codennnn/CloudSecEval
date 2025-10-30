import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

import { TaskStatus, taskStatusConfig, type TaskScheduleItem } from '../lib/task-schedule-data'

/**
 * 状态筛选按钮组属性
 */
interface StatusFilterButtonsProps {
  tasks: TaskScheduleItem[]
  selectedStatus: TaskStatus | 'all'
  onStatusChange: (status: TaskStatus | 'all') => void
}

/**
 * 筛选按钮配置
 */
const filterButtonConfig = [
  {
    key: 'all' as const,
    label: '待处理',
    status: TaskStatus.Pending,
  },
  {
    key: TaskStatus.Processing,
    label: '审核中',
    status: TaskStatus.Processing,
  },
  {
    key: TaskStatus.Approved,
    label: '已通过',
    status: TaskStatus.Approved,
  },
  {
    key: TaskStatus.Rejected,
    label: '已拒绝',
    status: TaskStatus.Rejected,
  },
]

/**
 * 状态筛选按钮组组件
 * 显示四个筛选按钮及对应的任务数量
 */
export function StatusFilterButtons(props: StatusFilterButtonsProps) {
  const { tasks, selectedStatus, onStatusChange } = props

  /**
   * 计算指定状态的任务数量
   */
  const getStatusCount = (status: TaskStatus | 'all') => {
    if (status === 'all') {
      return tasks.filter((task) => task.status === TaskStatus.Pending).length
    }
    return tasks.filter((task) => task.status === status).length
  }

  return (
    <div className="flex items-center gap-2">
      {filterButtonConfig.map((config) => {
        const isSelected = selectedStatus === config.key
        const count = getStatusCount(config.key)

        return (
          <Button
            key={config.key}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'gap-1.5',
              isSelected && 'bg-blue-500 hover:bg-blue-600',
            )}
            onClick={() => {
              onStatusChange(config.key)
            }}
          >
            <span>{config.label}</span>
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-xs',
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {count}
            </span>
          </Button>
        )
      })}
    </div>
  )
}

