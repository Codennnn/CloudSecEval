'use client'

import { get } from 'lodash-es'

import { DashDecoratorImg } from './DashDecoratorImg'

import type { ApprovalStatusStatsDataDto } from '~api/types.gen'
import { BugReportStatus } from '~crowd-test/constants'

interface StatItemProps {
  title: string
  value: number
  icon: string
  type: 'pending' | 'approved' | 'rejected' | 'archived'
}

function StatItem(props: StatItemProps) {
  const { title, value, icon } = props

  return (
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-full">
        <DashDecoratorImg
          className="size-10"
          src={icon}
        />
      </div>

      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm tabular-nums font-bold bg-gradient-to-t bg-clip-text text-transparent from-theme to-theme2">{value}</div>
      </div>
    </div>
  )
}

interface BugReportStatsProps {
  data?: ApprovalStatusStatsDataDto['statusStats']
}

export function BugReportStats(props: BugReportStatsProps) {
  const { data } = props

  const statItems = [
    {
      title: '待审核',
      value: get(data, `${BugReportStatus.PENDING}.count`, 0) as number,
      icon: '/assets/crowd-test/dash-report-stat-pending.png',
      type: 'pending' as const,
    },
    {
      title: '已通过',
      value: get(data, `${BugReportStatus.APPROVED}.count`, 0) as number,
      icon: '/assets/crowd-test/dash-report-stat-approved.png',
      type: 'approved' as const,
    },
    {
      title: '已拒绝',
      value: get(data, `${BugReportStatus.REJECTED}.count`, 0) as number,
      icon: '/assets/crowd-test/dash-report-stat-rejected.png',
      type: 'rejected' as const,
    },
    {
      title: '已归档',
      value: get(data, `${BugReportStatus.CLOSED}.count`, 0) as number,
      icon: '/assets/crowd-test/dash-report-stat-archived.png',
      type: 'archived' as const,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {statItems.map((item) => (
        <StatItem
          key={item.title}
          icon={item.icon}
          title={item.title}
          type={item.type}
          value={item.value}
        />
      ))}
    </div>
  )
}
