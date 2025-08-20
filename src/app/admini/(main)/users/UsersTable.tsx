'use client'

import { useMemo, useState } from 'react'

import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  EllipsisVerticalIcon,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { UserAvatar } from '~/components/UserAvatar'
import { FieldTypeEnum } from '~/constants/form'
import type { UserData } from '~/lib/api/types'
import { formatDate } from '~/utils/date'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { usersControllerFindAllUsersOptions, usersControllerFindAllUsersQueryKey, usersControllerRemoveUserMutation } from '~api/@tanstack/react-query.gen'

export function UsersTable() {
  const queryClient = useQueryClient()

  const [queryKey, setQueryKey] = useState<QueryKey>()

  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)

  const deleteUserMutation = useMutation({
    ...usersControllerRemoveUserMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const handleDeleteClick = (user: UserData) => {
    setUserToDelete(user)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await deleteUserMutation.mutateAsync({
        path: {
          id: userToDelete.id,
        },
      })
      toast.success(`用户 ${userToDelete.email} 已成功删除`)
      setUserToDelete(null)
    }
  }

  // MARK: 表格列定义
  const columns = useMemo<TableColumnDef<UserData>[]>(() => {
    return [
      {
        id: 'user',
        accessorKey: 'user',
        header: '用户',
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
          <div className="text-sm">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
                variant="ghost"
              >
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => {
                  // TODO: 实现查看详情功能
                  // 暂时使用 row.original.id 来避免 ESLint 警告
                  void row.original.id
                }}
              >
                查看详情
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  // TODO: 实现编辑功能
                  // 暂时使用 row.original.id 来避免 ESLint 警告
                  void row.original.id
                }}
              >
                编辑
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  handleDeleteClick(row.original)
                }}
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ]
  }, [])

  return (
    <div className="p-admin-content">
      <ProTable<UserData>
        columns={columns}
        headerTitle="用户列表"
        queryKeyFn={usersControllerFindAllUsersQueryKey as QueryKeyFn}
        queryOptionsFn={usersControllerFindAllUsersOptions as QueryOptionsFn<UserData>}
        toolbar={{
          rightContent: (
            <Button
              size="sm"
              onClick={() => {
                // TODO: 实现新增用户功能
                toast.info('新增用户功能开发中...')
              }}
            >
              <Plus />
              新增用户
            </Button>
          ),
        }}
        onQueryKeyChange={setQueryKey}
      />

      {/* MARK: 删除确认对话框 */}
      <DeleteConfirmDialog
        confirmText="DELETE"
        deleteButtonText="确认删除"
        description={
          userToDelete
            ? (
                <div>
                  你即将删除：
                  <ul className="list-disc list-inside space-y-1.5 py-2">
                    <li>
                      邮箱：
                      <span className="text-muted-foreground">
                        {userToDelete.email}
                      </span>
                    </li>
                    {userToDelete.name && (
                      <li>
                        姓名：
                        <span className="text-muted-foreground">
                          {userToDelete.name}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )
            : null
        }
        isDeleting={deleteUserMutation.isPending}
        open={!!userToDelete}
        title="删除用户"
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(null)
          }
        }}
      />
    </div>
  )
}
