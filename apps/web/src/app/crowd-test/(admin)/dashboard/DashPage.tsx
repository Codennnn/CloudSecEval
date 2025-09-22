'use client'

import { Shield } from 'lucide-react'

import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Badge } from '~/components/ui/badge'
import { StatsCard, StatsCardContent, StatsCardHeader, StatsCardTitle } from '~/components/ui-common/StatsCard'

import { ActivityTimeline } from './components/ActivityTimeline'
import { EventTrendChart } from './components/EventTrendChart'
import { ReportStatsCards } from './components/ReportStatsCards'
import { TeamOnlineChart } from './components/TeamOnlineChart'
import { TeamReportsChart } from './components/TeamReportsChart'
import { TeamReportsOverviewTable } from './components/TeamReportsOverviewTable'
import {
  projectInfo,
} from './lib/mockData'

export function DashboardPage() {
  return (
    <div className="p-admin-content space-y-6">
      {/* 顶部横幅：项目信息与关键信息总览 */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-theme/20 to-theme2/20">
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
      <ReportStatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-admin-content">
        <div>
          <StatsCard className="overflow-hidden">
            <StatsCardHeader>
              <StatsCardTitle>时间线活动</StatsCardTitle>
            </StatsCardHeader>

            <StatsCardContent className="!p-0 flex flex-col">
              <ScrollGradientContainer
                className="p-card-box-content max-h-[375px]"
              >
                <ActivityTimeline />
              </ScrollGradientContainer>
            </StatsCardContent>
          </StatsCard>
        </div>

        <div>
          <StatsCard>
            <StatsCardHeader>
              <StatsCardTitle>团队报告数统计</StatsCardTitle>
            </StatsCardHeader>
            <StatsCardContent>
              <div className="min-h-64">
                <TeamReportsChart />
              </div>
            </StatsCardContent>
          </StatsCard>
        </div>

        <div>
          <StatsCard>
            <StatsCardHeader>
              <StatsCardTitle>团队在线情况</StatsCardTitle>
            </StatsCardHeader>
            <StatsCardContent>
              <TeamOnlineChart />
            </StatsCardContent>
          </StatsCard>
        </div>

        <div>
          <StatsCard>
            <StatsCardHeader>
              <StatsCardTitle>事件趋势</StatsCardTitle>
            </StatsCardHeader>

            <StatsCardContent>
              <EventTrendChart />
            </StatsCardContent>
          </StatsCard>
        </div>
      </div>

      <TeamReportsOverviewTable />

      {/* <div>
        <StatsCard>
          <StatsCardHeader>
            <StatsCardTitle>个人排行</StatsCardTitle>
          </StatsCardHeader>
          <StatsCardContent>
            <PersonalRankingList data={personalRanking} maxItems={10} />
          </StatsCardContent>
        </StatsCard>
      </div> */}
    </div>
  )
}
