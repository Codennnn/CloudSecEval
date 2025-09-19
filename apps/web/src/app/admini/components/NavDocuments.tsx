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

import { type AdminDocumentItem, AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'

interface NavDocumentsProps {
  items: AdminDocumentItem[]
}

export function NavDocuments(props: NavDocumentsProps) {
  const { items } = props

  const pathname = usePathname()
  const decodedPathname = decodeURIComponent(pathname)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>文档</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const url = `${AdminRoutes.Docs}/${item.url}`

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={decodedPathname === url}>
                <Link href={url}>
                  {item.icon ? <item.icon /> : <BookOpenIcon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-muted rounded-sm !text-muted-foreground"
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
                    <Link href={`${AdminRoutes.Docs}/${item.url}`} target="_blank">
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
          <Link href={getRoutePath(AdminRoutes.Docs)}>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
              isActive={decodedPathname === AdminRoutes.Docs}
            >
              <EllipsisIcon className="text-sidebar-foreground/70" />
              <span>更多文档</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
