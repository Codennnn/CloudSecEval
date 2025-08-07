import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/sidebar'

import { AdminHeader } from '~admin/components/AdminHeader'
import { AdminSidebar } from '~admin/components/AdminSidebar'
import { LicenseDialogManager } from '~admin/components/LicenseDialogManager'
import { UserSyncProvider } from '~admin/components/UserSyncProvider'

/**
 * 后台管理系统专用布局组件
 * 提供独立的样式和导航结构
 */
export default function AdminLayout(props: React.PropsWithChildren) {
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

          <div className="flex-1 overflow-hidden">
            <ScrollGradientContainer className="@container/admin-content">
              {children}
            </ScrollGradientContainer>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* 全局对话框管理器 */}
      <LicenseDialogManager />
    </UserSyncProvider>
  )
}
