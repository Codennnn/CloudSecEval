'use client'

import { DepartmentTree } from '~admin/components/department/DepartmentTree'
import { useUser } from '~admin/stores/useUserStore'

export function UsersSide() {
  const user = useUser()

  if (user) {
    return <DepartmentTree orgId={user.orgId} />
  }

  return null
}
