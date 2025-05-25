import { FolderOpenIcon } from 'lucide-react'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'

import { IconTypescript } from '../icon/IconTypescript'

const fileTreeData = [
  {
    name: 'src',
    children: [
      { name: 'app.controller.spec.ts' },
      { name: 'app.controller.ts' },
      { name: 'app.module.ts' },
      { name: 'app.service.ts' },
      { name: 'main.ts' },
    ],
  },
]

export function FileTree() {
  return (
    <SidebarMenu className="not-prose font-medium">
      {fileTreeData.map((folder) => (
        <SidebarMenuItem key={folder.name}>
          <SidebarMenuButton>
            <FolderOpenIcon />

            {folder.name}
          </SidebarMenuButton>

          <SidebarMenuSub>
            {folder.children.map((file) => (
              <SidebarMenuSubItem key={file.name}>
                <SidebarMenuSubButton>
                  <span className="size-4 grayscale-100 inline-block">
                    <IconTypescript />
                  </span>

                  {file.name}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
