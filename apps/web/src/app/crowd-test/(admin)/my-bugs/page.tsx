import type { Metadata } from 'next'

import { MyBugsPage as MyBugsPageComponent } from './MyBugsPage'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.CrowdTestMyBugs),
}

export default function MyBugsPage() {
  return <MyBugsPageComponent />
}
