'use client'

import { useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Shield, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

import { RoleBasicInfo } from './RoleBasicInfo'
import { RoleDialog } from './RoleDialog'
import { RolePermissionsInfo } from './RolePermissionsInfo'

import { rolesControllerFindOneOptions, rolesControllerFindOneQueryKey } from '~api/@tanstack/react-query.gen'

function RoleDetailsSkeleton() {
  return (
    <div className="space-y-6" data-testid="role-details-skeleton">
      {/* 基础信息卡片骨架 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-16" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 权限信息卡片骨架 */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface RoleDetailsProps {
  roleId: string
}

export function RoleDetails(props: RoleDetailsProps) {
  const { roleId } = props

  const queryClient = useQueryClient()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const roleQuery = useQuery({
    ...rolesControllerFindOneOptions({
      path: { id: roleId },
    }),
  })

  const { data, isLoading } = roleQuery
  const roleData = data?.data

  const handleEditSuccess = () => {
    void queryClient.invalidateQueries({
      queryKey: rolesControllerFindOneQueryKey({ path: { id: roleId } }),
    })
    toast.success('角色信息已更新')
  }

  if (isLoading || !roleData) {
    return <RoleDetailsSkeleton />
  }

  return (
    <div className="space-y-admin-content" data-testid="role-details-content">
      {/* 基础信息卡片 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              角色信息
            </CardTitle>
            <CardDescription>
              查看和管理角色的基础信息
            </CardDescription>
          </div>
          <Button
            disabled={roleData.system}
            size="sm"
            variant="outline"
            onClick={() => { setEditDialogOpen(true) }}
          >
            <Edit className="size-4 mr-2" />
            编辑
          </Button>
        </CardHeader>
        <CardContent>
          <RoleBasicInfo role={roleData} />
        </CardContent>
      </Card>

      {/* 权限信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            权限信息
          </CardTitle>
          <CardDescription>
            该角色拥有的权限列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RolePermissionsInfo role={roleData} />
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <RoleDialog
        mode="edit"
        open={editDialogOpen}
        role={roleData}
        onClose={() => { setEditDialogOpen(false) }}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
