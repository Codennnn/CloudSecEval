import { FileText, Folder } from 'lucide-react'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'

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
    <SidebarMenu className="not-prose">
      {fileTreeData.map((folder) => (
        <SidebarMenuItem key={folder.name}>
          <SidebarMenuButton>
            <Folder className="mr-2" />
            {folder.name}
          </SidebarMenuButton>

          <SidebarMenuSub>
            {folder.children.map((file) => (
              <SidebarMenuSubItem key={file.name}>
                <SidebarMenuSubButton>
                  <FileText className="mr-2" />
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
