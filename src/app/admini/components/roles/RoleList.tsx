'use client'

import { useEffect, useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EllipsisVerticalIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '~/components/ui/sidebar'
import { Skeleton } from '~/components/ui/skeleton'
import type { RoleListItemDto } from '~/lib/api/generated/types.gen'
import { cn } from '~/lib/utils'

import { RoleDialog, type RoleDialogMode } from './RoleDialog'

import { rolesControllerFindAllOptions, rolesControllerFindAllQueryKey, rolesControllerRemoveMutation } from '~api/@tanstack/react-query.gen'

interface RoleListProps {
  readonly onSelect: (roleId: string) => void
  readonly selectedRoleId?: string | null
}

export function RoleList(props: RoleListProps) {
  const { onSelect, selectedRoleId } = props

  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<RoleDialogMode>('create')
  const [editingRole, setEditingRole] = useState<RoleListItemDto | null>(null)
  // 删除操作不再需要二次确认，直接执行删除

  const queryOptions = useMemo(() => ({
    page: 1,
    pageSize: 10,
    includeSystem: 'false',
  }), [])

  const rolesQuery = useQuery({
    ...rolesControllerFindAllOptions({
      query: queryOptions,
    }),
  })

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: rolesControllerFindAllQueryKey({ query: queryOptions }),
    })
  }

  const deleteMutation = useMutation({
    ...rolesControllerRemoveMutation(),
    onSuccess: () => {
      void handleRefresh()
      toast.success('角色已删除')
    },
  })

  const roles = useMemo(() => {
    return rolesQuery.data?.data ?? []
  }, [rolesQuery.data])

  // 当角色列表加载完成后，如果未选择或已选角色已不存在，则默认选择第一个角色
  useEffect(() => {
    if (rolesQuery.isSuccess) {
      const hasValidSelected = (selectedRoleId !== null && selectedRoleId !== undefined)
        && roles.some((item) => {
          return item.id === selectedRoleId
        })

      if (!hasValidSelected && roles.length > 0) {
        onSelect(roles[0].id)
      }
    }
  }, [rolesQuery.isSuccess, roles, selectedRoleId, onSelect])

  const handleCreate = () => {
    setDialogMode('create')
    setEditingRole(null)
    setDialogOpen(true)
  }

  const handleEdit = (role: RoleListItemDto) => {
    if (role.system) {
      return
    }

    setDialogMode('edit')
    setEditingRole(role)
    setDialogOpen(true)
  }

  const handleDelete = async (role: RoleListItemDto) => {
    if (role.system) {
      return
    }

    await deleteMutation.mutateAsync({
      path: { id: role.id },
    })
  }

  const handleSuccess = () => {
    void handleRefresh()
  }

  const renderBadge = (role: RoleListItemDto) => {
    if (role.system) {
      return (
        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">系统</span>
      )
    }

    if (!role.isActive) {
      return (
        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">禁用</span>
      )
    }

    return null
  }

  const handleItemClick = (roleId: string) => {
    onSelect(roleId)
  }

  return (
    <div className="w-72 shrink-0 overflow-y-auto border-r">
      <div className="flex items-center justify-between p-admin-content">
        <div className="font-medium">角色列表</div>

        <Button size="sm" onClick={handleCreate}>
          <Plus />
          新增角色
        </Button>
      </div>

      <div
        className={cn(
          '[--sidebar-accent:var(--secondary)] [--sidebar-accent-foreground:var(--secondary-foreground)]',
          'space-y-1 p-admin-content pt-0',
        )}
      >
        {rolesQuery.isLoading
          ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-md border p-3">
                    <Skeleton className="h-9 w-9 rounded" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                ))}
              </div>
            )
          : (
              roles.map((role) => (
                <SidebarMenuItem key={role.id}>
                  <SidebarMenuButton
                    asChild
                    className="h-auto"
                    isActive={selectedRoleId === role.id}
                    onClick={() => {
                      handleItemClick(role.id)
                    }}
                  >
                    <div>
                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2 text-sm font-medium">
                          {role.name}
                          {renderBadge(role)}
                        </div>

                        <div className="truncate text-xs text-muted-foreground">{role.slug}</div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction
                            asChild
                            showOnHover
                            className="data-[state=open]:bg-muted rounded-sm"
                          >
                            <div>
                              <EllipsisVerticalIcon className="!size-3.5" />
                              <span className="sr-only">更多</span>
                            </div>
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          side="right"
                          onClick={(ev) => {
                            ev.stopPropagation()
                          }}
                        >
                          <DropdownMenuItem
                            disabled={role.system}
                            onClick={() => {
                              handleEdit(role)
                            }}
                          >
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={role.system}
                            variant="destructive"
                            onClick={() => {
                              void handleDelete(role)
                            }}
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
      </div>

      {/* 角色创建/编辑 */}
      <RoleDialog
        mode={dialogMode}
        open={dialogOpen}
        role={editingRole}
        onClose={() => {
          setDialogOpen(false)
          setEditingRole(null)
        }}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
