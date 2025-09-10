'use client'

import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

import { RoleDetails } from '~admin/components/role/RoleDetails'
import { RoleList } from '~admin/components/role/RoleList'
import { RoleMembersTable } from '~admin/components/role/RoleMembersTable'

const enum TabKey {
  Details = '.',
  List = '..',
}

export function RolesPage() {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  return (
    <div className="flex h-full">
      <RoleList
        selectedRoleId={selectedRoleId}
        onSelect={(roleId) => {
          setSelectedRoleId(roleId)
        }}
      />

      <div className="flex-1 overflow-y-auto p-admin-content">
        <Tabs className="gap-admin-content" defaultValue={TabKey.Details}>
          <TabsList>
            <TabsTrigger value={TabKey.Details}>角色信息</TabsTrigger>
            <TabsTrigger value={TabKey.List}>用户列表</TabsTrigger>
          </TabsList>

          <TabsContent value={TabKey.Details}>
            {selectedRoleId && (
              <RoleDetails roleId={selectedRoleId} />
            )}
          </TabsContent>

          <TabsContent value={TabKey.List}>
            {selectedRoleId && (
              <RoleMembersTable roleId={selectedRoleId} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
