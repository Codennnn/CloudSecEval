import type { Metadata } from 'next'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'
import { TeamProfile } from '~crowd-test/components/TeamProfile'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestTeamProfile),
}

export default function MyTeamProfilePage() {
  return (
    <div className="p-admin-content">
      <TeamProfile />
    </div>
  )
}
