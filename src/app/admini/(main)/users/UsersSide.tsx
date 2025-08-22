'use client'

import type { DepartmentId } from '~/lib/api/types'

import { DepartmentTree } from '~admin/components/department/DepartmentTree'
import { useUser } from '~admin/stores/useUserStore'

export interface UsersSideProps {
  onDepartmentSelect?: (departmentIds: DepartmentId[]) => void
}

export function UsersSide(props: UsersSideProps) {
  const { onDepartmentSelect } = props

  const user = useUser()

  if (user) {
    return (
      <DepartmentTree
        orgId={user.organization.id}
        selectable="single"
        onSelect={(selectedIds) => {
          // 当选中部门时，调用回调函数
          onDepartmentSelect?.(selectedIds)
        }}
      />
    )
  }

  return null
}
