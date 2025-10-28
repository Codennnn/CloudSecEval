'use client'

import { useState } from 'react'

import { AttackPathGraph } from './components/AttackPathGraph'
import { RiskDistributionChart } from './components/charts/RiskDistributionChart'
import { RiskTrendChart } from './components/charts/RiskTrendChart'
import { RiskDetailSheet } from './components/RiskDetailSheet'
import { RiskStatsCards } from './components/RiskStatsCards'
import { RiskTable } from './components/RiskTable'
import { allMockRisks, mockRiskStats } from './lib/mock-data'
import type { RiskItem } from './lib/types'

/**
 * 风险智能识别页面
 * 用户查看风险列表，系统智能识别潜在威胁
 */
export default function RiskIdentificationPage() {
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  /**
   * 处理行点击事件
   */
  const handleRowClick = (risk: RiskItem) => {
    setSelectedRisk(risk)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 统计卡片 */}
      <RiskStatsCards stats={mockRiskStats} />

      {/* 图表区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RiskDistributionChart data={mockRiskStats} />
        <RiskTrendChart data={mockRiskStats.trend} />
      </div>

      {/* 攻击路径图谱 */}
      <AttackPathGraph risks={allMockRisks} />

      {/* 风险列表表格 */}
      <RiskTable
        data={allMockRisks}
        onRowClick={handleRowClick}
      />

      {/* 风险详情侧栏 */}
      <RiskDetailSheet
        open={detailOpen}
        risk={selectedRisk}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
