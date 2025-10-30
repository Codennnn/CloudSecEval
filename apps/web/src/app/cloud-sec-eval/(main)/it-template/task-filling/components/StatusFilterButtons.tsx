import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

import { TaskFillingStatus, taskFillingStatusConfig, type TaskFillingItem } from '../lib/task-filling-data'

/**
 * 状态筛选按钮组属性
 */
interface StatusFilterButtonsProps {
  tasks: TaskFillingItem[]
  selectedStatus: TaskFillingStatus | 'all'
  onStatusChange: (status: TaskFillingStatus | 'all') => void
}

/**
 * 筛选按钮配置
 */
const filterButtonConfig = [
  {
    key: TaskFillingStatus.PendingSubmit,
    label: '待提交',
  },
  {
    key: TaskFillingStatus.UnderReview,
    label: '审核中',
  },
  {
    key: TaskFillingStatus.Rejected,
    label: '已拒绝',
  },
  {
    key: TaskFillingStatus.Approved,
    label: '已通过',
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
  const getStatusCount = (status: TaskFillingStatus) => {
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

