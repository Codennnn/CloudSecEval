import { AppSidebar } from '~/components/AppSidebar'
import { ScrollToTop } from '~/components/ScrollToTop'
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

      <SidebarInset>
        <div
          className="@container size-full overflow-y-auto"
          id="docs-scroll-container"
        >
          <div
            className={
              cn(
                'flex relative',
                '@lg:[--content-padding:4rem] @md:[--content-padding:3rem] @sm:[--content-padding:1.5rem]',
              )
            }
          >
            <div className="flex-1 p-[var(--content-padding)]">
              {props.children}
            </div>

            <aside className="sticky top-0 right-3 w-64 h-screen overflow-y-auto py-[var(--content-padding)] pr-[var(--content-padding)] hidden @4xl:block">
              <div className="space-y-4">
                <TableOfContents />

                <hr className="my-4 bg-border/70" />

                <ScrollToTop />
              </div>
            </aside>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
