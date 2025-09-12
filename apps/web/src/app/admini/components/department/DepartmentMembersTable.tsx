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
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import type { DepartmentId } from '~/lib/api/types'
import { isCrowdTest } from '~/utils/platform'

import { MemberDialog, type MemberDialogMode } from './MemberDialog'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import { createUserColumns } from '~admin/components/member/userTableColumns'
import {
  departmentsControllerGetDepartmentMembersOptions,
  departmentsControllerGetDepartmentMembersQueryKey,
  organizationsControllerGetOrganizationMembersOptions,
  organizationsControllerGetOrganizationMembersQueryKey,
  usersControllerRemoveUserMutation,
} from '~api/@tanstack/react-query.gen'
import type { Options } from '~api/sdk.gen'
import type {
  DepartmentsControllerGetDepartmentMembersData,
  OrganizationsControllerGetOrganizationMembersData,
  UserListItemDto,
} from '~api/types.gen'

/**
 * 成员表格组件
 * - 当传入 `departmentId` 时：查询指定部门（可选包含子部门）成员
 * - 未传入 `departmentId` 时：查询当前组织的成员
 */
interface DepartmentMembersTableProps {
  departmentId?: DepartmentId
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

  // 部门成员查询参数（当有 departmentId 时启用）
  const [departmentQueryOptions, setDepartmentQueryOptions]
    = useState<Options<DepartmentsControllerGetDepartmentMembersData>>()

  // 组织成员查询参数（当无 departmentId 时启用）
  const [organizationQueryOptions, setOrganizationQueryOptions]
    = useState<Options<OrganizationsControllerGetOrganizationMembersData>>()

  useEffect(() => {
    if (departmentId) {
      // 切换到部门查询
      setOrganizationQueryOptions(undefined)
      setDepartmentQueryOptions((prev) => ({
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
    else {
      // 切换到组织查询
      setDepartmentQueryOptions(undefined)
      setOrganizationQueryOptions((prev) => ({
        ...prev,
        query: {
          page: 1,
          pageSize: 10,
          ...prev?.query,
        },
      }))
    }
  }, [departmentId, includeChildren])

  // 部门成员查询
  const departmentMembersQuery = useQuery({
    ...departmentsControllerGetDepartmentMembersOptions(
      (departmentQueryOptions
        ?? ({
          path: { departmentId: '' as DepartmentId },
          query: { page: 1, pageSize: 10 },
        } as Options<DepartmentsControllerGetDepartmentMembersData>)
      ),
    ),
    enabled: Boolean(departmentQueryOptions),
  })

  // 组织成员查询
  const organizationMembersQuery = useQuery({
    ...organizationsControllerGetOrganizationMembersOptions(organizationQueryOptions),
    enabled: Boolean(organizationQueryOptions),
  })

  // 统一表格所需的数据源
  const tableData = departmentId
    ? (departmentMembersQuery.data?.data ?? [])
    : (organizationMembersQuery.data?.data ?? [])

  const tablePagination = departmentId
    ? departmentMembersQuery.data?.pagination
    : organizationMembersQuery.data?.pagination

  const tableLoading = departmentId
    ? departmentMembersQuery.isLoading
    : organizationMembersQuery.isLoading

  const handleRefresh = useEvent(() => {
    if (departmentId && departmentQueryOptions) {
      const queryKey
        = departmentsControllerGetDepartmentMembersQueryKey(departmentQueryOptions)
      void queryClient.invalidateQueries({ queryKey })
    }
    else if (!departmentId && organizationQueryOptions) {
      const queryKey
        = organizationsControllerGetOrganizationMembersQueryKey(organizationQueryOptions)
      void queryClient.invalidateQueries({ queryKey })
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
    const base = createUserColumns()

    return [
      ...base,
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
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
      if (departmentId) {
        setDepartmentQueryOptions((prev) => {
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
      }
      else {
        setOrganizationQueryOptions((prev) => {
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
      }
    },
  )

  return (
    <div>
      <ProTable<UserListItemDto>
        columns={columns}
        data={tableData}
        headerTitle={
          departmentId
            ? `${isCrowdTest() ? '团队' : '部门'}成员${includeChildren ? `（含子${isCrowdTest() ? '团队' : '部门'}）` : ''}`
            : '组织成员'
        }
        loading={tableLoading}
        pagination={tablePagination}
        toolbar={{
          search: {
            inputProps: {
              placeholder: '搜索邮箱、姓名',
            },
          },
          rightContent: departmentId
            ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setDialogMode('create')
                    setEditingUser(null)
                    setDialogOpen(true)
                  }}
                >
                  <Plus />
                  创建成员
                </Button>
              )
            : null,
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
