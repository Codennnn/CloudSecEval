'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { ProTable, type ProTableProps } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import type { RolesControllerGetRoleMembersData, UserListItemDto } from '~/lib/api/generated/types.gen'

import { createUserColumns } from '~admin/components/member/userTableColumns'
import { rolesControllerGetRoleMembersOptions, rolesControllerGetRoleMembersQueryKey } from '~api/@tanstack/react-query.gen'
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

  return (
    <div className="py-admin-content pr-admin-content">
      <ProTable<UserListItemDto>
        columns={columns}
        data={membersQuery.data?.data ?? []}
        headerTitle="角色成员"
        loading={membersQuery.isLoading}
        pagination={membersQuery.data?.pagination}
        toolbar={{
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
