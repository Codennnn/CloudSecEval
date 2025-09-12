import { CheckCircleIcon, ClockIcon, FileTextIcon, XCircleIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

import type { ActivityItem } from '../lib/mockData'

// 根据状态返回颜色类名
const getReviewStatusTextColor = (status: ActivityItem['status']) => {
  let textClass = 'text-muted-foreground'

  switch (status) {
    case '已通过':
      textClass = 'text-green-600'
      break

    case '已拒绝':
      textClass = 'text-red-600'
      break

    case '待审核':
      textClass = 'text-orange-600'
      break

    default:
      textClass = 'text-muted-foreground'
      break
  }

  return textClass
}

// 根据严重级别返回徽标样式
const getSeverityBadgeClass = (severity: ActivityItem['severity']) => {
  let badgeClass = 'border-gray-200 bg-gray-50 text-gray-700'

  switch (severity) {
    case '高危':
      badgeClass = 'border-red-200 bg-red-50 text-red-700'
      break

    case '中危':
      badgeClass = 'border-orange-200 bg-orange-50 text-orange-700'
      break

    case '低危':
      badgeClass = 'border-yellow-200 bg-yellow-50 text-yellow-700'
      break

    default:
      badgeClass = 'border-gray-200 bg-gray-50 text-gray-700'
      break
  }

  return badgeClass
}

/**
 * 时间线活动卡片：按时间顺序展示成员提交与审核报告的动态
 */
export function ActivityTimeline({ activities }: { activities: ActivityItem[] }) {
  const renderIcon = (item: ActivityItem, size: number) => {
    let icon = <ClockIcon className="text-orange-600" size={size} />

    if (item.action === '提交漏洞报告') {
      icon = <FileTextIcon className="text-blue-600" size={size} />
    }
    else if (item.status === '已通过') {
      icon = <CheckCircleIcon className="text-green-600" size={size} />
    }
    else if (item.status === '已拒绝') {
      icon = <XCircleIcon className="text-red-600" size={size} />
    }

    return icon
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>时间线活动</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-[8px] top-0 bottom-0 w-px bg-border" />

          <ol className="space-y-4">
            {activities.map((item) => (
              <li key={item.id} className="relative pl-8">
                <span className="absolute left-0 top-0 flex items-center justify-center rounded-full bg-background">
                  {renderIcon(item, 16)}
                </span>

                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm flex items-center gap-1 overflow-hidden">
                    <span className="font-medium shrink-0">{item.user}</span>
                    <span className="text-muted-foreground shrink-0">{item.action}</span>
                    <span className="font-medium truncate flex-1 min-w-0">{item.title}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <Badge className={getSeverityBadgeClass(item.severity)} variant="outline">
                    {item.severity}
                  </Badge>

                  <span className={`text-xs ${getReviewStatusTextColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
