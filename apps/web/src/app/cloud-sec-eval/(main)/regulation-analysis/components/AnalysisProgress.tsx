'use client'

import { CheckCircle2Icon, Loader2Icon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/utils'

import { analysisSteps, getStepIndex } from '../lib/analysis-simulator'
import type { AnalysisStep } from '../types/regulation'

interface AnalysisProgressProps {
  /** 当前步骤 */
  currentStep: AnalysisStep
}

/**
 * 解析进度组件
 * 展示4步骤解析动画
 */
export function AnalysisProgress(props: AnalysisProgressProps) {
  const { currentStep } = props

  const currentStepIndex = getStepIndex(currentStep)

  return (
    <Card>
      <CardHeader>
        <CardTitle>解析进度</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {analysisSteps.map((step, index) => {
            const isActive = index === currentStepIndex
            const isCompleted = index < currentStepIndex
            const isPending = index > currentStepIndex

            return (
              <div
                key={step.step}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 transition-all',
                  {
                    'border-primary bg-primary/5': isActive,
                    'border-green-500 bg-green-500/5': isCompleted,
                    'border-border bg-muted/30': isPending,
                  },
                )}
              >
                {/* 图标 */}
                <div className="flex-shrink-0 pt-0.5">
                  {isCompleted && (
                    <CheckCircle2Icon className="size-5 text-green-500" />
                  )}
                  {isActive && (
                    <Loader2Icon className="size-5 animate-spin text-primary" />
                  )}
                  {isPending && (
                    <div className="size-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>

                {/* 内容 */}
                <div className="flex-1 space-y-1">
                  <div
                    className={cn('font-medium', {
                      'text-primary': isActive,
                      'text-green-600 dark:text-green-400': isCompleted,
                      'text-muted-foreground': isPending,
                    })}
                  >
                    {step.title}
                  </div>
                  <div
                    className={cn('text-sm', {
                      'text-primary/80': isActive,
                      'text-green-600/80 dark:text-green-400/80': isCompleted,
                      'text-muted-foreground/60': isPending,
                    })}
                  >
                    {step.description}
                  </div>
                </div>

                {/* 步骤编号 */}
                <div
                  className={cn(
                    'flex size-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium',
                    {
                      'bg-primary text-primary-foreground': isActive,
                      'bg-green-500 text-white': isCompleted,
                      'bg-muted text-muted-foreground': isPending,
                    },
                  )}
                >
                  {index + 1}
                </div>
              </div>
            )
          })}
        </div>

        {/* 进度条 */}
        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / analysisSteps.length) * 100}%`,
              }}
            />
          </div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {currentStep === 'completed'
              ? '解析完成'
              : `进度: ${currentStepIndex + 1}/${analysisSteps.length}`}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

