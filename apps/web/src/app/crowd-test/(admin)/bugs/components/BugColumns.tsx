import { type ReactElement, useMemo } from 'react'

import { EllipsisVerticalIcon } from 'lucide-react'

import type { TableColumnDef } from '~/components/table/table.type'
import { createDateColumn } from '~/components/table/table.util'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

import { type BugItem, type BugStatus, STATUS_TO_LABEL, STATUS_TO_VARIANT } from '../types'

/**
 * 渲染状态徽章
 */
function StatusBadge(props: { status: BugStatus }): ReactElement {
  const { status } = props
  const classes = STATUS_TO_VARIANT[status]
  const label = STATUS_TO_LABEL[status]

  return (
    <Badge className={`border ${classes}`}>{label}</Badge>
  )
}

/**
 * 生成表格列（禁用排序，无批量）
 */
export function useBugColumns(): TableColumnDef<BugItem>[] {
  const cols = useMemo(() => {
    const list: TableColumnDef<BugItem>[] = [
      {
        accessorKey: 'title',
        header: '标题',
        enableSorting: false,
      },
      {
        accessorKey: 'authorName',
        header: '作者',
        enableSorting: false,
      },
      {
        accessorKey: 'status',
        header: '状态',
        enableSorting: false,
        enableHiding: true,
        cell: ({ row }) => {
          const value = row.original.status

          return <StatusBadge status={value} />
        },
      },
      createDateColumn<BugItem>({
        accessorKey: 'createdAt',
        header: '创建时间',
        enableSorting: false,
      }),
      {
        id: 'actions',
        header: '操作',
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original.id

          return (
            <div className="flex items-center gap-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="data-[state=open]:bg-muted text-muted-foreground"
                    size="iconNormal"
                    variant="ghost"
                  >
                    <EllipsisVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={() => { console.warn('TODO: view bug detail', id) }}
                  >
                    查看详情
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => { console.warn('TODO: open audit dialog', id) }}
                  >
                    审核
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ]

    return list
  }, [])

  return cols
}
