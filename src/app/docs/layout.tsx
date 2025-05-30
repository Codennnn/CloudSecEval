import { AppSidebar } from '~/components/AppSidebar'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/sidebar'

export default function DocsLayout(props: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="overflow-hidden h-full">
        {props.children}
      </SidebarInset>
    </SidebarProvider>
  )
}
