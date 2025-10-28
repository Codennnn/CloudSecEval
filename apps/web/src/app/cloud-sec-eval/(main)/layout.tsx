import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'

import { CloudSecEvalHeader } from '~cloud-sec-eval/components/CloudSecEvalHeader'
import { CloudSecEvalSidebar } from '~cloud-sec-eval/components/CloudSecEvalSidebar'

/**
 * 云智评模块专用布局组件
 * 提供独立的样式和导航结构
 */
export default function CloudSecEvalLayout(props: React.PropsWithChildren) {
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
      <CloudSecEvalSidebar variant="inset" />

      <SidebarInset className="overflow-hidden">
        <CloudSecEvalHeader />

        <div className="flex-1 overflow-hidden perspective-distant">
          <ScrollGradientContainer className="@container/cloud-sec-eval-content">
            {children}
          </ScrollGradientContainer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
