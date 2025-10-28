'use client'

import { useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { ArrowLeftIcon, DownloadIcon, EditIcon, SaveIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

import { ReportPreview } from '../components/ReportPreview'
import { ReportTOC } from '../components/ReportTOC'
import { getReportContent, reportTOC } from '../lib/report-content'
import { formatDateTime, mockReports } from '../lib/mock-reports'

/**
 * 报告详情页
 * 展示报告内容、支持编辑和导出
 */
export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.reportId as string

  // 获取报告数据（实际应该从 API 获取，这里使用 Mock 数据）
  const report = mockReports.find((r) => r.id === reportId) ?? mockReports[0]

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(getReportContent(report.type))
  const [activeSection, setActiveSection] = useState<string>()

  /**
   * 返回列表页
   */
  const handleBack = () => {
    router.push('/cloud-sec-eval/report-generation')
  }

  /**
   * 保存编辑
   */
  const handleSave = () => {
    setIsEditing(false)
    toast.success('报告已保存')
  }

  /**
   * 导出报告
   */
  const handleExport = () => {
    toast.success('报告导出成功！（演示模式）', {
      description: '实际应用中会生成 PDF 或 Word 文件',
    })
  }

  // 获取当前报告类型的目录
  const tocItems = reportTOC[report.type] ?? []

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <Button size="sm" variant="ghost" onClick={handleBack}>
          <ArrowLeftIcon className="mr-2 size-4" />
          返回列表
        </Button>

        <div className="flex items-center gap-2">
          {isEditing
            ? (
                <Button size="sm" onClick={handleSave}>
                  <SaveIcon className="mr-2 size-4" />
                  保存
                </Button>
              )
            : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(true)
                    }}
                  >
                    <EditIcon className="mr-2 size-4" />
                    编辑
                  </Button>
                  <Button size="sm" onClick={handleExport}>
                    <DownloadIcon className="mr-2 size-4" />
                    导出
                  </Button>
                </>
              )}
        </div>
      </div>

      {/* 报告标题 */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <Badge>已完成</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          项目：{report.projectName} · 生成时间：
          {formatDateTime(report.createdAt)}
        </p>
      </div>

      {/* 双栏布局 */}
      <div className="grid flex-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* 左侧目录 */}
        <ReportTOC
          activeId={activeSection}
          items={tocItems}
          onItemClick={setActiveSection}
        />

        {/* 右侧内容 */}
        <div className="overflow-auto rounded-lg border bg-card">
          <ReportPreview
            content={content}
            isEditing={isEditing}
            onContentChange={setContent}
          />
        </div>
      </div>
    </div>
  )
}

