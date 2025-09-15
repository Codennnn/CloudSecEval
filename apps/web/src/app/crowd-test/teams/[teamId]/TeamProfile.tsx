'use client'

import { Calendar, Ellipsis, MessageCircle, Phone, Video } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { StatsCard, StatsCardContent, StatsCardHeader, StatsCardTitle } from '~/components/ui-common/StatsCard'

import {
  activityTimeline,
  approveTrend,
  projectInfo,
  riskTrend,
  teams,
  vulnTrend,
  workloadData,
} from '../../dashboard/lib/mockData'

import { ActivityTimeline } from '~crowd-test/dashboard/components/ActivityTimeline'

/**
 * 团队概览页面（纯展示）。
 * - 参考设计图与 `DashboardPage` 的分区结构与视觉风格。
 * - 所有数据来源统一使用 `dashboard/lib/mockData.ts`，本文件仅做简单的派生与组合。
 */
export function TeamProfile() {
  // 顶部 KPI 用数据派生
  const totalTasks = projectInfo.reports.approved + projectInfo.reports.archived
  const totalReports = (
    projectInfo.reports.pending
    + projectInfo.reports.approved
    + projectInfo.reports.rejected
  )
  const efficiency
    = totalReports > 0
      ? Math.round((projectInfo.reports.approved / totalReports) * 100)
      : 0

  // 简单派生：累计“工时”以报告量的近似（示意用）
  const trackedHours = workloadData.reduce((sum, i) => sum + i.reports, 0)

  // Performance 区：用现有趋势数组合并为双曲线数据
  const performanceData = riskTrend.map((r, idx) => ({
    idx,
    date: String(idx + 1).padStart(2, '0'),
    thisMonth: r.value,
    lastMonth: vulnTrend[idx]?.value ?? r.value - 2,
  }))

  // 任务列表示例：从 teams 派生 3 条，状态与时长做规则映射
  const currentTasks = teams.slice(0, 3).map((t, i) => ({
    id: `task-${i}`,
    title: `${t.name} 渗透与复测`,
    status: (['in-progress', 'on-hold', 'done'] as const)[i] ?? 'in-progress',
    hours: 4 + i * 4,
  }))

  // 右侧“名片”采用项目负责人信息
  const profile = { handle: '@leader' }

  function formatToday() {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd}`
  }

  return (
    <div className="p-admin-content space-y-6">
      {/* 顶部欢迎区 */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-[oklch(96%_0_0deg)] to-[oklch(96%_0.03_210deg)]">
        <div className="relative grid gap-admin-content p-admin-content lg:grid-cols-3">
          <div className="col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Hello, 团队</h2>
                <p className="mt-1 text-sm text-muted-foreground">跟踪团队进展，这里可快速查看状态与趋势。</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{formatToday()}</span>
              </div>
            </div>

            {/* KPI 迷你卡 */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">Finished</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">{totalTasks}</span>
                  <span className="text-xs text-success">+{projectInfo.reports.archived} tasks</span>
                </div>
                <div className="mt-2 h-10">
                  <ChartContainer config={{ value: { label: '完成', color: 'oklch(60.8% 0.172 155.46deg)' } }}>
                    <AreaChart data={approveTrend}>
                      <Area dataKey="value" fill="oklch(95% 0.06 150deg)" stroke="oklch(60.8% 0.172 155.46deg)" strokeWidth={2} type="monotone" />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">Tracked</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">{trackedHours}h</span>
                  <span className="text-xs text-error">-6 hours</span>
                </div>
                <div className="mt-2 h-10">
                  <ChartContainer config={{ value: { label: '用时', color: 'oklch(57.7% 0.245 27.325deg)' } }}>
                    <AreaChart data={riskTrend}>
                      <Area dataKey="value" fill="oklch(96% 0.03 20deg)" stroke="oklch(57.7% 0.245 27.325deg)" strokeWidth={2} type="monotone" />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">Efficiency</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-success">{efficiency}%</span>
                  <span className="text-xs text-success">+12%</span>
                </div>
                <div className="mt-2 h-10">
                  <ChartContainer config={{ value: { label: '效率', color: 'oklch(48% 0.2 20deg)' } }}>
                    <LineChart data={vulnTrend}>
                      <Line dataKey="value" dot={false} stroke="oklch(48% 0.2 20deg)" strokeWidth={2} type="monotone" />
                    </LineChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧名片 */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/assets/avatars/placeholder.webp" />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xs text-muted-foreground">{profile.handle}</div>
              </div>
              <div className="ml-auto">
                <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-secondary">
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border bg-background px-2 py-1 text-sm hover:bg-secondary">
                <Video className="h-4 w-4" />
                视频
              </button>
              <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border bg-background px-2 py-1 text-sm hover:bg-secondary">
                <MessageCircle className="h-4 w-4" />
                消息
              </button>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-secondary">
                <Ellipsis className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 中间区域：左列主内容 + 右侧活动流 */}
      <div className="grid grid-cols-1 gap-admin-content lg:grid-cols-3">
        {/* 左列 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Performance */}
          <StatsCard>
            <StatsCardHeader className="flex-row items-center justify-between">
              <StatsCardTitle>Performance</StatsCardTitle>
              <div className="text-xs text-muted-foreground">01–07 May</div>
            </StatsCardHeader>
            <StatsCardContent>
              <div className="h-64">
                <ChartContainer
                  config={{
                    thisMonth: { label: '本月', color: 'oklch(56% 0.19 230deg)' },
                    lastMonth: { label: '上月', color: 'oklch(60.8% 0.172 155.46deg)' },
                  }}
                >
                  <LineChart data={performanceData}>
                    <CartesianGrid vertical={false} />
                    <XAxis axisLine={false} dataKey="date" minTickGap={24} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Line dataKey="thisMonth" dot={false} stroke="var(--color-thisMonth)" strokeWidth={2} type="monotone" />
                    <Line dataKey="lastMonth" dot={false} stroke="var(--color-lastMonth)" strokeWidth={2} type="monotone" />
                  </LineChart>
                </ChartContainer>
              </div>
            </StatsCardContent>
          </StatsCard>

          {/* Current Tasks */}
          <StatsCard>
            <StatsCardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <StatsCardTitle>Current Tasks</StatsCardTitle>
                <Badge variant="secondary">Done 30%</Badge>
              </div>
              <div className="text-xs text-muted-foreground">Week</div>
            </StatsCardHeader>
            <StatsCardContent>
              <div className="space-y-3">
                {currentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-md border p-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-secondary" />
                    <div className="flex-1">
                      <div className="font-medium leading-tight">{task.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className={
                              task.status === 'done'
                                ? 'h-2 w-2 rounded-full bg-success'
                                : task.status === 'on-hold'
                                  ? 'h-2 w-2 rounded-full bg-warning'
                                  : 'h-2 w-2 rounded-full bg-foreground/40'
                            }
                          />
                          {task.status === 'done' ? 'Done' : task.status === 'on-hold' ? 'On hold' : 'In progress'}
                        </span>
                        <span>{task.hours}h</span>
                      </div>
                    </div>
                    <Ellipsis className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </StatsCardContent>
          </StatsCard>
        </div>

        {/* 右侧栏：活动流使用统一组件 */}
        <div className="space-y-6">
          <StatsCard>
            <StatsCardHeader>
              <StatsCardTitle>时间线活动</StatsCardTitle>
            </StatsCardHeader>

            <StatsCardContent>
              <ActivityTimeline activities={activityTimeline} />
            </StatsCardContent>
          </StatsCard>
        </div>
      </div>
    </div>
  )
}
