'use client'

import type { TableColumnDef } from '~/components/table/table.type'
import { Badge } from '~/components/ui/badge'
import { UserAvatar } from '~/components/UserAvatar'
import { FieldTypeEnum } from '~/constants/form'
import type { UserListItemDto } from '~/lib/api/generated/types.gen'
import { formatDate } from '~/utils/date'

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
        <div className="flex items-center gap-2">
          <UserAvatar avatarUrl={row.original.avatarUrl} />

          <div className="flex flex-col gap-0.5">
            <div className="font-medium">
              {row.original.name ?? '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.email}
            </div>
          </div>
        </div>
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
