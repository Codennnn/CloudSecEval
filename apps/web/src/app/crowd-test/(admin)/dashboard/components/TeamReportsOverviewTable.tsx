'use client'

import { useMemo } from 'react'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { get } from 'lodash-es'

import { ProTable } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { Badge } from '~/components/ui/badge'

import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'
import { bugReportsControllerGetDepartmentReportsStatsOptions } from '~api/@tanstack/react-query.gen'
import { BugReportStatus, getTeamRole, getTeamRoleConfig, type TeamRole } from '~crowd-test/constants'

interface TeamReportsOverviewRow {
  id: string
  team: string
  role: TeamRole
  submitted: number
  approved: number
  approvalRate: number
}

export function TeamReportsOverviewTable() {
  const { data } = useQuery({
    ...bugReportsControllerGetDepartmentReportsStatsOptions(),
  })

  const rows = useMemo<TeamReportsOverviewRow[]>(() => {
    const departmentStats = data?.data.departmentStats

    if (departmentStats) {
      return departmentStats.map((d) => {
        const submitted = d.reportCount
        const approved = get(d, `statusCounts.${BugReportStatus.APPROVED}.count`, 0)
        const approvalRate = submitted > 0 ? Math.round((approved / submitted) * 100) : 0

        return {
          id: d.department.id,
          team: d.department.name,
          role: getTeamRole(d.department.remark),
          submitted,
          approved,
          approvalRate,
        }
      })
    }

    return []
  }, [data])

  const columns = useMemo<TableColumnDef<TeamReportsOverviewRow>[]>(() => [
    {
      accessorKey: 'team',
      header: '团队',
      enableSorting: false,
    },
    {
      accessorKey: 'role',
      header: '阵营',
      enableSorting: false,
      cell: ({ row }) => {
        const role = row.original.role
        const roleConfig = getTeamRoleConfig(role)

        return (
          <Badge style={{ backgroundColor: roleConfig.colorValue, color: 'white' }}>
            {roleConfig.alias}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'submitted',
      header: '提交数',
      enableSorting: false,
    },
    {
      accessorKey: 'approved',
      header: '通过数',
      enableSorting: false,
    },
    {
      accessorKey: 'approvalRate',
      header: '通过率',
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.approvalRate}%</span>,
    },
  ], [])

  return (
    <ProTable<TeamReportsOverviewRow>
      columns={columns}
      data={rows}
      headerTitle="团队报告总览"
      paginationConfig={{
        showPagination: false,
      }}
      toolbar={{
        showToolbar: false,
      }}
    />
  )
}
