'use client'

import { useState } from 'react'

import { Separator } from '~/components/ui/separator'

import { DepartmentMembersTable } from '~admin/components/department/DepartmentMembersTable'
import { DepartmentTree } from '~admin/components/department/DepartmentTree'
import type { DepartmentTreeProps } from '~admin/components/department/types'
import { useUser } from '~admin/stores/useUserStore'

export function UserPage() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>()

  const user = useUser()

  const handleDepartmentSelect: NonNullable<DepartmentTreeProps['onSelect']> = (departmentIds) => {
    const departmentId = departmentIds.at(0)

    if (departmentId) {
      setSelectedDepartmentId(departmentId)
    }
    else {
      setSelectedDepartmentId(undefined)
    }
  }

  return (
    <div className="flex h-full">
      {user && (
        <DepartmentTree
          orgId={user.organization.id}
          selectable="single"
          onSelect={handleDepartmentSelect}
        />
      )}

      <Separator
        orientation="vertical"
      />

      <div className="flex-1 overflow-y-auto p-admin-content">
        <DepartmentMembersTable
          departmentId={selectedDepartmentId}
          includeChildren={false}
        />
      </div>
    </div>
  )
}
