'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpenIcon, EllipsisIcon, ExternalLinkIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'

import type { AdminDocumentItem } from '~admin/lib/admin-nav'

export function NavDocuments({
  items,
}: {
  items: AdminDocumentItem[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>文档</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const url = `/admini/docs/${item.url}`

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={decodeURIComponent(pathname) === url}>
                <Link href={url}>
                  {item.icon ? <item.icon /> : <BookOpenIcon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-muted rounded-sm"
                  >
                    <EllipsisIcon />
                    <span className="sr-only">更多</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-24 rounded-lg"
                >
                  <DropdownMenuItem asChild>
                    <Link href={`/admini/docs/${item.url}`} target="_blank">
                      <ExternalLinkIcon />
                      <span>新标签打开</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}

        <SidebarMenuItem>
          <Link href="/admini/docs/">
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <EllipsisIcon className="text-sidebar-foreground/70" />
              <span>更多</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
