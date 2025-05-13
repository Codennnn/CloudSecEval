import Link from 'next/link'
import { GalleryVerticalEndIcon } from 'lucide-react'

import { SearchForm } from '@/components/SearchForm'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { navMainData } from '@/lib/data/nav'

import { AppSidebarMenuButton, AppSidebarMenuSubButton, SidebarMenuButtonContent } from './AppSidebarMenuButton'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="flex justify-center items-center bg-sidebar-primary rounded-lg size-8 aspect-square text-sidebar-primary-foreground">
                  <GalleryVerticalEndIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Documentation</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SearchForm />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {(navMainData).map((item, index) => (
              <Collapsible
                key={item.title}
                className="group/collapsible"
                defaultOpen={index === 1}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    {item.url
                      ? (
                          <AppSidebarMenuButton asChild item={item}>
                            <Link href={`/docs/${item.url}`}>
                              <SidebarMenuButtonContent item={item} />
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
                                <SidebarMenuSubItem key={subItem.title}>
                                  <AppSidebarMenuSubButton item={subItem}>
                                    <Link href={`/docs/${subItem.url}`}>{subItem.title}</Link>
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
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
