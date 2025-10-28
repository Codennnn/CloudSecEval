'use client'

import { useState } from 'react'

import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'

import { CreateReportDialog } from './components/CreateReportDialog'
import { GenerationProgress } from './components/GenerationProgress'
import { ReportList } from './components/ReportList'
import { mockReports, type Report, type ReportType } from './lib/mock-reports'
import { getReportContent } from './lib/report-content'

/**
 * 报告自动生成页面
 * 展示报告列表、生成进度、创建入口
 */
export default function ReportGenerationPage() {
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generatingReport, setGeneratingReport] = useState<Report | null>(null)

  /**
   * 处理创建报告
   */
  const handleCreateReport = (config: {
    title: string
    type: ReportType
    projectName: string
  }) => {
    const newReport: Report = {
      id: `report-${Date.now()}`,
      title: config.title,
      type: config.type,
      status: 'generating',
      projectName: config.projectName,
      createdAt: Date.now(),
      progress: 0,
    }

    setReports([newReport, ...reports])
    setGeneratingReport(newReport)
    setDialogOpen(false)

    toast.success('开始生成报告...')

    // 模拟生成进度
    simulateGeneration(newReport.id, config.type)
  }

  /**
   * 模拟报告生成（核心演示逻辑）
   */
  const simulateGeneration = (reportId: string, type: ReportType) => {
    let progress = 0
    const interval = setInterval(() => {
      // 每次增加 5-20% 的进度
      progress += Math.random() * 15 + 5

      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        // 生成完成，更新状态
        setTimeout(() => {
          setReports((prev) =>
            prev.map((r) => {
              return r.id === reportId
                ? {
                    ...r,
                    status: 'completed',
                    progress: 100,
                    completedAt: Date.now(),
                    content: getReportContent(type),
                  }
                : r
            }),
          )
          setGeneratingReport(null)
          toast.success('报告生成完成！')
        }, 500)
      }

      // 更新进度
      setReports((prev) =>
        prev.map((r) => {
          return r.id === reportId ? { ...r, progress } : r
        }),
      )
    }, 800) // 每 800ms 更新一次
  }

  /**
   * 处理删除报告
   */
  const handleDeleteReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId))
    toast.success('报告已删除')
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">报告自动生成</h1>
          <p className="text-muted-foreground">
            AI 自动生成合规报告、风险分析报告、整改计划报告
          </p>
        </div>

        <Button onClick={() => { setDialogOpen(true) }}>
          <PlusIcon className="mr-2 size-4" />
          生成报告
        </Button>
      </div>

      {/* 生成进度（如果有正在生成的报告） */}
      {generatingReport && <GenerationProgress report={generatingReport} />}

      {/* 报告列表 */}
      <ReportList reports={reports} onDelete={handleDeleteReport} />

      {/* 创建报告对话框 */}
      <CreateReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateReport}
      />
    </div>
  )
}
