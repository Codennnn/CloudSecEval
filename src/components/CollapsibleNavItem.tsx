'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowUpRightIcon } from 'lucide-react'

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
import { RoutePath } from '~/constants'
import { NavMenuItem } from '~/types/nav'
import { isExternalLink } from '~/utils/common'

import { AppSidebarMenuButton, AppSidebarMenuSubButton, SidebarMenuButtonContent } from './AppSidebarMenuButton'

interface CollapsibleNavItemProps {
  item: NavMenuItem
  defaultOpen?: boolean
  forceOpen?: boolean
}

export function CollapsibleNavItem(props: CollapsibleNavItemProps) {
  const { item, defaultOpen = false, forceOpen = false } = props

  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // 检查当前路径是否与该导航项或其子项匹配
  const isActiveItem = item.url && pathname === `${RoutePath.Docs}${item.url}`

  const hasActiveChild = item.items?.some((subItem) => subItem.url && pathname === `${RoutePath.Docs}${subItem.url}`)

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
      className="group/collapsible"
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {item.url
            ? (
                <AppSidebarMenuButton asChild item={item}>
                  <Link
                    href={isExternalLink(item.url) ? item.url : `${RoutePath.Docs}${item.url}`}
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
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title ?? crypto.randomUUID()}>
                        <AppSidebarMenuSubButton item={subItem}>
                          {subItem.url
                            ? (
                                <Link
                                  href={isExternalLink(subItem.url) ? subItem.url : `${RoutePath.Docs}${subItem.url}`}
                                  target={isExternalLink(subItem.url) ? '_blank' : undefined}
                                  onMouseEnter={() => {
                                    if (subItem.url) {
                                      handleMouseEnter(subItem.url)
                                    }
                                  }}
                                >
                                  {subItem.title}

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
