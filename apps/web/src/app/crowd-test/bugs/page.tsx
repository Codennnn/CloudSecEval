import type { Metadata } from 'next'

import { BugPage as BugPageComponent } from './BugsPage'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestBugs),
}

export default function BugPage() {
  return (
    <BugPageComponent />
  )
}
