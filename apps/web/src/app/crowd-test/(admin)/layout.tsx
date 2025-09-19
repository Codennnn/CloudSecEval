import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/sidebar'

import { AdminHeader } from '~admin/components/AdminHeader'
import { AdminSidebar } from '~admin/components/AdminSidebar'
import { GlobalSimpleConfirmDialog } from '~admin/components/GlobalSimpleConfirmDialog'
import { LicenseDialogManager } from '~admin/components/LicenseDialogManager'
import { PagePermissionGuard } from '~admin/components/PagePermissionGuard'
import { UserSyncProvider } from '~admin/components/UserSyncProvider'

export default function AdminCrowdTestLayout(props: React.PropsWithChildren) {
  const { children } = props

  return (
    <UserSyncProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AdminSidebar variant="inset" />

        <SidebarInset className="overflow-hidden">
          <AdminHeader />

          <div className="crowd-test-root flex-1 overflow-hidden perspective-distant">
            <ScrollGradientContainer className="@container/admin-content">
              <PagePermissionGuard>
                {children}
              </PagePermissionGuard>
            </ScrollGradientContainer>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <GlobalSimpleConfirmDialog />
      <LicenseDialogManager />
    </UserSyncProvider>
  )
}
