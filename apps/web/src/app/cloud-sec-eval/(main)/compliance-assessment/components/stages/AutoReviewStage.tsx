'use client'

import { useEffect, useState } from 'react'

import { BotIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { ScrollArea } from '~/components/ui/scroll-area'

import { simulateAutoReview } from '../../lib/process-simulator'
import type { AssessmentProject, ReviewItem } from '../../types/assessment'

interface AutoReviewStageProps {
  /** 评估项目 */
  project: AssessmentProject
  /** 刷新回调 */
  onRefresh?: () => void
}

/**
 * 自动审核阶段组件
 * 重点展示自动化审核的快速完成效果
 */
export function AutoReviewStage(props: AutoReviewStageProps) {
  const { project } = props

  const [isReviewing, setIsReviewing] = useState(false)
  const [currentCount, setCurrentCount] = useState(0)
  const [currentItem, setCurrentItem] = useState<ReviewItem | null>(null)

  const totalCount = project.reviewItems.length
  const progress = totalCount > 0 ? (currentCount / totalCount) * 100 : 0

  // 统计数据
  const autoPassedCount = project.reviewItems.filter(
    item => item.status === 'auto-passed',
  ).length
  const manualReviewCount = project.reviewItems.filter(
    item => item.status === 'manual-review' || item.requiresManualReview,
  ).length

  /**
   * 处理开始审核
   */
  const handleStartReview = async () => {
    setIsReviewing(true)
    setCurrentCount(0)

    await simulateAutoReview(
      project.reviewItems,
      (current, total, item) => {
        setCurrentCount(current)
        setCurrentItem(item)
      },
    )

    setIsReviewing(false)
  }

  /**
   * 处理进入下一阶段
   */
  const handleNextStage = () => {
    console.log('进入人工复核阶段')
  }

  const isCompleted = currentCount === totalCount && !isReviewing

  return (
    <div className="space-y-6">
      {/* 审核进度 */}
      {isReviewing && (
        <div className="space-y-4 rounded-lg border bg-blue-50 p-6 dark:bg-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <BotIcon className="size-6 animate-pulse text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                AI 智能审核中...
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                正在分析评估项，请稍候
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {currentCount} / {totalCount} 项
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress
              className="h-3"
              indicatorClassName="bg-blue-600"
              value={progress}
            />
          </div>

          {/* 当前处理项 */}
          {currentItem && (
            <div className="rounded-lg bg-white/50 p-3 text-sm dark:bg-black/20">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                正在审核：{currentItem.name}
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                {currentItem.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 审核结果统计 */}
      {isCompleted && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 自动通过 */}
          <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="size-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">自动通过</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {autoPassedCount}
                </p>
              </div>
            </div>
          </div>

          {/* 需人工复核 */}
          <div className="rounded-lg border bg-orange-50 p-4 dark:bg-orange-950/20">
            <div className="flex items-center gap-3">
              <ClockIcon className="size-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-muted-foreground">需人工复核</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {manualReviewCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 审核项列表（仅显示部分） */}
      {isCompleted && (
        <div className="space-y-2">
          <h4 className="font-semibold">审核结果详情（显示前20项）</h4>
          <ScrollArea className="h-[300px] rounded-lg border">
            <div className="space-y-2 p-4">
              {project.reviewItems.slice(0, 20).map(item => (
                <ReviewItemCard key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>
          <p className="text-sm text-muted-foreground">
            共 {totalCount} 项，已全部审核完成
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
        {!isReviewing && !isCompleted && (
          <>
            <div className="space-y-1">
              <p className="font-medium">准备开始自动审核</p>
              <p className="text-sm text-muted-foreground">
                共 {totalCount} 项审核要求
              </p>
            </div>
            <Button size="lg" onClick={handleStartReview}>
              <BotIcon className="mr-2 size-5" />
              开始自动审核
            </Button>
          </>
        )}

        {isCompleted && (
          <>
            <div className="space-y-1">
              <p className="font-medium">✓ 自动审核已完成</p>
              <p className="text-sm text-muted-foreground">
                自动化率：{Math.round((autoPassedCount / totalCount) * 100)}%
              </p>
            </div>
            <Button size="lg" onClick={handleNextStage}>
              进入人工复核
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * 审核项卡片组件
 */
function ReviewItemCard(props: { item: ReviewItem }) {
  const { item } = props

  const statusConfig = {
    'auto-passed': {
      icon: <CheckCircleIcon className="size-4 text-green-600" />,
      label: '自动通过',
      color: 'text-green-600',
    },
    'manual-review': {
      icon: <ClockIcon className="size-4 text-orange-600" />,
      label: '需人工复核',
      color: 'text-orange-600',
    },
    'auto-failed': {
      icon: <XCircleIcon className="size-4 text-red-600" />,
      label: '自动拒绝',
      color: 'text-red-600',
    },
  }

  const config = statusConfig[item.status as keyof typeof statusConfig]

  if (!config) {
    return null
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 text-sm">
      <div className="mt-0.5">{config.icon}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.code}</span>
          <span className={`text-xs ${config.color}`}>{config.label}</span>
        </div>
        <p className="text-muted-foreground">{item.name}</p>
      </div>
    </div>
  )
}

