'use client'

import Link from 'next/link'

import { FileTextIcon, MoreVerticalIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import {
  formatDateTime,
  formatRelativeTime,
  type Report,
  reportStatusConfig,
  reportTypeConfig,
} from '../lib/mock-reports'

interface ReportListProps {
  /** 报告列表 */
  reports: Report[]
  /** 删除报告回调 */
  onDelete?: (reportId: string) => void
}

/**
 * 报告列表组件
 * 以表格形式展示所有报告
 */
export function ReportList(props: ReportListProps) {
  const { reports, onDelete } = props

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-12">
        <FileTextIcon className="mb-4 size-12 text-muted-foreground/50" />
        <h3 className="mb-2 text-lg font-semibold">暂无报告</h3>
        <p className="text-sm text-muted-foreground">
          点击右上角"生成报告"按钮创建第一个报告
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>报告标题</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>关联项目</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="w-[80px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => {
            const typeConfig = reportTypeConfig[report.type]
            const statusConfig = reportStatusConfig[report.status]

            return (
              <TableRow key={report.id}>
                <TableCell>
                  <Link
                    className="flex items-center gap-2 font-medium hover:text-primary"
                    href={`/cloud-sec-eval/report-generation/${report.id}`}
                  >
                    <span>{typeConfig.icon}</span>
                    <span>{report.title}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{typeConfig.label}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {report.projectName}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      report.status === 'completed'
                        ? 'default'
                        : report.status === 'generating'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">
                      {formatRelativeTime(report.createdAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(report.createdAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="iconSm" variant="ghost">
                        <MoreVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/cloud-sec-eval/report-generation/${report.id}`}
                        >
                          查看详情
                        </Link>
                      </DropdownMenuItem>
                      {report.status === 'completed' && (
                        <DropdownMenuItem>导出报告</DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          onDelete?.(report.id)
                        }}
                      >
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

