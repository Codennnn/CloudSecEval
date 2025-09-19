'use client'

import { MemberInfo } from '~/components/MemberInfo'
import type { TableColumnDef } from '~/components/table/table.type'
import { Badge } from '~/components/ui/badge'
import { FieldTypeEnum } from '~/constants/form'
import { formatDate } from '~/utils/date'

import type { UserListItemDto } from '~api/types.gen'

interface CreateUserColumnsOptions {
  withActions?: boolean
  onEdit?: (user: UserListItemDto) => void
  onDelete?: (user: UserListItemDto) => void
}

export function createUserColumns(
  options?: CreateUserColumnsOptions,
): TableColumnDef<UserListItemDto>[] {
  const { withActions = false, onEdit, onDelete } = options ?? {}

  const baseColumns: TableColumnDef<UserListItemDto>[] = [
    {
      id: 'user',
      accessorKey: 'user',
      header: '成员',
      cell: ({ row }) => (
        <MemberInfo
          avatarUrl={row.original.avatarUrl}
          email={row.original.email}
          name={row.original.name}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'phone',
      header: '手机号',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.phone ?? (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'secondary' : 'default'}>
          {row.original.isActive ? '已启用' : '已禁用'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '创建时间',
      type: FieldTypeEnum.DATE,
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
  ]

  if (!withActions) {
    return baseColumns
  }

  const actionColumn: TableColumnDef<UserListItemDto> = {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              type="button"
              onClick={() => { onEdit(user) }}
            >
              编辑
            </button>
          )}
          {onDelete && (
            <button
              className="text-xs text-destructive hover:opacity-80 underline-offset-2 hover:underline"
              type="button"
              onClick={() => { onDelete(user) }}
            >
              删除
            </button>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  }

  return [...baseColumns, actionColumn]
}
