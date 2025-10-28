'use client'

import { BotIcon, ClockIcon, TrendingUpIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'

import { calculateAutomationStats } from '../lib/process-simulator'
import type { AssessmentProject } from '../types/assessment'

interface AutomationStatsPanelProps {
  /** 评估项目 */
  project: AssessmentProject
}

/**
 * 自动化统计面板组件
 * 展示自动化处理的详细统计数据
 */
export function AutomationStatsPanel(props: AutomationStatsPanelProps) {
  const { project } = props

  const stats = calculateAutomationStats(project.reviewItems)

  return (
    <Card>
      <CardHeader>
        <CardTitle>自动化处理统计</CardTitle>
        <CardDescription>
          展示本次评估的自动化处理效果
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 自动化率 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BotIcon className="size-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold">自动化处理率</span>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(stats.automationRate * 100)}%
            </span>
          </div>
          <Progress
            className="h-3"
            indicatorClassName="bg-blue-600"
            value={stats.automationRate * 100}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>自动处理：{stats.autoProcessedCount} 项</span>
            <span>人工介入：{stats.manualReviewCount} 项</span>
          </div>
        </div>

        {/* 时间节省 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="size-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold">时间节省</span>
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(stats.timeSavedPercentage * 100)}%
            </span>
          </div>
          <Progress
            className="h-3"
            indicatorClassName="bg-green-600"
            value={stats.timeSavedPercentage * 100}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>传统方式：{stats.traditionalTimeEstimate} 小时</span>
            <span>自动化方式：{stats.automatedTimeActual} 小时</span>
          </div>
        </div>

        {/* 效率提升 */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <TrendingUpIcon className="size-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">效率提升</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round((stats.traditionalTimeEstimate / stats.automatedTimeActual - 1) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* 详细统计 */}
        <div className="space-y-2 rounded-lg border p-4">
          <h4 className="font-semibold">详细统计</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">总审核项数</span>
              <span className="font-medium">{stats.totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">自动通过</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {stats.autoProcessedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">需人工复核</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {stats.manualReviewCount}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-muted-foreground">节省时间</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {stats.traditionalTimeEstimate - stats.automatedTimeActual} 小时
              </span>
            </div>
          </div>
        </div>

        {/* 对比图表（简化版） */}
        <div className="space-y-2">
          <h4 className="font-semibold">处理方式对比</h4>
          <div className="space-y-3">
            {/* 传统方式 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">传统人工方式</span>
                <span className="font-medium">{stats.traditionalTimeEstimate}h</span>
              </div>
              <div className="h-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>

            {/* 自动化方式 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">自动化方式</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {stats.automatedTimeActual}h
                </span>
              </div>
              <div
                className="h-8 rounded-lg bg-green-500"
                style={{
                  width: `${(stats.automatedTimeActual / stats.traditionalTimeEstimate) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
