'use client'

import { DashDecoratorImg } from './DashDecoratorImg'

interface StatItemProps {
  title: string
  value: number
  icon: string
  type: 'pending' | 'approved' | 'rejected' | 'archived'
}

const statItems = [
  {
    title: '待审核',
    value: 10,
    icon: '/assets/crowd-test/dash-report-stat-pending.png',
    type: 'pending' as const,
  },
  {
    title: '已通过',
    value: 20,
    icon: '/assets/crowd-test/dash-report-stat-approved.png',
    type: 'approved' as const,
  },
  {
    title: '已拒绝',
    value: 30,
    icon: '/assets/crowd-test/dash-report-stat-rejected.png',
    type: 'rejected' as const,
  },
  {
    title: '已归档',
    value: 40,
    icon: '/assets/crowd-test/dash-report-stat-archived.png',
    type: 'archived' as const,
  },
]

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

export function BugReportStats() {
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
