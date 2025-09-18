'use client'

import { useQuery } from '@tanstack/react-query'

import { Card } from '~/components/ui/card'
import { bugReportsControllerGetApprovalStatusStatsOptions } from '~/lib/api/generated/@tanstack/react-query.gen'

import { Skeleton } from '../../../../../components/ui/skeleton'

import { BugReportStatus, getReportStatus } from '~crowd-test/constants'

interface StatCardProps {
  type: BugReportStatus
  value: number
  isLoading: boolean
}

function StatCard(props: StatCardProps) {
  const {
    type,
    value,
    isLoading,
  } = props

  const bugReportStatus = getReportStatus(type)

  return (
    <Card className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`flex size-9 items-center justify-center rounded-full ring-1 ring-border ${bugReportStatus.frontColor}`}>
          {bugReportStatus.icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">{bugReportStatus.label}</div>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">{bugReportStatus.hint}</p>

          <div className="mt-1 flex items-baseline gap-2">
            {
              isLoading
                ? <Skeleton className="h-6 w-10" />
                : (
                    <span className={`text-2xl font-bold ${bugReportStatus.frontColor}`}>
                      {value}
                    </span>
                  )
            }
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ReportStatsCards() {
  const { data, isLoading } = useQuery(
    bugReportsControllerGetApprovalStatusStatsOptions(),
  )
  const statsData = data?.data

  const cardsConfig = [
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {cardsConfig.map((c) => (
        <StatCard
          key={c.key}
          isLoading={!isLoading}
          type={c.key}
          value={c.count}
        />
      ))}
    </div>
  )
}
