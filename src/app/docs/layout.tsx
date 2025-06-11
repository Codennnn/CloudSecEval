import { AppSidebar } from '~/components/AppSidebar'
import { EnglishDocLink } from '~/components/EnglishDocLink'
import { ScrollToTop } from '~/components/ScrollToTop'
import { TableOfContents } from '~/components/TableOfContents'
import {
  SidebarInset,
  SidebarProvider,
} from '~/components/ui/sidebar'
import { SCROLL_CONFIG } from '~/lib/scroll-config'
import { cn } from '~/lib/utils'

export default function DocsLayout(props: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <div
          className="@container size-full overflow-y-auto"
          id={SCROLL_CONFIG.CONTAINER_ID}
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
              <TableOfContents />

              <hr className="my-4 bg-border/70" />

              <div className="space-y-1">
                <EnglishDocLink />

                <ScrollToTop
                  containerId={SCROLL_CONFIG.CONTAINER_ID}
                  scrollThreshold={SCROLL_CONFIG.SCROLL_THRESHOLD}
                />
              </div>
            </aside>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
