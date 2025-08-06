'use client'

import {
  BookTextIcon,
  EllipsisVerticalIcon,
  LogOutIcon,
  UserIcon,
} from 'lucide-react'

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
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar'
import { useUser } from '~/stores/useUserStore'
import { useNavigation } from '~/utils/navigation'

import { useLogout } from '~admin/hooks/api/useAuth'

export function NavUser() {
  const { navigateDoc } = useNavigation()
  const { isMobile } = useSidebar()

  const user = useUser()
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate()
  }

  const handleNavigateToDoc = () => {
    navigateDoc('', { external: true })
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
              <Avatar className="h-8 w-8 rounded-lg grayscale">
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
                <Avatar className="h-8 w-8 rounded-lg">
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

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon />
                账号信息
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  handleNavigateToDoc()
                }}
              >
                <BookTextIcon />
                前往文档
              </DropdownMenuItem>
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
