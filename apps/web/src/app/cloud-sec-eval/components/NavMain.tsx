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

import { CollapsibleNavItem } from '~cloud-sec-eval/components/CollapsibleNavItem'
import type { CloudSecEvalNavItem } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

interface NavMainProps {
  items: CloudSecEvalNavItem[]
}

/**
 * 云智评模块主导航菜单组件
 * 负责渲染侧边栏的主要导航项
 * 支持嵌套子菜单的渲染
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

            /**
             * 如果导航项有子菜单，使用 CollapsibleNavItem 组件
             */
            if (item.items && item.items.length > 0) {
              return (
                <CollapsibleNavItem key={item.title} item={item} />
              )
            }

            /**
             * 否则渲染普通的导航项
             */
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
