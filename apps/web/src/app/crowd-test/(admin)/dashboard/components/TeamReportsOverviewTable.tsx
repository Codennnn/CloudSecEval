'use client'

import { useMemo } from 'react'

import Link from 'next/link'

import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { Badge } from '~/components/ui/badge'

import { roleColorMap, type TeamRole, workloadData } from '../lib/mockData'

import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'

interface TeamReportsOverviewRow {
  id: string
  team: string
  role: TeamRole
  submitted: number
  approved: number
  approvalRate: number
}

/**
 * 团队报告总览表（提交/通过）
 */
export function TeamReportsOverviewTable() {
  const rows = useMemo<TeamReportsOverviewRow[]>(() => {
    // 依据 mock 工作量数据构造：submitted=reports；approved 为 reports 的 65%~90% 区间的稳定值
    return workloadData.map((d, idx) => {
      const submitted = Math.max(0, d.reports)
      const ratioSeed = 0.65 + ((idx % 5) * 0.05) // 0.65, 0.70, 0.75, 0.80, 0.85 循环
      const approved = Math.min(submitted, Math.round(submitted * ratioSeed))
      const approvalRate = submitted > 0 ? Math.round((approved / submitted) * 100) : 0

      return {
        id: d.team,
        team: d.team,
        role: d.role,
        submitted,
        approved,
        approvalRate,
      }
    })
  }, [])

  const columns = useMemo<TableColumnDef<TeamReportsOverviewRow>[]>(() => [
    {
      accessorKey: 'team',
      header: '团队',
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          <Link
            href={getRoutePath(AdminRoutes.CrowdTestTeamProfile, { teamId: row.original.id })}
          >
            <div className="font-medium">{row.original.team}</div>
          </Link>
          <div className="text-xs text-muted-foreground">{row.original.role}</div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: '阵营',
      enableSorting: false,
      cell: ({ row }) => {
        const role = row.original.role

        return (
          <Badge style={{ backgroundColor: roleColorMap[role], color: 'white' }}>
            {role}
          </Badge>
        )
      },
    },
    { accessorKey: 'submitted', header: '提交数', enableSorting: false },
    { accessorKey: 'approved', header: '通过数', enableSorting: false },
    {
      accessorKey: 'approvalRate',
      header: '通过率',
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.approvalRate}%</span>,
    },
  ], [])

  const queryKeyFn: QueryKeyFn = (options) => ['team-reports-overview', options.query]

  const queryOptionsFn: QueryOptionsFn<TeamReportsOverviewRow> = (options) => ({
    queryKey: ['team-reports-overview', options.query],
    queryFn: () => {
      const q = options.query as { page?: number, pageSize?: number } | undefined
      const page = (q?.page ?? 1)
      const pageSize = (q?.pageSize ?? 10)
      const start = (page - 1) * pageSize
      const end = start + pageSize

      const total = rows.length
      const sliced = rows.slice(start, end)
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
    <ProTable<TeamReportsOverviewRow>
      columns={columns}
      headerTitle="团队报告总览"
      paginationConfig={{
        showPagination: false,
      }}
      queryKeyFn={queryKeyFn}
      queryOptionsFn={queryOptionsFn}
      toolbar={{
        showToolbar: false,
      }}
    />
  )
}
