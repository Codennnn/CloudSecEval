'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'

import type { CloudSecEvalNavItem } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

interface NavMainProps {
  items: CloudSecEvalNavItem[]
}

/**
 * 云智评模块主导航菜单组件
 * 负责渲染侧边栏的主要导航项
 */
export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-4">
        <SidebarMenu>
          {items.map((item) => {
            if (item.type === 'label') {
              return null
            }

            const isActive = pathname === item.url

            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url ?? ''}>
                  <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

