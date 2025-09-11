'use client'

import { useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { CardBox, CardBoxContent, CardBoxHeader, CardBoxTitle } from '~/components/ui-common/CardBox'

import { RoleBasicInfo } from './RoleBasicInfo'
import { RoleDialog } from './RoleDialog'
import { RolePermissionsInfo } from './RolePermissionsInfo'

import { rolesControllerFindOneOptions, rolesControllerFindOneQueryKey } from '~api/@tanstack/react-query.gen'

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
              ? <RolePermissionsInfo role={roleData} />
              : <RoleInfoSkeleton />
          }
        </CardBoxContent>
      </CardBox>

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
