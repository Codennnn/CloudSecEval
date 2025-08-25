'use client'

import { useState } from 'react'

import { DepartmentMembersTable } from '~admin/components/department/DepartmentMembersTable'
import { DepartmentTree } from '~admin/components/department/DepartmentTree'
import type { DepartmentTreeProps } from '~admin/components/department/types'
import { useUser } from '~admin/stores/useUserStore'

export function UserPage() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)

  const user = useUser()

  const handleDepartmentSelect: NonNullable<DepartmentTreeProps['onSelect']> = (departmentIds) => {
    const departmentId = departmentIds.at(0)

    if (departmentId) {
      setSelectedDepartmentId(departmentId)
    }
  }

  return (
    <div className="flex gap-admin-content h-full">
      {user && (
        <DepartmentTree
          orgId={user.organization.id}
          selectable="single"
          onSelect={handleDepartmentSelect}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {selectedDepartmentId
          && (
            <DepartmentMembersTable
              departmentId={selectedDepartmentId}
              includeChildren={false}
            />
          )}
      </div>
    </div>
  )
}
