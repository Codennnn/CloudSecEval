'use client'

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { get } from 'lodash-es'

import { cn } from '~/lib/utils'

import { DashDecoratorImg } from './DashDecoratorImg'

import { bugReportsControllerGetDepartmentReportsStatsOptions } from '~api/@tanstack/react-query.gen'
import { BugReportStatus } from '~crowd-test/constants'

interface TeamRankingItem {
  team: string
  score: number
  reports?: number
  vulns?: number
  accent?: string // 自定义队伍主题色，可选
}

interface TeamRankingProps {
  maxItems?: number
  className?: string
}

export function TeamRanking(props: TeamRankingProps) {
  const { maxItems = 5, className } = props

  const { data } = useQuery({
    ...bugReportsControllerGetDepartmentReportsStatsOptions(),
  })

  // 从接口数据生成排行数据
  const teamData = useMemo<TeamRankingItem[]>(() => {
    const departmentStats = data?.data.departmentStats

    if (departmentStats) {
      return departmentStats.map((d) => {
        const reports = d.reportCount
        const vulns = get(d, `statusCounts.${BugReportStatus.APPROVED}.count`, 0)

        // 基于提交数和通过数计算综合评分
        const reportsScore = reports * 2 // 提交数权重
        const vulnsScore = vulns * 3 // 通过数权重更高
        const score = Math.min(100, reportsScore + vulnsScore) // 限制最高100分

        return {
          team: d.department.name,
          score,
          reports,
          vulns,
        }
      })
    }

    return []
  }, [data])

  // 按通过率排序：优先按通过率，然后按通过数，最后按提交数
  const sorted = [...teamData]
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
