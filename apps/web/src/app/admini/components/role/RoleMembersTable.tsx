'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ProTable, type ProTableProps, type ProTableRef } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { Button } from '~/components/ui/button'

import { createUserColumns } from '~admin/components/member/userTableColumns'
import { openMemberSelectDialog } from '~admin/components/member-select/MemberSelectDialog'
import { useSimpleConfirmDialog } from '~admin/stores/useSimpleConfirmDialogStore'
import { rolesControllerAddRoleMembersMutation, rolesControllerGetRoleMembersOptions, rolesControllerGetRoleMembersQueryKey, rolesControllerRemoveRoleMembersMutation } from '~api/@tanstack/react-query.gen'
import type { Options } from '~api/sdk.gen'
import type { RolesControllerGetRoleMembersData, UserListItemDto } from '~api/types.gen'

interface RoleMembersTableProps {
  roleId: string
}

export function RoleMembersTable(props: RoleMembersTableProps) {
  const { roleId } = props

  const queryClient = useQueryClient()

  const tableRef = useRef<ProTableRef<UserListItemDto>>(null)

  const [queryOptions, setQueryOptions]
    = useState<Options<RolesControllerGetRoleMembersData>>()

  const { showConfirmDialog } = useSimpleConfirmDialog()

  useEffect(() => {
    if (roleId) {
      setQueryOptions((prev) => ({
        ...prev,
        path: { id: roleId },
        query: {
          page: 1,
          pageSize: 10,
          ...prev?.query,
        },
      }))
    }
  }, [roleId])

  const membersQuery = useQuery({
    ...rolesControllerGetRoleMembersOptions(queryOptions!),
    enabled: Boolean(queryOptions),
  })

  const handleRefresh = useEvent(() => {
    if (queryOptions) {
      const queryKey = rolesControllerGetRoleMembersQueryKey(queryOptions)
      void queryClient.invalidateQueries({ queryKey })
    }
  })

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

  const addMembersMutation = useMutation({
    ...rolesControllerAddRoleMembersMutation(),
    onSuccess: () => {
      toast.success('已添加所选成员')
      handleRefresh()
    },
  })

  const { isPending: isRemovingMembers, ...removeMembersMutation } = useMutation({
    ...rolesControllerRemoveRoleMembersMutation(),
    onSuccess: () => {
      toast.success('已从角色中移除所选成员')
      handleRefresh()
    },
  })

  const handleRemoveMember = useEvent(async (userIds: string[]) => {
    await removeMembersMutation.mutateAsync({
      body: { userIds },
      path: { id: roleId },
    })

    // 移除成功后清除表格选择
    tableRef.current?.clearSelection()
  })

  const handleOpenRemoveConfirm = useEvent(
    (users: UserListItemDto | UserListItemDto[], after?: () => void) => {
      // 统一处理为数组格式
      const userList = Array.isArray(users) ? users : [users]
      const isMultiple = userList.length > 1

      // 根据用户数量生成相应的描述内容
      const description = (
        <div>
          你即将把以下
          {isMultiple && (
            <>
              {' '}
              <span className="font-medium">{userList.length}</span>
              {' '}
            </>
          )}
          {isMultiple ? '个成员' : '成员'}
          从当前角色中移除：
          <ul className="list-disc list-inside space-y-1.5 py-2 max-h-48 overflow-auto">
            {userList.map((user) => (
              <li key={user.id}>
                邮箱：
                <span className="text-muted-foreground">{user.email}</span>
                {user.name && (
                  <>
                    {' '}
                    · 姓名：
                    <span className="text-muted-foreground">{user.name}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
          移除后，
          {isMultiple ? '这些成员' : '该成员'}
          将不再继承该角色的权限。
        </div>
      )

      const userIds = userList.map((user) => user.id)
      const title = isMultiple ? '批量移除成员' : '移除成员'

      showConfirmDialog({
        title,
        description,
        confirmButtonText: '确认移除',
        variant: 'destructive',
        onConfirm: async () => {
          await handleRemoveMember(userIds)
          after?.()
        },
      })
    },
  )

  const handleAddMember = useEvent(async () => {
    const selected = await openMemberSelectDialog({
      title: '选择要添加的成员',
      mode: 'multiple',
      value: membersQuery.data?.data,
    })

    if (selected && selected.length > 0) {
      const userIds = selected.map((u) => u.id)

      try {
        await addMembersMutation.mutateAsync({
          body: { userIds },
          path: { id: roleId },
        })
      }
      catch {
        // 可按需接入全局提示，这里保持静默失败，不阻断用户操作
      }
    }
  })

  const columns = useMemo<TableColumnDef<UserListItemDto>[]>(() => {
    return [
      ...createUserColumns(),
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => {
          const user = row.original

          return (
            <div className="flex items-center gap-1.5">
              <Button
                disabled={isRemovingMembers}
                size="iconNormal"
                variant="ghost"
                onClick={() => {
                  handleOpenRemoveConfirm(user)
                }}
              >
                <TrashIcon />
              </Button>
            </div>
          )
        },
      },
    ]
  }, [handleOpenRemoveConfirm, isRemovingMembers])

  return (
    <div className="py-admin-content pr-admin-content">
      <ProTable<UserListItemDto>
        columns={columns}
        data={membersQuery.data?.data ?? []}
        headerTitle="角色成员"
        loading={membersQuery.isLoading}
        pagination={membersQuery.data?.pagination}
        paginationConfig={{
          showPageSizeSelector: true,
          showSelection: true,
        }}
        rowSelection={{
          enabled: true,
          getRowId: (row) => row.id,
        }}
        selectionToolbar={{
          render: ({ selectedCount, selectedRows, clearSelection }) => (
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span>已选择</span>
                <span className="font-medium tabular-nums">{selectedCount}</span>
                <span>个成员</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { clearSelection() }}
                >
                  清除选择
                </Button>

                <Button
                  disabled={isRemovingMembers}
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (selectedRows.length > 0) {
                      handleOpenRemoveConfirm(selectedRows)
                    }
                  }}
                >
                  移除成员
                </Button>
              </div>
            </div>
          ),
        }}
        tableRef={tableRef}
        toolbar={{
          rightContent: (
            <>
              <Button
                disabled={addMembersMutation.isPending}
                size="sm"
                onClick={() => { void handleAddMember() }}
              >
                <PlusIcon />
                添加成员
              </Button>
            </>
          ),
          search: {
            inputProps: {
              placeholder: '搜索邮箱、姓名',
            },
          },
        }}
        onPaginationChange={handlePaginationChange}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
