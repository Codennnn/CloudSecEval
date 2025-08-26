'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ProTable, type ProTableProps } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { Button } from '~/components/ui/button'
import type { RolesControllerGetRoleMembersData, UserListItemDto } from '~/lib/api/generated/types.gen'

import { openMemberSelectDialog } from '../member-select/MemberSelectDialog'

import { createUserColumns } from '~admin/components/member/userTableColumns'
import { rolesControllerAddRoleMembersMutation, rolesControllerGetRoleMembersOptions, rolesControllerGetRoleMembersQueryKey, rolesControllerRemoveRoleMembersMutation } from '~api/@tanstack/react-query.gen'
import type { Options } from '~api/sdk.gen'

interface RoleMembersTableProps {
  readonly roleId: string
}

export function RoleMembersTable(props: RoleMembersTableProps) {
  const { roleId } = props

  const queryClient = useQueryClient()

  const [queryOptions, setQueryOptions]
  = useState<Options<RolesControllerGetRoleMembersData>>()

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

  const columns = useMemo<TableColumnDef<UserListItemDto>[]>(() => {
    return createUserColumns()
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

  const addMembersMutation = useMutation({
    ...rolesControllerAddRoleMembersMutation(),
    onSuccess: () => {
      toast.success('已添加所选成员')
      handleRefresh()
    },
  })
  const removeMembersMutation = useMutation({
    ...rolesControllerRemoveRoleMembersMutation(),
    onSuccess: () => {
      toast.success('已从角色中移除所选成员')
      handleRefresh()
    },
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
                  disabled={removeMembersMutation.isPending}
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    void (async () => {
                      const userIds = selectedRows.map((u) => u.id)

                      if (userIds.length > 0) {
                        try {
                          await removeMembersMutation.mutateAsync({
                            body: { userIds },
                            path: { id: roleId },
                          })
                          clearSelection()
                        }
                        catch {
                          toast.error('移除成员失败，请稍后重试')
                        }
                      }
                    })()
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
    </div>
  )
}
