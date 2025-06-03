import { AppSidebar } from '~/components/AppSidebar'
import { TableOfContents } from '~/components/TableOfContents'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'

export default function DocsLayout(props: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="@container overflow-auto">
        <div
          className={
            cn(
              'flex relative',
              '@lg:[--content-padding:4rem] @md:[--content-padding:1.5rem] @sm:[--content-padding:1rem]',
            )
          }
        >
          <div className="flex-1 p-[var(--content-padding)]">
            {props.children}
          </div>

          <aside className="sticky top-0 w-64 h-screen overflow-y-auto py-[var(--content-padding)] pr-[var(--content-padding)]">
            <TableOfContents />
          </aside>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
