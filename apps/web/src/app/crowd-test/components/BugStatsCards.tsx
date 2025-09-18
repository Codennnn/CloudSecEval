import { Activity, AlertTriangle, CalendarDays, CheckCircle2 } from 'lucide-react'

import { BugStatsCard, type StatCardData } from './BugStatsCard'

import { type BugReportSummaryDto } from '~api/types.gen'
import { BugReportStatus, VulnerabilitySeverity } from '~crowd-test/constants'

function isToday(date: string): boolean {
  const d = new Date(date)
  const now = new Date()

  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

/**
 * 计算审核员/管理员关注的统计指标
 */
function computeBugStats(all: BugReportSummaryDto[]): StatCardData[] {
  const total = all.length
  const pending = all.filter((x) => x.status === BugReportStatus.PENDING).length
  const todayAdded = all.filter((x) => isToday(x.createdAt)).length
  const highCriticalPending = all.filter((x) =>
    (x.severity === VulnerabilitySeverity.HIGH
      || x.severity === VulnerabilitySeverity.CRITICAL)
    && x.status === BugReportStatus.PENDING,
  ).length

  const accepted = all.filter((x) => x.status === BugReportStatus.APPROVED).length
  const rejected = all.filter((x) => x.status === BugReportStatus.REJECTED).length
  const decisionTotal = accepted + rejected
  const acceptanceRate = decisionTotal > 0 ? `${Math.round((accepted / decisionTotal) * 100)}%` : '—'

  const cards: StatCardData[] = [
    {
      title: '待审核总数',
      value: pending,
      changePercent: '—',
      primaryText: '当前等待审核的漏洞',
      secondaryText: `总数 ${total} 条`,
      icon: Activity,
      trendType: 'neutral',
    },
    {
      title: '今日新增',
      value: todayAdded,
      changePercent: '—',
      primaryText: '今天新提交的漏洞数量',
      secondaryText: '按创建时间统计',
      icon: CalendarDays,
      trendType: 'neutral',
    },
    {
      title: '高/严重待处理',
      value: highCriticalPending,
      changePercent: '—',
      primaryText: '高优先级需要优先处理',
      secondaryText: '漏洞等级为高危或严重的待处理漏洞',
      icon: AlertTriangle,
      trendType: 'neutral',
    },
    {
      title: '接收率',
      value: acceptanceRate,
      changePercent: '—',
      primaryText: `已接收 ${accepted} / 已裁决 ${decisionTotal}`,
      secondaryText: '接收率 = 接收 ÷ (接收 + 拒绝)',
      icon: CheckCircle2,
      trendType: 'neutral',
    },
  ]

  return cards
}

interface BugStatsCardsProps {
  data: BugReportSummaryDto[]
}

export function BugStatsCards(props: BugStatsCardsProps) {
  const { data } = props

  const stats = computeBugStats(data)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-admin-content">
      {stats.map((card, idx) => (
        <div key={idx}>
          <BugStatsCard data={card} />
        </div>
      ))}
    </div>
  )
}
