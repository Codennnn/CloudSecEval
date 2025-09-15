'use client'

import { CheckCircleIcon, ClockIcon, XCircleIcon } from 'lucide-react'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import { ActivityTimeline } from '~/app/crowd-test/(admin)/dashboard/components/ActivityTimeline'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { Separator } from '~/components/ui/separator'
import { StatsCard, StatsCardContent, StatsCardHeader, StatsCardTitle } from '~/components/ui-common/StatsCard'

import { activityTimeline, riskTrend, vulnTrend } from '../../dashboard/lib/mockData'

import { MemberReportTable } from './MemberReportTable'

const statsData = [
  {
    title: '已通过',
    description: '审核通过的报告',
    value: 5,
    icon: CheckCircleIcon,
  },
  {
    title: '待审核',
    description: '等待处理的报告',
    icon: ClockIcon,
    value: 10,
  },
  {
    title: '已拒绝',
    description: '未通过的报告',
    icon: XCircleIcon,
    value: 2,
  },
]

interface StatCardProps {
  title: string
  description: string
  icon: React.ReactNode
  value: number
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

export function TeamProfile() {
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
          {statsData.map((stat, idx) => (
            <div key={stat.title} className="flex justify-between gap-admin-content px-admin-content">
              <StatCard
                key={stat.title}
                {...stat}
                icon={<stat.icon className="size-6" />}
              />
              {idx !== statsData.length - 1 && (
                <Separator orientation="vertical" />
              )}
            </div>
          ))}
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
              <ActivityTimeline activities={activityTimeline} />
            </StatsCardContent>
          </StatsCard>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">成员漏洞报告列表</h3>
        <MemberReportTable />
      </div>
    </div>
  )
}
