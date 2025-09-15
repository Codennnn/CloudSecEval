'use client'

import { useMemo } from 'react'

import { type BugSeverity, type BugStatus, STATUS_TO_LABEL, STATUS_TO_VARIANT } from '~/app/crowd-test/(admin)/bugs/types'
import { activityTimeline } from '~/app/crowd-test/(admin)/dashboard/lib/mockData'
import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { createDateColumn } from '~/components/table/table.util'
import { Badge } from '~/components/ui/badge'

interface MemberReportRow {
  id: string
  title: string
  authorName: string
  severity: BugSeverity
  status: BugStatus
  createdAt: string
}

export function MemberReportTable() {
  const memberReports: MemberReportRow[] = useMemo(() => {
    const sevMap: Record<string, BugSeverity> = { 高危: 'high', 中危: 'medium', 低危: 'low' }
    const statusMap: Record<string, BugStatus> = { 待审核: 'pending', 已通过: 'accepted', 已拒绝: 'rejected' }

    const base = activityTimeline.map((a, i) => ({
      id: a.id ?? String(i + 1),
      title: a.title,
      authorName: a.user,
      severity: sevMap[a.severity] ?? 'medium',
      status: statusMap[a.status] ?? 'pending',
      createdAt: new Date().toISOString(),
    }))

    const extra: MemberReportRow[] = Array.from({ length: 16 }).map((_, i) => ({
      id: `e${i + 1}`,
      title: `接口鉴权异常 ${i + 1}`,
      authorName: i % 2 === 0 ? '李明' : '王楠',
      severity: (['low', 'medium', 'high'] as BugSeverity[])[i % 3],
      status: (['pending', 'accepted', 'rejected'] as BugStatus[])[i % 3],
      createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
    }))

    return [...base, ...extra]
  }, [])

  const columns = useMemo<TableColumnDef<MemberReportRow>[]>(() => [
    { accessorKey: 'authorName', header: '成员', enableSorting: false },
    { accessorKey: 'title', header: '报告标题', enableSorting: false },
    {
      accessorKey: 'severity',
      header: '严重级别',
      enableSorting: false,
      cell: ({ row }) => {
        const sev = row.original.severity
        const label: Record<BugSeverity, string> = { low: '低', medium: '中', high: '高', critical: '严重' }

        return <Badge variant="outline">{label[sev]}</Badge>
      },
    },
    {
      accessorKey: 'status',
      header: '状态',
      enableSorting: false,
      cell: ({ row }) => {
        const st = row.original.status

        return <Badge className={`border ${STATUS_TO_VARIANT[st]}`}>{STATUS_TO_LABEL[st]}</Badge>
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
