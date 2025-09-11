'use client'

import Image from 'next/image'
import Link from 'next/link'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { SITE_CONFIG } from '~/constants/common'

import { NavDocuments } from '~admin/components/NavDocuments'
import { NavMain } from '~admin/components/NavMain'
import { NavSecondary } from '~admin/components/NavSecondary'
import { NavUser } from '~admin/components/NavUser'
import {
  AdminRoutes,
  adminTitle,
  useAdminNav,
} from '~admin/lib/admin-nav'

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { navMain, navSecondary, navDocuments } = useAdminNav()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={AdminRoutes.Root}>
                <Image
                  alt="NestJS Logo"
                  height={24}
                  src={SITE_CONFIG.logoPath}
                  width={24}
                />
                <span className="text-base font-semibold">{adminTitle}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />

        <NavDocuments items={navDocuments} />

        <NavSecondary className="mt-auto" items={navSecondary} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
