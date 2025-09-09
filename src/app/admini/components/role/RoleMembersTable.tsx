'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ProTable, type ProTableProps } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { Button } from '~/components/ui/button'

import { openMemberSelectDialog } from '../member-select/MemberSelectDialog'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { createUserColumns } from '~admin/components/member/userTableColumns'
import { rolesControllerAddRoleMembersMutation, rolesControllerGetRoleMembersOptions, rolesControllerGetRoleMembersQueryKey, rolesControllerRemoveRoleMembersMutation } from '~api/@tanstack/react-query.gen'
import type { Options } from '~api/sdk.gen'
import type { RolesControllerGetRoleMembersData, UserListItemDto } from '~api/types.gen'

interface RoleMembersTableProps {
  readonly roleId: string
}

// 删除确认弹框状态
interface RemoveConfirmState {
  open: boolean
  userIds: string[]
  description?: React.ReactNode
  afterConfirm?: () => void
}

export function RoleMembersTable(props: RoleMembersTableProps) {
  const { roleId } = props

  const queryClient = useQueryClient()

  const [queryOptions, setQueryOptions]
  = useState<Options<RolesControllerGetRoleMembersData>>()

  // 二次确认弹框本地状态
  const [removeConfirmState, setRemoveConfirmState] = useState<RemoveConfirmState>({
    open: false,
    userIds: [],
  })

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

  /**
   * 执行后端移除成员请求
   * - 接收用户 ID 列表
   * - 请求成功后触发列表刷新由 onSuccess 统一处理
   */
  const handleRemoveMember = useEvent(async (userIds: string[]) => {
    await removeMembersMutation.mutateAsync({
      body: { userIds },
      path: { id: roleId },
    })
  })

  /**
   * 打开单个成员移除的二次确认弹框
   * - 生成用户信息描述，提升操作可理解性
   */
  const handleOpenRemoveConfirm = useEvent((user: UserListItemDto) => {
    const description = (
      <div>
        你即将把以下成员从当前角色中移除：
        <ul className="list-disc list-inside space-y-1.5 py-2">
          <li>
            邮箱：
            <span className="text-muted-foreground">{user.email}</span>
          </li>
          {user.name && (
            <li>
              姓名：
              <span className="text-muted-foreground">{user.name}</span>
            </li>
          )}
        </ul>
        移除后，该成员将不再继承该角色的权限。
      </div>
    )

    setRemoveConfirmState({
      open: true,
      userIds: [user.id],
      description,
    })
  })

  /**
   * 打开批量成员移除的二次确认弹框
   * - 显示被移除的成员数量与关键信息列表
   * - 支持在确认后执行额外操作（例如清空选择）
   */
  const handleOpenRemoveConfirmForMany = useEvent((users: UserListItemDto[], after?: () => void) => {
    const description = (
      <div>
        你即将把以下
        {' '}
        {users.length}
        {' '}
        个成员从当前角色中移除：
        <ul className="list-disc list-inside space-y-1.5 py-2 max-h-48 overflow-auto">
          {users.map((u) => (
            <li key={u.id}>
              <span className="text-muted-foreground">{u.email}</span>
              {u.name
                ? (
                    <>
                      {' '}
                      · 姓名：
                      <span className="text-muted-foreground">{u.name}</span>
                    </>
                  )
                : null}
            </li>
          ))}
        </ul>
        移除后，这些成员将不再继承该角色的权限。
      </div>
    )

    const userIds = users.map((u) => u.id)

    setRemoveConfirmState({
      open: true,
      userIds,
      description,
      afterConfirm: after,
    })
  })

  /**
   * 确认移除：仅在用户点击确认后执行
   * - 调用后端接口移除成员
   * - 成功后执行 afterConfirm（如清空选择）并关闭弹框
   * - 失败时提示错误信息
   */
  const handleConfirmRemove = useEvent(async () => {
    if (removeConfirmState.open) {
      try {
        await handleRemoveMember(removeConfirmState.userIds)

        if (removeConfirmState.afterConfirm) {
          removeConfirmState.afterConfirm()
        }
      }
      catch {
        toast.error('移除成员失败，请稍后重试')
      }
      finally {
        setRemoveConfirmState({ open: false, userIds: [] })
      }
    }
  })

  const handleAddMember = useEvent(async () => {
    const disabledIds = (membersQuery.data?.data ?? []).map((u) => u.id)

    const selected = await openMemberSelectDialog({
      title: '选择要添加的成员',
      mode: 'multiple',
      disabledIds,
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
                      handleOpenRemoveConfirmForMany(selectedRows, () => {
                        clearSelection()
                      })
                    }
                  }}
                >
                  移除成员
                </Button>
              </div>
            </div>
          ),
        }}
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

      {/* 二次确认弹框：仅在用户点击确认后执行实际删除 */}
      <DeleteConfirmDialog
        confirmText="DELETE"
        deleteButtonText="确认移除"
        description={removeConfirmState.description}
        isDeleting={isRemovingMembers}
        open={removeConfirmState.open}
        title="移除成员"
        onConfirm={handleConfirmRemove}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveConfirmState({ open: false, userIds: [] })
          }
          else {
            setRemoveConfirmState((prev) => ({ ...prev, open }))
          }
        }}
      />
    </div>
  )
}
