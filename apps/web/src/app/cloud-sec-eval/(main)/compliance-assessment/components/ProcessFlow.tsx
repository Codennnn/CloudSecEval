'use client'

import { CheckIcon, ClockIcon, FileTextIcon, FileUpIcon, SearchIcon, UserCheckIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/utils'

import { processStageConfigs } from '../lib/process-simulator'
import type { ProcessStage } from '../types/assessment'

interface ProcessFlowProps {
  /** 当前流程阶段 */
  currentStage: ProcessStage
}

/**
 * 流程进度图组件
 * 展示评估流程的4个阶段及其进度
 */
export function ProcessFlow(props: ProcessFlowProps) {
  const { currentStage } = props

  const stages = processStageConfigs.filter((config) => config.stage !== 'completed')

  return (
    <Card>
      <CardHeader>
        <CardTitle>评估流程</CardTitle>
        <CardDescription>
          当前进度：{processStageConfigs.find((c) => c.stage === currentStage)?.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stageConfig, index) => {
            const isActive = stageConfig.stage === currentStage
            const isCompleted = getStageIndex(stageConfig.stage) < getStageIndex(currentStage)
            const isLast = index === stages.length - 1

            return (
              <div key={stageConfig.stage} className="relative">
                {/* 连接线 */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-5 top-12 h-full w-0.5',
                      isCompleted ? 'bg-green-500' : 'bg-border',
                    )}
                  />
                )}

                {/* 阶段卡片 */}
                <div
                  className={cn(
                    'flex items-start gap-4 rounded-lg border p-4 transition-all',
                    isActive && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
                    isCompleted && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                  )}
                >
                  {/* 图标 */}
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full border-2',
                      isActive && 'border-blue-500 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                      isCompleted && 'border-green-500 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                      !isActive && !isCompleted && 'border-border bg-muted text-muted-foreground',
                    )}
                  >
                    {isCompleted
                      ? (
                          <CheckIcon className="size-5" />
                        )
                      : (
                          <StageIcon stage={stageConfig.stage} />
                        )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {stageConfig.title}
                      </h4>
                      {isActive && (
                        <span className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                          <ClockIcon className="size-4" />
                          进行中
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-sm text-green-600 dark:text-green-400">
                          已完成
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stageConfig.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>自动化率：</span>
                      <span className="font-medium">
                        {Math.round(stageConfig.automationRate * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 根据阶段返回对应的图标
 */
function StageIcon(props: { stage: ProcessStage }) {
  const { stage } = props

  const icons: Record<ProcessStage, React.ReactNode> = {
    'material-upload': <FileUpIcon className="size-5" />,
    'auto-review': <SearchIcon className="size-5" />,
    'manual-review': <UserCheckIcon className="size-5" />,
    'report-generation': <FileTextIcon className="size-5" />,
    completed: <CheckIcon className="size-5" />,
  }

  return icons[stage] || null
}

/**
 * 获取阶段索引
 */
function getStageIndex(stage: ProcessStage): number {
  const stages: ProcessStage[] = [
    'material-upload',
    'auto-review',
    'manual-review',
    'report-generation',
    'completed',
  ]

  return stages.indexOf(stage)
}
