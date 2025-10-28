'use client'

import { useState } from 'react'

import type { Metadata } from 'next'

import { KeyMetricsCards } from './components/KeyMetricsCards'
import { ProjectTable } from './components/ProjectTable'
import { QuickActions } from './components/QuickActions'
import { keyMetrics, mockAssessmentProjects } from './lib/mock-data'

import { CloudSecEvalRoutes, generatePageTitle } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

/**
 * 合规自动评估页面（主列表页）
 * 展示关键指标、快速启动区和项目列表
 */
export default function ComplianceAssessmentPage() {
  const [projects, setProjects] = useState(mockAssessmentProjects)

  /**
   * 处理项目创建成功
   */
  const handleProjectCreated = () => {
    // 刷新项目列表（实际应用中应该重新获取数据）
    // 这里为了演示，我们只是触发一个状态更新
    console.log('项目创建成功')
  }

  /**
   * 处理删除项目
   */
  const handleDeleteProject = (projectId: string) => {
    setProjects((prevProjects) =>
      prevProjects.filter((p) => p.id !== projectId),
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 页面标题 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">合规自动评估</h1>
        <p className="text-muted-foreground">
          526项人工操作流程化、数字化，实现材料上传、审核、进度跟踪、报告生成的全链路自动处理
        </p>
      </div>

      {/* 关键指标卡片 */}
      <KeyMetricsCards metrics={keyMetrics} />

      {/* 快速启动区 */}
      <QuickActions onProjectCreated={handleProjectCreated} />

      {/* 项目列表 */}
      <ProjectTable
        projects={projects}
        onDelete={handleDeleteProject}
      />
    </div>
  )
}
