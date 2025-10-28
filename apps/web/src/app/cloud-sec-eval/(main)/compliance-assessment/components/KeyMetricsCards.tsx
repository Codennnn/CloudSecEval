'use client'

import { useEffect, useState } from 'react'

import { BotIcon, ClockIcon, UserIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'

import type { KeyMetrics } from '../types/assessment'

interface KeyMetricsCardsProps {
  /** 关键指标数据 */
  metrics: KeyMetrics
}

/**
 * 关键指标卡片组件
 * 展示自动化率、时间缩短、人工干预三个核心指标
 */
export function KeyMetricsCards(props: KeyMetricsCardsProps) {
  const { metrics } = props

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 自动化率卡片 */}
      <MetricCard
        color="blue"
        icon={<BotIcon className="size-5" />}
        subtitle={`${metrics.autoProcessedCount}/${metrics.totalCount} 项自动处理`}
        title="测评流程自动化率"
        value={metrics.automationRate}
      />

      {/* 时间缩短卡片 */}
      <MetricCard
        color="green"
        icon={<ClockIcon className="size-5" />}
        subtitle="2天 → 4小时"
        title="报告生成时间缩短"
        value={metrics.timeSavedPercentage}
      />

      {/* 人工干预卡片 */}
      <MetricCard
        isInverse
        color="orange"
        icon={<UserIcon className="size-5" />}
        subtitle={`${metrics.manualReviewCount}/${metrics.totalCount} 项需人工复核`}
        title="人工干预比例"
        value={metrics.manualInterventionRate}
      />
    </div>
  )
}

interface MetricCardProps {
  /** 图标 */
  icon: React.ReactNode
  /** 标题 */
  title: string
  /** 数值（0-1） */
  value: number
  /** 副标题 */
  subtitle: string
  /** 颜色主题 */
  color: 'blue' | 'green' | 'orange'
  /** 是否反向指标（数值越小越好） */
  isInverse?: boolean
}

/**
 * 单个指标卡片
 */
function MetricCard(props: MetricCardProps) {
  const { icon, title, value, subtitle, color, isInverse = false } = props
  const [displayValue, setDisplayValue] = useState(0)

  // 数字滚动动画
  useEffect(() => {
    let startTime: number | null = null
    const duration = 1500 // 动画持续时间

    const animate = (currentTime: number) => {
      if (!startTime) {
        startTime = currentTime
      }

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数
      const easeOutQuart = 1 - (1 - progress) ** 4
      setDisplayValue(value * easeOutQuart)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  const percentage = Math.round(displayValue * 100)

  // 根据颜色主题设置样式
  const colorClasses = {
    blue: {
      icon: 'text-blue-600 dark:text-blue-400',
      progress: 'bg-blue-600',
      text: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      icon: 'text-green-600 dark:text-green-400',
      progress: 'bg-green-600',
      text: 'text-green-600 dark:text-green-400',
    },
    orange: {
      icon: 'text-orange-600 dark:text-orange-400',
      progress: 'bg-orange-600',
      text: 'text-orange-600 dark:text-orange-400',
    },
  }

  const classes = colorClasses[color]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={classes.icon}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* 百分比数值 */}
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${classes.text}`}>
              {percentage}%
            </span>
            {!isInverse && (
              <span className="text-xs text-muted-foreground">
                ↑ 行业领先
              </span>
            )}
          </div>

          {/* 进度条 */}
          <Progress
            className="h-2"
            indicatorClassName={classes.progress}
            value={percentage}
          />

          {/* 副标题 */}
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}
