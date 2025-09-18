import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock, Eye, Percent } from 'lucide-react'

import { bugReportsControllerGetApprovalStatusStatsOptions } from '~/lib/api/generated/@tanstack/react-query.gen'

import { BugStatsCard, type StatCardData } from './BugStatsCard'

import { BugReportStatus } from '~crowd-test/constants'

export function BugStatsCards() {
  const { data, isLoading } = useQuery(
    bugReportsControllerGetApprovalStatusStatsOptions(),
  )
  const statsData = data?.data

  const statsItems = useMemo<StatCardData[]>(() => {
    if (!statsData) {
      return []
    }

    const { statusStats, totalReports } = statsData

    // 计算待处理总数（待审核 + 审核中）
    const pendingTotal = (statusStats[BugReportStatus.PENDING].count ?? 0)
      + (statusStats[BugReportStatus.IN_REVIEW].count ?? 0)

    // 计算已裁决总数（通过 + 驳回）
    const decidedTotal = (statusStats[BugReportStatus.APPROVED].count ?? 0)
      + (statusStats[BugReportStatus.REJECTED].count ?? 0)

    // 计算通过率
    const approvalRate = decidedTotal > 0
      ? Math.round((statusStats[BugReportStatus.APPROVED].count ?? 0) / decidedTotal * 100)
      : 0

    return [
      {
        title: '待审核',
        value: statusStats[BugReportStatus.PENDING].count ?? 0,
        changePercent: totalReports > 0
          ? `${Math.round((statusStats[BugReportStatus.PENDING].count ?? 0) / totalReports * 100)}%`
          : '—',
        primaryText: '等待审核的漏洞报告',
        icon: Clock,
        trendType: 'neutral',
      },
      {
        title: '审核中',
        value: statusStats[BugReportStatus.IN_REVIEW].count ?? 0,
        changePercent: totalReports > 0
          ? `${Math.round((statusStats[BugReportStatus.IN_REVIEW].count ?? 0) / totalReports * 100)}%`
          : '—',
        primaryText: '正在审核中的漏洞',
        icon: Eye,
        trendType: 'neutral',
      },
      {
        title: '已通过',
        value: statusStats[BugReportStatus.APPROVED].count ?? 0,
        changePercent: statusStats[BugReportStatus.APPROVED].percentage
          ? `${statusStats[BugReportStatus.APPROVED].percentage.toFixed(1)}%`
          : '—',
        primaryText: '已通过审核的漏洞',
        icon: CheckCircle2,
        trendType: 'positive',
      },
      {
        title: '通过率',
        value: `${approvalRate}%`,
        changePercent: decidedTotal > 0 ? `${decidedTotal} 已裁决` : '暂无数据',
        primaryText: `已通过 ${statusStats[BugReportStatus.APPROVED].count ?? 0} / 已裁决 ${decidedTotal}`,
        icon: Percent,
        trendType: approvalRate >= 70 ? 'positive' : approvalRate >= 50 ? 'neutral' : 'negative',
      },
    ]
  }, [statsData])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-admin-content">
      {statsItems.map((card, idx) => (
        <div key={idx}>
          <BugStatsCard data={card} isLoading={isLoading} />
        </div>
      ))}
    </div>
  )
}
