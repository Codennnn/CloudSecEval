'use client'

import { Shield } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { StatsCard, StatsCardContent, StatsCardHeader, StatsCardTitle } from '~/components/ui-common/StatsCard'

import { ActivityTimeline } from './components/ActivityTimeline'
import { EventTrendChart } from './components/EventTrendChart'
import { PersonalRankingList } from './components/PersonalRankingList'
import { ReportStatsCards } from './components/ReportStatsCards'
import { TeamOnlineChart } from './components/TeamOnlineChart'
import { TeamReportsChart } from './components/TeamReportsChart'
import { TeamReportsOverviewTable } from './components/TeamReportsOverviewTable'
import {
  activityTimeline,
  personalRanking,
  projectInfo,
  roleColorMap,
  teams,
  workloadData,
} from './lib/mockData'

// 按队伍汇总在线人数（用于饼图）
const teamOnlineData = teams.map((t) => ({ name: t.name, value: t.online, fill: roleColorMap[t.role] ?? '#8b5cf6' }))
const totalOnline = teams.reduce((sum, t) => sum + t.online, 0)

export function DashboardPage() {
  return (
    <div className="p-admin-content space-y-6">
      {/* 顶部横幅：项目信息与关键信息总览 */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-[oklch(96%_0_0deg)] to-[oklch(96%_0.03_210deg)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, oklch(70% 0.12 30deg) 0, transparent 40%), radial-gradient(circle at 80% 30%, oklch(70% 0.12 240deg) 0, transparent 40%)' }} />
        <div className="relative grid gap-6 p-6 lg:grid-cols-3">
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-foreground-accent">
              <Shield className="h-5 w-5" />
              <span className="text-sm">企业攻防演练</span>
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{projectInfo.name}</h2>
              <Badge>{projectInfo.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 报告统计卡片 */}
      <ReportStatsCards
        stats={{
          pending: projectInfo.reports.pending,
          approved: projectInfo.reports.approved,
          rejected: projectInfo.reports.rejected,
          archived: projectInfo.reports.archived,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-admin-content">
        <StatsCard>
          <StatsCardHeader>
            <StatsCardTitle>时间线活动</StatsCardTitle>
          </StatsCardHeader>

          <StatsCardContent>
            <ActivityTimeline activities={activityTimeline} />
          </StatsCardContent>
        </StatsCard>

        <StatsCard>
          <StatsCardHeader>
            <StatsCardTitle>团队报告数统计</StatsCardTitle>
          </StatsCardHeader>
          <StatsCardContent>
            <div className="min-h-64">
              <TeamReportsChart
                data={workloadData.map((d) => ({
                  team: d.team,
                  reports: d.reports,
                  role: d.role,
                }))}
              />
            </div>
          </StatsCardContent>
        </StatsCard>

        <StatsCard>
          <StatsCardHeader>
            <StatsCardTitle>团队在线情况</StatsCardTitle>
          </StatsCardHeader>
          <StatsCardContent>
            <TeamOnlineChart data={teamOnlineData} totalOnline={totalOnline} />
          </StatsCardContent>
        </StatsCard>

        <EventTrendChart />
      </div>

      <TeamReportsOverviewTable />

      <div>
        <StatsCard>
          <StatsCardHeader>
            <StatsCardTitle>个人排行</StatsCardTitle>
          </StatsCardHeader>
          <StatsCardContent>
            <PersonalRankingList data={personalRanking} maxItems={10} />
          </StatsCardContent>
        </StatsCard>
      </div>
    </div>
  )
}
