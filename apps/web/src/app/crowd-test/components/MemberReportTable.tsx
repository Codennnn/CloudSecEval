'use client'

import { useMemo } from 'react'

import Link from 'next/link'

import { MemberInfo } from '~/components/MemberInfo'
import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { createDateColumn } from '~/components/table/table.util'
import { Badge } from '~/components/ui/badge'
import { FieldTypeEnum } from '~/constants/form'
import type { BugReportSummaryDto } from '~/lib/api/generated/types.gen'
import { cn } from '~/lib/utils'

import { AdminRoutes, getRoutePath } from '../../admini/lib/admin-nav'

import { bugReportsControllerFindDepartmentReportsOptions, bugReportsControllerFindDepartmentReportsQueryKey } from '~api/@tanstack/react-query.gen'
import { getReportStatus, getVulSeverity, reportStatusConfig, vulSeverityConfig } from '~crowd-test/constants'

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
    {
      accessorKey: 'title',
      header: '标题',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Link
            className="hover:underline underline-offset-2"
            href={
              getRoutePath(AdminRoutes.CrowdTestBugsDetail, { bugReportId: row.original.id })
            }
          >
            {row.original.title}
          </Link>
        )
      },
    },
    {
      accessorKey: 'severity',
      header: '漏洞等级',
      enableSorting: false,
      type: FieldTypeEnum.ENUM,
      enumOptions: Object.values(vulSeverityConfig),
      cell: ({ row }) => {
        const severity = row.original.severity
        const severityConfig = getVulSeverity(severity)

        return (
          <Badge
            className={cn(
              severityConfig.frontColor,
              severityConfig.bgColor,
              severityConfig.borderColor,
            )}
            variant="outline"
          >
            {severityConfig.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: '状态',
      enableSorting: false,
      type: FieldTypeEnum.ENUM,
      enumOptions: Object.values(reportStatusConfig),
      cell: ({ row }) => {
        const status = row.original.status
        const statusConfig = getReportStatus(status)

        return (
          <Badge className={statusConfig.frontColor} variant="outline">
            {statusConfig.icon}
            {statusConfig.label}
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
