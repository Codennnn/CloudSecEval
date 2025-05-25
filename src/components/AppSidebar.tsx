'use client'

import Link from 'next/link'
import { GalleryVerticalEndIcon } from 'lucide-react'

import { CollapsibleNavItem } from '~/components/CollapsibleNavItem'
import { SearchForm } from '~/components/SearchForm'
import { ThemeModeToggle } from '~/components/ThemeModeToggle'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '~/components/ui/sidebar'
import { navMainData } from '~/lib/data/nav'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center bg-sidebar-primary rounded-lg size-8 aspect-square text-sidebar-primary-foreground">
                    <GalleryVerticalEndIcon className="size-4" />
                  </div>

                  <div className="flex flex-col gap-0.5 leading-none">
                    <div className="font-semibold">NestJS 中文文档</div>
                    <div className="text-xs text-muted-foreground font-medium">v10.0.0</div>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SearchForm />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navMainData.map((item, idx) => (
              <CollapsibleNavItem
                key={`${item.title ?? ''}-${idx}`}
                item={item}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <div className="flex items-center gap-2 p-2">
        <SidebarTrigger className="-ml-1" />

        <div className="ml-auto">
          <ThemeModeToggle />
        </div>
      </div>

      <SidebarRail />
    </Sidebar>
  )
}
