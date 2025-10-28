'use client'

import { useParams, useRouter } from 'next/navigation'

import { ArrowLeftIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

import { AutomationStatsPanel } from '../components/AutomationStatsPanel'
import { ProcessFlow } from '../components/ProcessFlow'
import { StageDetailPanel } from '../components/StageDetailPanel'
import {
  assessmentTypeNames,
  getProjectById,
  mockAssessmentProjects,
  projectStatusNames,
} from '../lib/mock-data'
import { formatDateTime } from '../lib/process-simulator'

/**
 * 评估项目详情页
 * 展示项目的流程进度、当前阶段操作和自动化统计
 */
export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  // 获取项目数据
  // 注意：这里为了演示，使用 mock 数据
  // 实际应用中应该根据 projectId 从后端获取数据
  let project = getProjectById(projectId)

  // 如果找不到项目，使用第一个项目作为演示
  if (!project) {
    project = mockAssessmentProjects[0]
  }

  /**
   * 返回列表页
   */
  const handleBack = () => {
    router.push('/cloud-sec-eval/compliance-assessment')
  }

  /**
   * 刷新项目数据
   */
  const handleRefresh = () => {
    // 实际应用中应该重新获取项目数据
    console.log('刷新项目数据')
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleBack}
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          返回列表
        </Button>
      </div>

      {/* 项目基本信息 */}
      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <Badge variant="outline">
                {assessmentTypeNames[project.type]}
              </Badge>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* 项目元信息 */}
        <div className="grid gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">创建时间</p>
            <p className="font-medium">{formatDateTime(project.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">更新时间</p>
            <p className="font-medium">{formatDateTime(project.updatedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">创建人</p>
            <p className="font-medium">{project.creator || '未知'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">自动化率</p>
            <p className="font-medium text-blue-600 dark:text-blue-400">
              {Math.round(project.automationRate * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 左侧：流程进度图 */}
        <ProcessFlow currentStage={project.currentStage} />

        {/* 右侧：阶段详情面板 */}
        <StageDetailPanel
          project={project}
          onRefresh={handleRefresh}
        />
      </div>

      {/* 自动化统计面板 */}
      <AutomationStatsPanel project={project} />
    </div>
  )
}

/**
 * 状态徽章组件
 */
function StatusBadge(props: { status: typeof mockAssessmentProjects[0]['status'] }) {
  const { status } = props

  const variants: Record<typeof status, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'outline',
    'in-progress': 'default',
    'pending-review': 'secondary',
    completed: 'default',
    archived: 'outline',
  }

  const colors: Record<typeof status, string> = {
    draft: 'text-gray-600',
    'in-progress': 'text-blue-600',
    'pending-review': 'text-orange-600',
    completed: 'text-green-600',
    archived: 'text-gray-500',
  }

  return (
    <Badge className={colors[status]} variant={variants[status]}>
      {projectStatusNames[status]}
    </Badge>
  )
}

