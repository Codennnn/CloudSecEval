import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/sidebar'

import { AdminHeader } from '~admin/components/AdminHeader'
import { AdminSidebar } from '~admin/components/AdminSidebar'
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

        <SidebarInset className="@container overflow-hidden">
          <AdminHeader />

          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </UserSyncProvider>
  )
}
