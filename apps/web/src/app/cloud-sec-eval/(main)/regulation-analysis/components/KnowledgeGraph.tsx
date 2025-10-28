'use client'

import { useMemo } from 'react'

import { MermaidWrapper } from '~/components/doc/MermaidWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

import { generateSimplifiedKnowledgeGraph } from '../lib/graph-generator'
import type { AnalysisResult } from '../types/regulation'

interface KnowledgeGraphProps {
  /** 解析结果 */
  result: AnalysisResult | null
}

/**
 * 知识图谱组件
 * 基于 MermaidDiagram 展示四层关系网络
 */
export function KnowledgeGraph(props: KnowledgeGraphProps) {
  const { result } = props

  // 生成 Mermaid 图谱代码
  const mermaidCode = useMemo(() => {
    if (!result) {
      return `graph TD
        A[请先选择法规模板或输入法规条文]
        style A fill:#f0f0f0,stroke:#999,stroke-width:2px`
    }

    return generateSimplifiedKnowledgeGraph(result, 3)
  }, [result])

  // 统计信息
  const stats = useMemo(() => {
    if (!result) {
      return null
    }

    return {
      clauses: result.clauses.length,
      assessmentItems: result.assessmentItems.length,
      riskPoints: result.riskPoints.length,
      remediationMeasures: result.remediationMeasures.length,
    }
  }, [result])

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>知识图谱</CardTitle>
        <CardDescription>
          展示"法规条款 → 评估项 → 风险点 → 整改措施"的四层关系网络
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* 统计信息 */}
        {stats && (
          <div className="mb-4 grid grid-cols-4 gap-4">
            <div className="rounded-lg border bg-blue-50 p-3 dark:bg-blue-950/20">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.clauses}
              </div>
              <div className="text-xs text-blue-600/80 dark:text-blue-400/80">
                法规条款
              </div>
            </div>
            <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950/20">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.assessmentItems}
              </div>
              <div className="text-xs text-green-600/80 dark:text-green-400/80">
                评估项
              </div>
            </div>
            <div className="rounded-lg border bg-orange-50 p-3 dark:bg-orange-950/20">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.riskPoints}
              </div>
              <div className="text-xs text-orange-600/80 dark:text-orange-400/80">
                风险点
              </div>
            </div>
            <div className="rounded-lg border bg-purple-50 p-3 dark:bg-purple-950/20">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.remediationMeasures}
              </div>
              <div className="text-xs text-purple-600/80 dark:text-purple-400/80">
                整改措施
              </div>
            </div>
          </div>
        )}

        {/* 图谱展示 */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <MermaidWrapper chart={mermaidCode} />
        </div>

        {/* 图例 */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm bg-blue-500" />
            <span className="text-muted-foreground">法规条款</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm bg-green-500" />
            <span className="text-muted-foreground">评估项</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm bg-orange-500" />
            <span className="text-muted-foreground">风险点</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm bg-purple-500" />
            <span className="text-muted-foreground">整改措施</span>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/20 dark:text-blue-200">
          💡 提示：图谱支持拖拽和缩放操作，点击节点可查看详细信息
        </div>
      </CardContent>
    </Card>
  )
}
