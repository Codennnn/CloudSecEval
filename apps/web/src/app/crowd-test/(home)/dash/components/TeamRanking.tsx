'use client'

import { useMemo } from 'react'

import { workloadData } from '~/app/crowd-test/(admin)/dashboard/lib/mockData'
import { cn } from '~/lib/utils'

import { DashDecoratorImg } from './DashDecoratorImg'

interface TeamRankingItem {
  team: string
  score: number
  reports?: number
  vulns?: number
  accent?: string // 自定义队伍主题色，可选
}

interface TeamRankingProps {
  data?: TeamRankingItem[]
  maxItems?: number
  className?: string
}

export function TeamRanking(props: TeamRankingProps) {
  const { data, maxItems = 5, className } = props

  // 从 workloadData 生成排行数据
  const generatedData = useMemo<TeamRankingItem[]>(() => {
    return workloadData.map((d) => {
      // 基于提交数和通过数计算综合评分
      const reportsScore = d.reports * 2 // 提交数权重
      const vulnsScore = d.vulns * 3 // 通过数权重更高
      const score = Math.min(100, reportsScore + vulnsScore) // 限制最高100分

      return {
        team: d.team,
        score,
        reports: d.reports,
        vulns: d.vulns,
      }
    })
  }, [])

  const finalData = data ?? generatedData

  // 按通过率排序：优先按通过率，然后按通过数，最后按提交数
  const sorted = [...finalData]
    .sort((a, b) => {
      // 计算通过率
      const reportsA = a.reports ?? 0
      const vulnsA = a.vulns ?? 0
      const reportsB = b.reports ?? 0
      const vulnsB = b.vulns ?? 0

      const rateA = reportsA > 0 ? vulnsA / reportsA : 0
      const rateB = reportsB > 0 ? vulnsB / reportsB : 0

      // 首先按通过率降序
      if (rateB !== rateA) {
        return rateB - rateA
      }

      // 通过率相同时，按通过数降序
      if (vulnsB !== vulnsA) {
        return vulnsB - vulnsA
      }

      // 通过数也相同时，按提交数降序
      return reportsB - reportsA
    })
    .slice(0, maxItems)

  return (
    <div className={cn('space-y-4', className)}>
      {sorted.map((team) => {
        return (
          <div
            key={team.team}
          >
            <div className="relative">
              <div className="font-bold">
                {team.team}
              </div>

              <DashDecoratorImg
                className="absolute left-0 top-0"
                src="/assets/crowd-test/dash-title-bg.png"
              />
            </div>

            <div className="grid grid-cols-3 gap-1 text-sm py-1.5 whitespace-nowrap">
              <div>
                已提交：
                <span className="font-bold tabular-nums text-theme2">{team.reports}</span>
              </div>
              <div>
                已通过：
                <span className="font-bold tabular-nums text-theme2">{team.vulns}</span>
              </div>
              <div>
                通过率：
                <span className="font-bold tabular-nums text-theme2">{team.reports && team.vulns ? Math.round((team.vulns / team.reports) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
