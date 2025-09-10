import type { Metadata } from 'next'

import { PermissionsTable } from '~admin/components/permission/PermissionsTable'
import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Permissions),
}

export default function AdminPermissionsPage() {
  return (
    <div className="p-admin-content">
      <PermissionsTable />
    </div>
  )
}
