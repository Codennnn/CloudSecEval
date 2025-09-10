'use client'

import { useState } from 'react'

import { RoleList } from '~admin/components/role/RoleList'
import { RoleMembersTable } from '~admin/components/role/RoleMembersTable'

export function RolesPage() {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  return (
    <div className="flex gap-admin-content h-full">
      <RoleList
        selectedRoleId={selectedRoleId}
        onSelect={(roleId) => {
          setSelectedRoleId(roleId)
        }}
      />

      <div className="flex-1 overflow-y-auto">
        {selectedRoleId && (
          <RoleMembersTable roleId={selectedRoleId} />
        )}
      </div>
    </div>
  )
}
