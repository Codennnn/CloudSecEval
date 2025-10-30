'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { ChevronRightIcon } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'

import type { CloudSecEvalNavItem } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

interface CollapsibleNavItemProps {
  item: CloudSecEvalNavItem
}

/**
 * 可折叠的导航项组件
 * 用于渲染带有子菜单的导航项
 */
export function CollapsibleNavItem({ item }: CollapsibleNavItemProps) {
  const pathname = usePathname()

  /**
   * 检查当前路径是否匹配该导航项或其子项
   */
  const isActiveOrHasActiveChild = () => {
    if (pathname === item.url) {
      return true
    }

    if (item.items && item.items.length > 0) {
      return item.items.some((subItem) => pathname === subItem.url)
    }

    return false
  }

  const isActive = isActiveOrHasActiveChild()

  /**
   * 如果当前路径匹配子项，默认展开
   */
  const hasActiveChild = item.items?.some((subItem) => pathname === subItem.url) ?? false
  const [isOpen, setIsOpen] = useState(hasActiveChild)

  /**
   * 处理折叠状态变化
   */
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <Collapsible
      className="group/collapsible"
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive} tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        {item.items && item.items.length > 0
          ? (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem) => {
                    const isSubItemActive = pathname === subItem.url

                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                          <Link href={subItem.url ?? ''}>
                            {subItem.icon && <subItem.icon className="size-4" />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            )
          : null}
      </SidebarMenuItem>
    </Collapsible>
  )
}

