'use client'

import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import { ActivityTimeline } from '~/app/crowd-test/(admin)/dashboard/components/ActivityTimeline'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { Separator } from '~/components/ui/separator'
import { StatsCard, StatsCardContent, StatsCardHeader, StatsCardTitle } from '~/components/ui-common/StatsCard'

import { riskTrend, vulnTrend } from '../(admin)/dashboard/lib/mockData'

import { MemberReportTable } from './MemberReportTable'

import { useUser } from '~admin/stores/useUserStore'
import { bugReportsControllerGetApprovalStatusStatsOptions } from '~api/@tanstack/react-query.gen'
import { BugReportStatus, getReportStatus } from '~crowd-test/constants'

interface StatCardProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  value?: number
}

function StatCard(props: StatCardProps) {
  const { title, description, icon, value } = props

  return (
    <div className="flex items-start gap-5">
      <div className="pt-0.5">
        <div className="p-2 rounded-full bg-secondary">
          {icon}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="font-medium truncate">
          {title}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {description}
        </div>

        <div className="mt-1 font-extrabold tabular-nums text-2xl">
          {value}
        </div>
      </div>
    </div>
  )
}

function TeamReportStatsCards() {
  const user = useUser()
  const teamId = user?.department?.id

  const { data } = useQuery({
    ...bugReportsControllerGetApprovalStatusStatsOptions({
      query: {
        departmentId: teamId!,
      },
    }),
    enabled: Boolean(teamId),
  })
  const statsData = data?.data

  const statsItems = [
    {
      key: BugReportStatus.PENDING,
      count: statsData?.statusStats[BugReportStatus.PENDING].count ?? 0,
    },
    {
      key: BugReportStatus.APPROVED,
      count: statsData?.statusStats[BugReportStatus.APPROVED].count ?? 0,
    },
    {
      key: BugReportStatus.REJECTED,
      count: statsData?.statusStats[BugReportStatus.REJECTED].count ?? 0,
    },
  ]

  return (
    <>
      {statsItems.map((it, idx, arr) => {
        const statusConfig = getReportStatus(it.key)

        return (
          <div key={it.key} className="flex justify-between gap-admin-content px-admin-content">
            <StatCard
              description={statusConfig.hint}
              icon={<div className="size-6">{statusConfig.icon}</div>}
              title={statusConfig.label}
              value={it.count}
            />
            {idx !== arr.length - 1 && (
              <Separator orientation="vertical" />
            )}
          </div>
        )
      })}
    </>
  )
}

export function TeamProfile() {
  const user = useUser()
  const teamId = user?.department?.id

  // Performance 区：用现有趋势数组合并为双曲线数据
  const performanceData = riskTrend.map((r, idx) => ({
    idx,
    date: String(idx + 1).padStart(2, '0'),
    submitted: r.value,
    approved: vulnTrend[idx]?.value ?? Math.max(0, r.value - 2),
  }))

  return (
    <div className="space-y-admin-content">
      <div>
        <h2 className="text-2xl font-semibold">团队概况</h2>
        <p className="mt-1 text-sm text-muted-foreground">跟踪团队进展，这里可快速查看状态与趋势。</p>
      </div>

      <div className="space-y-admin-content">
        <Separator />

        <div className="grid md:grid-cols-3">
          <TeamReportStatsCards />
        </div>

        <Separator />
      </div>

      <div className="grid grid-cols-1 gap-admin-content lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="pb-4">
            <h3 className="text-lg font-semibold">报告统计趋势</h3>
          </div>

          <ChartContainer
            config={{
              submitted: { label: '提交的漏洞报告数', color: 'oklch(56% 0.19 230deg)' },
              approved: { label: '审核通过的报告数', color: 'oklch(60.8% 0.172 155.46deg)' },
            }}
          >
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="fill-approved" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-approved)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--color-approved)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <XAxis
                axisLine={false}
                dataKey="date"
                minTickGap={24}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="approved"
                dot={false}
                fill="url(#fill-approved)"
                isAnimationActive={false}
                stroke="var(--color-approved)"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="submitted"
                dot={false}
                fill="transparent"
                isAnimationActive={false}
                stroke="var(--color-submitted)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="space-y-6">
          <StatsCard>
            <StatsCardHeader>
              <StatsCardTitle>时间线活动</StatsCardTitle>
            </StatsCardHeader>

            <StatsCardContent>
              {!!teamId && <ActivityTimeline departmentId={teamId} />}
            </StatsCardContent>
          </StatsCard>
        </div>
      </div>

      <div className="space-y-3">
        <MemberReportTable />
      </div>
    </div>
  )
}
