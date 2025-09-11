'use client'

import { useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { PermissionSelect } from '~/components/permission/PermissionSelect'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import { CardBox, CardBoxContent, CardBoxHeader, CardBoxTitle } from '~/components/ui-common/CardBox'

import { RoleBasicInfo } from './RoleBasicInfo'
import { RoleDialog } from './RoleDialog'
import { RolePermissionsInfo } from './RolePermissionsInfo'

import { rolesControllerFindOneOptions, rolesControllerFindOneQueryKey, rolesControllerUpdateMutation } from '~api/@tanstack/react-query.gen'

function RoleInfoSkeleton() {
  const SkeletonItem = () => (
    <div className="space-y-2.5">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-6 w-full" />
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
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

  const queryOptions = useMemo(() => ({
    path: { id: roleId },
  }), [roleId])

  const { data, isLoading } = useQuery({
    ...rolesControllerFindOneOptions(queryOptions),
  })

  const roleData = data?.data

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: rolesControllerFindOneQueryKey(queryOptions),
    })
  }

  const updateRolePermissionsMutation = useMutation({
    ...rolesControllerUpdateMutation(),
    onSuccess: () => {
      void handleRefresh()
      toast.success('角色权限已更新')
    },
  })

  const currentPermissionIds = useMemo(() => {
    if (!roleData?.rolePermissions) {
      return []
    }

    return roleData.rolePermissions.map((rp) => rp.permission.id)
  }, [roleData?.rolePermissions])

  const handleEditSuccess = () => {
    void handleRefresh()
    toast.success('角色信息已更新')
  }

  const handlePermissionChange = (permissionIds: string[]) => {
    if (roleData) {
      updateRolePermissionsMutation.mutate({
        path: { id: roleId },
        body: {
          permissionIds,
        },
      })
    }
  }

  const isLoaded = !isLoading && roleData

  return (
    <div className="space-y-admin-content">
      <CardBox>
        <CardBoxHeader className="flex flex-row items-center justify-between space-y-0">
          <CardBoxTitle className="flex items-center gap-2">
            角色信息
          </CardBoxTitle>
          <Button
            disabled={roleData?.system}
            size="sm"
            variant="outline"
            onClick={() => { setEditDialogOpen(true) }}
          >
            编辑
          </Button>
        </CardBoxHeader>

        <CardBoxContent>
          {
            isLoaded
              ? <RoleBasicInfo role={roleData} />
              : <RoleInfoSkeleton />
          }
        </CardBoxContent>
      </CardBox>

      <CardBox>
        <CardBoxHeader className="gap-0">
          <CardBoxTitle className="flex items-center gap-2">
            权限信息
          </CardBoxTitle>
        </CardBoxHeader>

        <CardBoxContent>
          {
            isLoaded
              ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">权限配置</Label>

                      <PermissionSelect
                        groupByResource
                        showDescription
                        disabled={updateRolePermissionsMutation.isPending}
                        mode="multiple"
                        placeholder="请选择权限"
                        value={currentPermissionIds}
                        onChange={handlePermissionChange}
                      />
                    </div>

                    <RolePermissionsInfo role={roleData} />
                  </div>
                )
              : <RoleInfoSkeleton />
          }
        </CardBoxContent>
      </CardBox>

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
