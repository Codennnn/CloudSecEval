'use client'

import { Loader2Icon, SparklesIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'

import type { Report } from '../lib/mock-reports'

interface GenerationProgressProps {
  /** 正在生成的报告 */
  report: Report
}

/**
 * 生成阶段配置
 */
const stages = [
  { threshold: 0, label: '准备中...', description: '初始化生成环境' },
  { threshold: 15, label: '解析法规条款...', description: '使用 BERT 模型解析法规语义' },
  { threshold: 35, label: 'AI 生成报告内容...', description: '基于 LLM 生成报告框架' },
  { threshold: 60, label: '智能复核与优化...', description: 'Expert Agent 进行内容复核' },
  { threshold: 80, label: '生成图表与统计...', description: '生成可视化图表' },
  { threshold: 95, label: '最终检查...', description: '验证报告完整性' },
  { threshold: 100, label: '完成！', description: '报告生成成功' },
]

/**
 * 报告生成进度组件
 * 显示实时生成进度和当前阶段
 */
export function GenerationProgress(props: GenerationProgressProps) {
  const { report } = props
  const progress = report.progress ?? 0

  // 根据进度确定当前阶段
  const currentStage = stages
    .slice()
    .reverse()
    .find((s) => progress >= s.threshold) ?? stages[0]

  // 计算预计剩余时间（简单估算）
  const estimatedTimeRemaining = Math.max(0, Math.ceil((100 - progress) / 10))

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Loader2Icon className="size-5 animate-spin text-primary" />
          <span>正在生成：{report.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 当前阶段信息 */}
        <div className="flex items-start gap-3 rounded-lg bg-card/50 p-4">
          <SparklesIcon className="mt-0.5 size-5 flex-shrink-0 text-primary" />
          <div className="flex-1 space-y-1">
            <div className="font-medium">{currentStage.label}</div>
            <div className="text-sm text-muted-foreground">
              {currentStage.description}
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">生成进度</span>
            <span className="font-medium tabular-nums">{Math.round(progress)}%</span>
          </div>
          <Progress className="h-2" value={progress} />
        </div>

        {/* 预计剩余时间 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>预计剩余时间：{estimatedTimeRemaining} 秒</span>
          <span>AI 智能生成中...</span>
        </div>

        {/* 阶段指示器 */}
        <div className="flex items-center gap-2">
          {stages.slice(0, -1).map((stage, index) => {
            const isCompleted = progress >= stage.threshold
            const isActive = currentStage.threshold === stage.threshold

            return (
              <div
                key={index}
                className={[
                  'h-1.5 flex-1 rounded-full transition-all',
                  isCompleted
                    ? 'bg-primary'
                    : isActive
                      ? 'bg-primary/50'
                      : 'bg-muted',
                ].join(' ')}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
