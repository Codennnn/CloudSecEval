'use client'

import { usePathname } from 'next/navigation'

import { Separator } from '~/components/ui/separator'
import { SidebarTrigger } from '~/components/ui/sidebar'

import { getPageNameByRoute } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

/**
 * 云智评模块顶部导航栏组件
 * 显示侧边栏切换按钮和当前页面标题
 */
export function CloudSecEvalHeader() {
  const pathname = usePathname()
  const pageName = getPageNameByRoute(pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger />

        <Separator
          className="mx-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />

        <div className="text-base font-medium">{pageName}</div>
      </div>
    </header>
  )
}
