import { FolderOpenIcon } from 'lucide-react'

import { LanguageIcon } from '~/components/LanguageIcon'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'

export interface FileTreeItem {
  name: string
  icon?: React.ReactNode
  type?: 'folder' | 'file'
  children?: FileTreeItem[]
}

export type FileTreeData = FileTreeItem[]

export interface FileTreeProps {
  data?: FileTreeData
  className?: string
}

// 递归渲染文件树项目
const FileTreeItemComponent = ({ item }: { item: FileTreeItem }) => {
  // 文件夹
  if (item.type === 'folder' || item.children) {
    return (
      <SidebarMenuItem key={item.name}>
        <SidebarMenuButton>
          {item.icon ?? <FolderOpenIcon />}
          {item.name}
        </SidebarMenuButton>

        <SidebarMenuSub>
          {item.children?.map((child) => (
            <FileTreeItemComponent key={child.name} item={child} />
          ))}
        </SidebarMenuSub>
      </SidebarMenuItem>
    )
  }

  // 文件
  return (
    <SidebarMenuSubItem key={item.name}>
      <SidebarMenuSubButton>
        {item.icon ?? (
          <span className="size-4 inline-block">
            <LanguageIcon lang="ts" />
          </span>
        )}
        {item.name}
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

export function FileTree(props: FileTreeProps) {
  const { data, className } = props

  if (!data?.length) {
    return null
  }

  return (
    <div className="border border-border rounded-lg p-3 font-mono">
      <SidebarMenu className={cn('not-prose font-medium', className)}>
        {data.map((item) => (
          <FileTreeItemComponent key={item.name} item={item} />
        ))}
      </SidebarMenu>
    </div>
  )
}
