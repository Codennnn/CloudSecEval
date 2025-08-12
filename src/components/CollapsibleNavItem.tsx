'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowUpRightIcon } from 'lucide-react'

import { AppSidebarMenuButton, AppSidebarMenuSubButton, SidebarMenuButtonContent } from '~/components/layout/AppSidebarMenuButton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'
import { RoutePath } from '~/constants/routes.client'
import type { NavMenuItem } from '~/types/nav'
import { getDocLinkHref, isExternalLink } from '~/utils/link'

interface CollapsibleNavItemProps {
  item: NavMenuItem
  defaultOpen?: boolean
  forceOpen?: boolean
  level?: number // 添加层级参数，用于控制渲染深度
}

export function CollapsibleNavItem(props: CollapsibleNavItemProps) {
  const { item, defaultOpen = false, forceOpen = false, level = 0 } = props

  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // 检查当前路径是否与该导航项或其子项匹配
  const isActiveItem = item.url && pathname === `${RoutePath.Docs}${item.url}`

  // 递归检查所有子项是否有激活状态
  const checkActiveChild = (menuItem: NavMenuItem): boolean => {
    if (menuItem.url && pathname === `${RoutePath.Docs}${menuItem.url}`) {
      return true
    }

    if (menuItem.items) {
      return menuItem.items.some(checkActiveChild)
    }

    return false
  }

  const hasActiveChild = item.items?.some(checkActiveChild)

  // 当路径变化时，自动展开包含当前页面的菜单
  useEffect(() => {
    if (isActiveItem || hasActiveChild) {
      setIsOpen(true)
    }
  }, [pathname, isActiveItem, hasActiveChild])

  // 如果外部要求强制展开，则覆盖本地状态
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
    }
  }, [forceOpen])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  // 预加载处理函数
  const handleMouseEnter = (url: string) => {
    if (!isExternalLink(url)) {
      const fullPath = `${RoutePath.Docs}${url}`

      router.prefetch(fullPath)
    }
  }

  return (
    <Collapsible
      className="group/collapsible collapsible-group"
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {item.url
            ? (
                <AppSidebarMenuButton asChild item={item}>
                  <Link
                    href={getDocLinkHref(item.url)}
                    target={isExternalLink(item.url) ? '_blank' : undefined}
                    onMouseEnter={() => {
                      if (item.url) {
                        handleMouseEnter(item.url)
                      }
                    }}
                  >
                    <SidebarMenuButtonContent item={item} />

                    {isExternalLink(item.url)
                      ? (
                          <ArrowUpRightIcon
                            className="opacity-50"
                            size={14}
                          />
                        )
                      : null}
                  </Link>
                </AppSidebarMenuButton>
              )
            : (
                <AppSidebarMenuButton item={item}>
                  <SidebarMenuButtonContent item={item} />
                </AppSidebarMenuButton>
              )}
        </CollapsibleTrigger>

        {
          item.items && item.items.length > 0
            ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items
                      .filter((subItem) => !subItem.hiddenInSidebar)
                      .map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title ?? crypto.randomUUID()}>
                          {/* 检查子项是否有嵌套的 items */}
                          {subItem.items && subItem.items.length > 0
                            ? (
                                <CollapsibleNavItem
                                  item={subItem}
                                  level={level + 1}
                                />
                              )
                            : (
                                // 如果没有嵌套项，渲染普通的菜单项
                                <AppSidebarMenuSubButton item={subItem}>
                                  {subItem.url
                                    ? (
                                        <Link
                                          href={getDocLinkHref(subItem.url)}
                                          target={isExternalLink(subItem.url) ? '_blank' : undefined}
                                          onMouseEnter={() => {
                                            if (subItem.url) {
                                              handleMouseEnter(subItem.url)
                                            }
                                          }}
                                        >
                                          <span className="flex-1 truncate min-w-0">
                                            {subItem.title}
                                          </span>

                                          {isExternalLink(subItem.url)
                                            ? (
                                                <ArrowUpRightIcon
                                                  className="ml-auto opacity-50"
                                                  size={14}
                                                />
                                              )
                                            : null}
                                        </Link>
                                      )
                                    : subItem.title}
                                </AppSidebarMenuSubButton>
                              )}
                        </SidebarMenuSubItem>
                      ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )
            : null
        }
      </SidebarMenuItem>
    </Collapsible>
  )
}
