'use client'

import { useMemo } from 'react'

import { MemberInfo } from '~/components/MemberInfo'
import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { createDateColumn } from '~/components/table/table.util'
import { Badge } from '~/components/ui/badge'
import type { BugReportSummaryDto } from '~/lib/api/generated/types.gen'

import { bugReportsControllerFindDepartmentReportsOptions, bugReportsControllerFindDepartmentReportsQueryKey } from '~api/@tanstack/react-query.gen'
import { getReportStatus, getVulSeverity } from '~crowd-test/constants'

export function MemberReportTable() {
  const columns = useMemo<TableColumnDef<BugReportSummaryDto>[]>(() => [
    {
      id: 'user',
      accessorKey: 'user',
      header: '成员',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <MemberInfo
          avatarUrl={row.original.user?.avatarUrl}
          email={row.original.user?.email}
          name={row.original.user?.name}
        />
      ),
    },
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
    createDateColumn<BugReportSummaryDto>({ accessorKey: 'createdAt', header: '创建时间', enableSorting: false }),
  ], [])

  return (
    <ProTable<BugReportSummaryDto>
      columns={columns}
      headerTitle="部门成员报告列表"
      queryKeyFn={bugReportsControllerFindDepartmentReportsQueryKey as QueryKeyFn}
      queryOptionsFn={
        bugReportsControllerFindDepartmentReportsOptions as QueryOptionsFn<BugReportSummaryDto>
      }
      toolbar={{
        search: { inputProps: { placeholder: '搜索成员或报告标题...' } },
      }}
    />
  )
}
