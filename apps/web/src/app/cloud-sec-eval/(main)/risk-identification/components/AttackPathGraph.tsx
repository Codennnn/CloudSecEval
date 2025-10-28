import { useMemo } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

import { MermaidWrapper } from '~/components/doc/MermaidWrapper'

import type { RiskItem } from '../lib/types'
import { generateAttackPathMermaid } from '../lib/utils'

interface AttackPathGraphProps {
  risks: RiskItem[]
}

/**
 * 攻击路径可视化图谱组件
 * 使用 Mermaid 展示风险的攻击路径和关联关系
 */
export function AttackPathGraph(props: AttackPathGraphProps) {
  const { risks } = props

  // 生成 Mermaid 图谱代码
  const mermaidCode = useMemo(() => {
    return generateAttackPathMermaid(risks)
  }, [risks])

  // 统计有攻击路径的风险数量
  const risksWithPath = risks.filter(risk => risk.attackPath && risk.attackPath.length > 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>攻击路径可视化</CardTitle>
        <CardDescription>
          展示高风险项的攻击路径和关联关系（共
          {' '}
          {risksWithPath.length}
          {' '}
          个风险包含攻击路径）
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {/* 图谱展示 */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <MermaidWrapper chart={mermaidCode} />
        </div>

        {/* 说明文字 */}
        <div className="mt-4 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>图谱说明：</strong>
            {' '}
            节点代表攻击路径中的各个环节，箭头表示攻击方向。
            红色节点表示高风险终点，橙色表示中风险，绿色表示低风险。
            支持缩放和拖拽查看详情。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

