'use client'

import { useMemo } from 'react'

import { activityTimeline } from '~/app/crowd-test/(admin)/dashboard/lib/mockData'
import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { createDateColumn } from '~/components/table/table.util'
import { Badge } from '~/components/ui/badge'

import { VulnerabilitySeverity } from '~api/types.gen'
import { BugReportStatus, getReportStatus, getVulSeverity } from '~crowd-test/constants'

interface MemberReportRow {
  id: string
  title: string
  authorName: string
  severity: VulnerabilitySeverity
  status: BugReportStatus
  createdAt: string
}

export function MemberReportTable() {
  const memberReports: MemberReportRow[] = useMemo(() => {
    const base = activityTimeline.map((a, i) => ({
      id: a.id ?? String(i + 1),
      title: a.title,
      authorName: a.user,
      severity: getVulSeverity(a.severity).label as VulnerabilitySeverity,
      status: getReportStatus(a.status).label as BugReportStatus,
      createdAt: new Date().toISOString(),
    }))

    const extra: MemberReportRow[] = Array.from({ length: 16 }).map((_, i) => ({
      id: `e${i + 1}`,
      title: `接口鉴权异常 ${i + 1}`,
      authorName: i % 2 === 0 ? '李明' : '王楠',
      severity: ([VulnerabilitySeverity.LOW, VulnerabilitySeverity.MEDIUM, VulnerabilitySeverity.HIGH])[i % 3],
      status: ([BugReportStatus.PENDING, BugReportStatus.APPROVED, BugReportStatus.REJECTED])[i % 3],
      createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
    }))

    return [...base, ...extra]
  }, [])

  const columns = useMemo<TableColumnDef<MemberReportRow>[]>(() => [
    { accessorKey: 'authorName', header: '成员', enableSorting: false },
    { accessorKey: 'title', header: '报告标题', enableSorting: false },
    {
      accessorKey: 'severity',
      header: '漏洞等级',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <Badge variant="outline">
            {getVulSeverity(row.original.severity).label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: '状态',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <Badge>
            {getReportStatus(row.original.status).label}
          </Badge>
        )
      },
    },
    createDateColumn<MemberReportRow>({ accessorKey: 'createdAt', header: '创建时间', enableSorting: false }),
  ], [])

  const queryKeyFn: QueryKeyFn = (options) => ['team-member-reports', options.query]

  const queryOptionsFn: QueryOptionsFn<MemberReportRow> = (options) => ({
    queryKey: ['team-member-reports', options.query],
    queryFn: () => {
      const q = options.query as { page?: number, pageSize?: number } | undefined
      const page = (q?.page ?? 1)
      const pageSize = (q?.pageSize ?? 10)
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const sliced = memberReports.slice(start, end)
      const total = memberReports.length
      const totalPages = Math.max(1, Math.ceil(total / pageSize))

      return Promise.resolve({
        code: 200,
        message: 'OK',
        data: sliced,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      })
    },
  })

  return (
    <ProTable<MemberReportRow>
      columns={columns}
      headerTitle=""
      paginationConfig={{ showPageSizeSelector: true, showSelection: false }}
      queryKeyFn={queryKeyFn}
      queryOptionsFn={queryOptionsFn}
      toolbar={{
        search: { inputProps: { placeholder: '搜索成员或标题...' } },
      }}
    />
  )
}
