'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  EllipsisVerticalIcon,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'

import { ProTable, type ProTableProps } from '~/components/table/ProTable'
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
import type {
  DepartmentsControllerGetDepartmentMembersData,
  UserListItemDto,
} from '~/lib/api/generated/types.gen'
import type { DepartmentId } from '~/lib/api/types'
import { formatDate } from '~/utils/date'

import { MemberDialog, type MemberDialogMode } from './MemberDialog'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import {
  departmentsControllerGetDepartmentMembersOptions,
  departmentsControllerGetDepartmentMembersQueryKey,
  usersControllerRemoveUserMutation,
} from '~api/@tanstack/react-query.gen'
import type { Options } from '~api/sdk.gen'

interface DepartmentMembersTableProps {
  departmentId: DepartmentId
  includeChildren?: boolean
}

export function DepartmentMembersTable(props: DepartmentMembersTableProps) {
  const {
    departmentId,
    includeChildren = false,
  } = props

  const queryClient = useQueryClient()

  const [userToDelete, setUserToDelete] = useState<UserListItemDto | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<MemberDialogMode>('create')
  const [editingUser, setEditingUser] = useState<UserListItemDto | null>(null)

  const [queryOptions, setQueryOptions]
  = useState<Options<DepartmentsControllerGetDepartmentMembersData>>()

  useEffect(() => {
    if (departmentId) {
      setQueryOptions((prev) => ({
        ...prev,
        path: { departmentId },
        query: {
          page: 1,
          pageSize: 10,
          ...prev?.query,
          includeChildren,
        },
      }))
    }
  }, [departmentId, includeChildren])

  const membersQuery = useQuery({
    ...departmentsControllerGetDepartmentMembersOptions(queryOptions!),
    enabled: Boolean(queryOptions),
  })

  const handleRefresh = useEvent(() => {
    if (queryOptions) {
      const queryKey = departmentsControllerGetDepartmentMembersQueryKey(queryOptions)
      void queryClient.invalidateQueries({
        queryKey,
      })
    }
  })

  const deleteUserMutation = useMutation({
    ...usersControllerRemoveUserMutation(),
    onSuccess: () => {
      handleRefresh()
    },
  })

  const handleDeleteClick = (user: UserListItemDto) => {
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
  const columns = useMemo<TableColumnDef<UserListItemDto>[]>(() => {
    return [
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
                  setDialogMode('edit')
                  setEditingUser(row.original)
                  setDialogOpen(true)
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

  const handlePaginationChange = useEvent<
    NonNullable<ProTableProps<UserListItemDto>['onPaginationChange']>
  >(
    (pagination) => {
      setQueryOptions((prev) => {
        if (prev) {
          return {
            ...prev,
            query: {
              ...prev.query,
              page: pagination.pageIndex + 1,
              pageSize: pagination.pageSize,
            },
          }
        }

        return prev
      })
    },
  )

  return (
    <div className="py-admin-content pr-admin-content">
      <ProTable<UserListItemDto>
        columns={columns}
        data={membersQuery.data?.data ?? []}
        headerTitle={`部门成员${includeChildren ? '（含子部门）' : ''}`}
        loading={membersQuery.isLoading}
        pagination={membersQuery.data?.pagination}
        toolbar={{
          rightContent: (
            <Button
              size="sm"
              onClick={() => {
                setDialogMode('create')
                setEditingUser(null)
                setDialogOpen(true)
              }}
            >
              <Plus />
              添加成员
            </Button>
          ),
          showSearch: false, // 禁用搜索，因为使用外部数据
        }}
        onPaginationChange={handlePaginationChange}
        onRefresh={handleRefresh}
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

      {/* MARK: 成员创建/编辑对话框 */}
      <MemberDialog
        departmentId={departmentId}
        mode={dialogMode}
        open={dialogOpen}
        user={editingUser}
        onClose={() => {
          setDialogOpen(false)
          setEditingUser(null)
        }}
        onSuccess={() => {
          handleRefresh()
        }}
      />
    </div>
  )
}
