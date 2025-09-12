'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ListIcon, SquarePlusIcon, type UserIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { AdminRoutes } from '~admin/lib/admin-nav'
import { useLicenseDialog } from '~admin/stores/useLicenseDialogStore'

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: typeof UserIcon
  }[]
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()

  const { openCreateDialog } = useLicenseDialog()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-4">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              tooltip="创建授权码"
              onClick={() => {
                openCreateDialog()
              }}
            >
              <SquarePlusIcon />
              <span>创建授权码</span>
            </SidebarMenuButton>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={AdminRoutes.Licenses}>
                  <Button
                    className="group-data-[collapsible=icon]:opacity-0"
                    size="iconNormal"
                    variant="outline"
                  >
                    <ListIcon />
                    <span className="sr-only">查看授权码列表</span>
                  </Button>
                </Link>
              </TooltipTrigger>

              <TooltipContent>
                查看授权码列表
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url

            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
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
