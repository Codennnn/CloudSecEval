import type { ReactElement } from 'react'

import { Activity, AlertTriangle, CalendarDays, CheckCircle2 } from 'lucide-react'

import type { BugItem } from '../types'

import { StatCard, type StatCardData } from '~admin/components/StatCard'

/**
 * 判断日期是否为今天
 */
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
function computeBugStats(all: BugItem[]): StatCardData[] {
  const total = all.length
  const pending = all.filter((x) => x.status === 'pending').length
  const todayAdded = all.filter((x) => isToday(x.createdAt)).length
  const highCriticalPending = all.filter((x) =>
    (x.severity === 'high' || x.severity === 'critical') && x.status === 'pending',
  ).length

  const accepted = all.filter((x) => x.status === 'accepted').length
  const rejected = all.filter((x) => x.status === 'rejected').length
  const decisionTotal = accepted + rejected
  const acceptanceRate = decisionTotal > 0 ? `${Math.round((accepted / decisionTotal) * 100)}%` : '—'

  const cards: StatCardData[] = [
    {
      title: '待审核总数',
      value: pending,
      changePercent: '—',
      primaryText: '当前队列中的待审核漏洞',
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
      secondaryText: '严重级别 high 或 critical',
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

export function BugStatsCards(props: { data: BugItem[] }): ReactElement {
  const { data } = props

  const stats = computeBugStats(data)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((card, idx) => (
        <div key={idx}>
          <StatCard data={card} />
        </div>
      ))}
    </div>
  )
}
