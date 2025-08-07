import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { SidebarTrigger } from '~/components/ui/sidebar'
import { RoutePath } from '~/constants'

export function AdminHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger />

        <Separator
          className="mx-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />

        <div className="text-base font-medium">Documents</div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={RoutePath.Docs}
            target="_blank"
          >
            <Button className="hidden sm:flex" size="sm" variant="ghost">
              <ExternalLinkIcon />
              文档主页
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
