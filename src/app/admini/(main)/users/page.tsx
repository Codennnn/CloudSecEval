'use client'

import { useState } from 'react'

import { UsersSide, type UsersSideProps } from './UsersSide'

import { DepartmentMembersTable } from '~admin/components/department/DepartmentMembersTable'

export default function UserPage() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)

  const handleDepartmentSelect: UsersSideProps['onDepartmentSelect'] = (departmentIds) => {
    const departmentId = departmentIds.at(0)

    if (departmentId) {
      setSelectedDepartmentId(departmentId)
    }
  }

  return (
    <div className="flex gap-admin-content">
      <UsersSide onDepartmentSelect={handleDepartmentSelect} />

      <div className="flex-1">
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
