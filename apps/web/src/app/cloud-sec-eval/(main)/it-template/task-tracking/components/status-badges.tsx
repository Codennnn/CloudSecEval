import { Badge } from '~/components/ui/badge'

import type { TaskTrackingStats } from '../lib/mock-data'

/**
 * 状态标签组组件属性
 */
interface StatusBadgesProps {
  stats: TaskTrackingStats
}

/**
 * 状态标签组组件
 * 用于显示任务跟踪的各种状态统计标签
 */
export function StatusBadges({ stats }: StatusBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 周下发 - 灰色 */}
      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100" variant="secondary">
        周下发 {stats.issued}
      </Badge>

      {/* 处理中 - 蓝色 */}
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        处理中 {stats.processing}
      </Badge>

      {/* 审核中 - 黄色 */}
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        审核中 {stats.reviewing}
      </Badge>

      {/* 已完成 - 绿色 */}
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        已完成 {stats.completed}
      </Badge>

      {/* 已超时 - 红色 */}
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        已超时 {stats.overdue}
      </Badge>
    </div>
  )
}

