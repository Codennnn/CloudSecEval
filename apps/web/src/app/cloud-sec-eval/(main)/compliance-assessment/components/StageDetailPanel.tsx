'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

import type { AssessmentProject, ProcessStage } from '../types/assessment'

import { AutoReviewStage } from './stages/AutoReviewStage'
import { ManualReviewStage } from './stages/ManualReviewStage'
import { MaterialUploadStage } from './stages/MaterialUploadStage'
import { ReportGenerationStage } from './stages/ReportGenerationStage'

interface StageDetailPanelProps {
  /** 评估项目 */
  project: AssessmentProject
  /** 刷新项目数据的回调 */
  onRefresh?: () => void
}

/**
 * 阶段详情面板组件
 * 根据当前阶段展示不同的操作界面
 */
export function StageDetailPanel(props: StageDetailPanelProps) {
  const { project, onRefresh } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>当前阶段操作</CardTitle>
        <CardDescription>
          {getStageDescription(project.currentStage)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStageContent(project, onRefresh)}
      </CardContent>
    </Card>
  )
}

/**
 * 根据阶段渲染对应的内容
 */
function renderStageContent(
  project: AssessmentProject,
  onRefresh?: () => void,
): React.ReactNode {
  switch (project.currentStage) {
    case 'material-upload':
      return <MaterialUploadStage project={project} onRefresh={onRefresh} />

    case 'auto-review':
      return <AutoReviewStage project={project} onRefresh={onRefresh} />

    case 'manual-review':
      return <ManualReviewStage project={project} onRefresh={onRefresh} />

    case 'report-generation':
      return <ReportGenerationStage project={project} onRefresh={onRefresh} />

    case 'completed':
      return (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <svg
              className="size-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold">评估已完成</h3>
          <p className="text-sm text-muted-foreground">
            所有流程已完成，报告已生成
          </p>
        </div>
      )

    default:
      return (
        <div className="py-8 text-center text-muted-foreground">
          未知阶段
        </div>
      )
  }
}

/**
 * 获取阶段描述
 */
function getStageDescription(stage: ProcessStage): string {
  const descriptions: Record<ProcessStage, string> = {
    'material-upload': '上传评估所需的文档材料，系统将自动校验文件格式和完整性',
    'auto-review': 'AI智能审核评估项，自动识别合规性问题',
    'manual-review': '人工复核需要关注的项目，确保评估准确性',
    'report-generation': '自动生成评估报告，包含详细的合规性分析',
    completed: '评估流程已完成',
  }

  return descriptions[stage] || ''
}
