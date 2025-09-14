'use client'

import { Clock, Shield } from 'lucide-react'
import { Area, AreaChart, Line, LineChart } from 'recharts'

import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { ChartContainer } from '~/components/ui/chart'

import { ActivityTimeline } from './components/ActivityTimeline'
import { PersonalRankingList } from './components/PersonalRankingList'
import { ReportStatsCards } from './components/ReportStatsCards'
import { TeamOnlineChart } from './components/TeamOnlineChart'
import { TeamReportsChart } from './components/TeamReportsChart'
import {
  activityTimeline,
  approveTrend,
  personalRanking,
  projectInfo,
  riskTrend,
  roleColorMap,
  teams,
  vulnTrend,
  workloadData,
} from './lib/mockData'

// 按队伍汇总在线人数（用于饼图）
const teamOnlineData = teams.map((t) => ({ name: t.name, value: t.online, fill: roleColorMap[t.role] ?? '#8b5cf6' }))
const totalOnline = teams.reduce((sum, t) => sum + t.online, 0)

/**
 * 企业攻防演练大屏仪表盘
 */
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
            <div className="mt-2 grid gap-1 text-sm text-muted-foreground @sm:grid-cols-2">
              <div>负责人：{projectInfo.leader}</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 opacity-70" />
                <span>时间：{projectInfo.startDate} 至 {projectInfo.endDate}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:justify-items-end">
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">风险评分</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-error">{projectInfo.riskScore}</span>
              </div>
              <div className="mt-2 h-10">
                <ChartContainer config={{ value: { label: '风险', color: 'oklch(57.7% 0.245 27.325deg)' } }}>
                  <AreaChart data={riskTrend}>
                    <Area dataKey="value" fill="oklch(96% 0.03 20deg)" stroke="oklch(57.7% 0.245 27.325deg)" strokeWidth={2} type="monotone" />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">漏洞总数</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{projectInfo.totalVulns}</span>
              </div>
              <div className="mt-2 h-10">
                <ChartContainer config={{ value: { label: '漏洞', color: 'oklch(48% 0.2 20deg)' } }}>
                  <LineChart data={vulnTrend}>
                    <Line dataKey="value" dot={false} stroke="oklch(48% 0.2 20deg)" strokeWidth={2} type="monotone" />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">报告通过</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-success">{projectInfo.reports.approved}</span>
              </div>
              <div className="mt-2 h-10">
                <ChartContainer config={{ value: { label: '通过', color: 'oklch(60.8% 0.172 155.46deg)' } }}>
                  <AreaChart data={approveTrend}>
                    <Area dataKey="value" fill="oklch(95% 0.06 150deg)" stroke="oklch(60.8% 0.172 155.46deg)" strokeWidth={2} type="monotone" />
                  </AreaChart>
                </ChartContainer>
              </div>
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

      {/* 分组标题：实时动态与在线概览 */}
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-foreground-accent">实时动态与在线概览</h3>
        <p className="mt-1 text-xs text-muted-foreground">左侧为实时测试动态，右侧为团队在线人数与资产状态概览。</p>
      </div>

      {/* 中间区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="space-y-6">
          {/* 时间线活动列表 */}
          <ActivityTimeline activities={activityTimeline} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>团队在线人数</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamOnlineChart data={teamOnlineData} totalOnline={totalOnline} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 分组标题：团队协作状态区 */}
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-foreground-accent">团队协作与贡献</h3>
        <p className="mt-1 text-xs text-muted-foreground">团队在线情况、工作量对比，以及个人贡献排行。</p>
      </div>

      {/* 团队协作状态区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 工作量统计 */}
        <Card>
          <CardHeader>
            <CardTitle>工作量统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <TeamReportsChart
                data={workloadData.map((d) => ({
                  team: d.team,
                  reports: d.reports,
                  role: d.role,
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* 个人工作量排行 */}
        <Card>
          <CardHeader>
            <CardTitle>个人工作量排行</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonalRankingList data={personalRanking} maxItems={10} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
