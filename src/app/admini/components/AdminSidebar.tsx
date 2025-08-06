'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GaugeIcon, GitlabIcon, UserIcon } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { SITE_CONFIG } from '~/constants'

import { NavDocuments } from '~admin/components/NavDocuments'
import { NavMain } from '~admin/components/NavMain'
import { NavSecondary } from '~admin/components/NavSecondary'
import { NavUser } from '~admin/components/NavUser'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admini/dashboard',
      icon: GaugeIcon,
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
              <Link href="/admini">
                <Image
                  alt="NestJS Logo"
                  height={24}
                  src={SITE_CONFIG.logoPath}
                  width={24}
                />
                <span className="text-base font-semibold">文档服务中心</span>
              </Link>
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
