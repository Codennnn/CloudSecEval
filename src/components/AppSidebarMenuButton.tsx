'use client'

import { usePathname } from 'next/navigation'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

import { SidebarMenuButton, SidebarMenuSubButton } from './ui/sidebar'

interface SidebarMenuItemType {
  title?: string
  url?: string
  items?: {
    title?: string
    url?: string
    isActive?: boolean
  }[]
}

interface AppSidebarMenuButtonProps extends React.ComponentProps<typeof SidebarMenuButton> {
  item: SidebarMenuItemType
}

export function AppSidebarMenuButton(
  { children, item, ...restProps }: React.PropsWithChildren<AppSidebarMenuButtonProps>,
) {
  const pathname = usePathname()

  return (
    <SidebarMenuButton {...restProps} isActive={pathname === `/docs${item.url}`}>
      {children}
    </SidebarMenuButton>
  )
}

export function AppSidebarMenuSubButton(
  { children, item }: React.PropsWithChildren<{ item: SidebarMenuItemType }>,
) {
  const pathname = usePathname()

  return (
    <SidebarMenuSubButton asChild isActive={pathname === `/docs${item.url}`}>
      {children}
    </SidebarMenuSubButton>
  )
}

export function SidebarMenuButtonContent({ item }: { item: SidebarMenuItemType }) {
  return (
    <>
      <span className="flex-1 truncate min-w-0">
        {item.title}
      </span>

      {item.items && item.items.length > 0
        ? (
            <span className="ml-auto shrink-0">
              <ChevronRightIcon className="group-data-[state=open]/collapsible:hidden" size={14} />
              <ChevronDownIcon className="group-data-[state=closed]/collapsible:hidden" size={14} />
            </span>
          )
        : null}
    </>
  )
}
