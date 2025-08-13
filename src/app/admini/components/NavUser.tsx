'use client'

import Link from 'next/link'
import {
  BookTextIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  LogOutIcon,
  PaletteIcon,
  UserIcon,
} from 'lucide-react'

import { ThemeDropdownMenuItems } from '~/components/ThemeModeToggle'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar'
import { RoutePath } from '~/constants/routes.client'

import { useLogout } from '~admin/hooks/api/useAuth'
import { AdminRoutes } from '~admin/lib/admin-nav'
import { useUser } from '~admin/stores/useUserStore'

export function NavUser() {
  const { isMobile } = useSidebar()

  const user = useUser()
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate({})
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage alt={user?.name ?? '-'} src={user?.avatarUrl} />
                <AvatarFallback className="rounded-lg">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name ?? '-'} </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email ?? '-'}
                </span>
              </div>

              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage alt={user?.name ?? '-'} src={user?.avatarUrl} />
                  <AvatarFallback className="rounded-lg">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name ?? '-'} </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email ?? '-'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="flex items-center gap-2">
                  <PaletteIcon className="size-4" />
                  颜色主题
                </div>
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent>
                <ThemeDropdownMenuItems />
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuGroup>
              <Link href={AdminRoutes.Profile}>
                <DropdownMenuItem>
                  <UserIcon />
                  账号信息
                </DropdownMenuItem>
              </Link>

              <Link href={RoutePath.Docs}>
                <DropdownMenuItem>
                  <BookTextIcon />
                  前往文档

                  <ExternalLinkIcon className="ml-auto opacity-50 size-3.5" />
                </DropdownMenuItem>
              </Link>

            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                handleLogout()
              }}
            >
              <LogOutIcon />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
