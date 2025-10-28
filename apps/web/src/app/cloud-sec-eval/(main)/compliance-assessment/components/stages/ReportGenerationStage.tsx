'use client'

import { useState } from 'react'

import { DownloadIcon, FileTextIcon, Loader2Icon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'

import { simulateReportGeneration } from '../../lib/process-simulator'
import type { AssessmentProject, ReportGenerationProgress } from '../../types/assessment'

interface ReportGenerationStageProps {
  /** 评估项目 */
  project: AssessmentProject
  /** 刷新回调 */
  onRefresh?: () => void
}

/**
 * 报告生成阶段组件
 */
export function ReportGenerationStage(props: ReportGenerationStageProps) {
  const { project } = props

  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<ReportGenerationProgress | null>(null)
  const [reportUrl, setReportUrl] = useState<string | null>(null)

  /**
   * 处理开始生成报告
   */
  const handleStartGeneration = async () => {
    setIsGenerating(true)
    setProgress(null)
    setReportUrl(null)

    const url = await simulateReportGeneration((progressData) => {
      setProgress(progressData)
    })

    setReportUrl(url)
    setIsGenerating(false)
  }

  /**
   * 处理下载报告
   */
  const handleDownload = () => {
    if (reportUrl) {
      // 模拟下载
      console.log('下载报告:', reportUrl)
      alert('报告下载功能为演示模式，实际应用中会触发文件下载')
    }
  }

  const isCompleted = progress?.isCompleted && reportUrl

  return (
    <div className="space-y-6">
      {/* 生成进度 */}
      {isGenerating && progress && (
        <div className="space-y-4 rounded-lg border bg-blue-50 p-6 dark:bg-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Loader2Icon className="size-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                正在生成评估报告...
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {progress.currentStep}
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-900 dark:text-blue-100">
                生成进度
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {Math.round(progress.progress)}%
              </span>
            </div>
            <Progress
              className="h-3"
              indicatorClassName="bg-blue-600"
              value={progress.progress}
            />
          </div>

          {/* 预计剩余时间 */}
          {progress.estimatedTimeRemaining > 0 && (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              预计剩余时间：{progress.estimatedTimeRemaining} 秒
            </p>
          )}
        </div>
      )}

      {/* 报告生成完成 */}
      {isCompleted && (
        <div className="space-y-4 rounded-lg border bg-green-50 p-6 dark:bg-green-950/20">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <FileTextIcon className="size-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 dark:text-green-100">
                报告生成完成
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                评估报告已生成，可以下载查看
              </p>
            </div>
          </div>

          {/* 报告信息 */}
          <div className="rounded-lg bg-white p-4 dark:bg-black/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">报告名称</span>
                <span className="font-medium">{project.name} - 评估报告.pdf</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">生成时间</span>
                <span className="font-medium">
                  {new Date().toLocaleString('zh-CN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">文件大小</span>
                <span className="font-medium">2.3 MB</span>
              </div>
            </div>
          </div>

          {/* 下载按钮 */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleDownload}
          >
            <DownloadIcon className="mr-2 size-5" />
            下载评估报告
          </Button>
        </div>
      )}

      {/* 开始生成按钮 */}
      {!isGenerating && !isCompleted && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-6 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <FileTextIcon className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold">准备生成评估报告</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              系统将自动收集评估数据，生成完整的合规评估报告
            </p>

            {/* 报告内容预览 */}
            <div className="mx-auto mb-4 max-w-md space-y-2 text-left text-sm">
              <p className="font-medium">报告将包含以下内容：</p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li>评估项目概述</li>
                <li>审核结果统计</li>
                <li>合规性分析</li>
                <li>风险点识别</li>
                <li>整改建议</li>
                <li>附录：详细审核清单</li>
              </ul>
            </div>

            <Button size="lg" onClick={handleStartGeneration}>
              <FileTextIcon className="mr-2 size-5" />
              开始生成报告
            </Button>
          </div>

          {/* 提示信息 */}
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p className="font-medium">提示：</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>报告生成通常需要 3-5 秒</li>
              <li>生成的报告支持 PDF 格式下载</li>
              <li>报告内容基于当前审核结果自动生成</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
