import { AdminSidebar } from '~/app/admini/components/AdminSidebar'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/sidebar'

/**
 * 后台管理系统专用布局组件
 * 提供独立的样式和导航结构
 */
export default function AdminLayout(props: React.PropsWithChildren) {
  const { children } = props

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AdminSidebar variant="inset" />

      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
