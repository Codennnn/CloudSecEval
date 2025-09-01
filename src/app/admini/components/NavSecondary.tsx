'use client'

import Link from 'next/link'
import { ArrowUpRightIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { isExternalLink } from '~/utils/link'

import type { AdminSecondaryNavItem } from '~admin/lib/admin-nav'

export function NavSecondary({
  items,
  ...props
}: {
  items: AdminSecondaryNavItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isExternal = isExternalLink(item.url)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.url}
                    target={isExternal ? '_blank' : '_self'}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {isExternal && <ArrowUpRightIcon className="ml-auto text-muted-foreground size-3" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
