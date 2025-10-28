import { AlertTriangleIcon, CheckCircleIcon, ShieldAlertIcon, ShieldIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/utils'

import type { RiskStats } from '../lib/types'

interface RiskStatsCardsProps {
  stats: RiskStats
}

/**
 * 风险统计卡片组件
 * 展示总风险数、高危数、中危数、低危数
 */
export function RiskStatsCards(props: RiskStatsCardsProps) {
  const { stats } = props

  const cards = [
    {
      title: '总风险数',
      value: stats.total,
      icon: ShieldAlertIcon,
      bgClass: 'bg-blue-50 dark:bg-blue-950/20',
      iconClass: 'text-blue-600 dark:text-blue-400',
      textClass: 'text-blue-600 dark:text-blue-400',
      description: '已发现的所有风险项',
    },
    {
      title: '高风险',
      value: stats.high,
      icon: AlertTriangleIcon,
      bgClass: 'bg-red-50 dark:bg-red-950/20',
      iconClass: 'text-red-600 dark:text-red-400',
      textClass: 'text-red-600 dark:text-red-400',
      description: `占比 ${((stats.high / stats.total) * 100).toFixed(1)}%`,
    },
    {
      title: '中风险',
      value: stats.medium,
      icon: ShieldIcon,
      bgClass: 'bg-orange-50 dark:bg-orange-950/20',
      iconClass: 'text-orange-600 dark:text-orange-400',
      textClass: 'text-orange-600 dark:text-orange-400',
      description: `占比 ${((stats.medium / stats.total) * 100).toFixed(1)}%`,
    },
    {
      title: '低风险',
      value: stats.low,
      icon: CheckCircleIcon,
      bgClass: 'bg-green-50 dark:bg-green-950/20',
      iconClass: 'text-green-600 dark:text-green-400',
      textClass: 'text-green-600 dark:text-green-400',
      description: `占比 ${((stats.low / stats.total) * 100).toFixed(1)}%`,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={cn('rounded-lg p-2', card.bgClass)}>
                <Icon className={cn('size-4', card.iconClass)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-bold', card.textClass)}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

