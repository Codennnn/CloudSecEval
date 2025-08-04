'use client'

import { UserIcon } from 'lucide-react'

import { NavDocuments } from '~/app/admini/components/NavDocuments'
import { NavMain } from '~/app/admini/components/NavMain'
import { NavSecondary } from '~/app/admini/components/NavSecondary'
import { NavUser } from '~/app/admini/components/NavUser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: UserIcon,
    },
    {
      title: 'Lifecycle',
      url: '#',
      icon: UserIcon,
    },
    {
      title: 'Analytics',
      url: '#',
      icon: UserIcon,
    },
    {
      title: 'Projects',
      url: '#',
      icon: UserIcon,
    },
    {
      title: 'Team',
      url: '#',
      icon: UserIcon,
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: UserIcon,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: UserIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: UserIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: UserIcon,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: UserIcon,
    },
    {
      title: 'Search',
      url: '#',
      icon: UserIcon,
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: UserIcon,
    },
    {
      name: 'Reports',
      url: '#',
      icon: UserIcon,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: UserIcon,
    },
  ],
}

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <UserIcon className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
