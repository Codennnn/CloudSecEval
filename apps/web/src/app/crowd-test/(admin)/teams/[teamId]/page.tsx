import type { Metadata } from 'next'

import { TeamProfile } from './TeamProfile'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestTeams),
}

export default function TeamProfilePage() {
  return (
    <div className="p-admin-content">
      <TeamProfile />
    </div>
  )
}
