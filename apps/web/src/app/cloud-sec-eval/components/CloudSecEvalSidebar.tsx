'use client'

import Image from 'next/image'
import Link from 'next/link'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { SITE_CONFIG } from '~/constants/common'

import { NavMain } from '~cloud-sec-eval/components/NavMain'
import { cloudSecEvalRootRoute, useCloudSecEvalNav } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

/**
 * 云智评模块侧边栏组件
 * 包含 Logo、标题和主导航菜单
 */
export function CloudSecEvalSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { navMain } = useCloudSecEvalNav()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={cloudSecEvalRootRoute}>
                <Image
                  alt="网站 Logo"
                  height={24}
                  src={SITE_CONFIG.logoPath}
                  width={24}
                />
                <span className="text-base font-semibold">云安全支撑与管理系统</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
