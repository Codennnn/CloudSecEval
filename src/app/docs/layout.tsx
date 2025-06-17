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

import { DocsLayoutClient } from './layout.client'

export default function DocsLayout(props: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <div
          className="@container size-full overflow-y-auto"
          id={SCROLL_CONFIG.CONTAINER_ID}
        >
          {/* 使用客户端组件来处理 hash 导航 */}
          <DocsLayoutClient containerId={SCROLL_CONFIG.CONTAINER_ID}>
            <div
              className={
                cn(
                  'flex relative w-full',
                  '@lg:[--content-padding:4rem] @md:[--content-padding:3rem] @sm:[--content-padding:1.5rem] [--content-padding:1rem]',
                )
              }
            >
              <div className="flex-1 max-w-full px-[var(--content-padding)]">
                {props.children}
              </div>

              <aside
                className="w-64 sticky top-0 h-screen overflow-y-auto hidden @4xl:block"
              >
                <div className="h-full py-[var(--content-padding)] pr-[var(--content-padding)]">
                  <TableOfContents />

                  <hr className="my-4 bg-border/70" />

                  <div className="inline-flex flex-col gap-1">
                    <EnglishDocLink />

                    <ScrollToTop
                      containerId={SCROLL_CONFIG.CONTAINER_ID}
                      scrollThreshold={SCROLL_CONFIG.SCROLL_THRESHOLD}
                    />
                  </div>
                </div>
              </aside>
            </div>
          </DocsLayoutClient>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
