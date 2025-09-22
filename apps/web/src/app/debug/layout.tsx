import type { Metadata } from 'next'

import { getPageTitle } from '~/utils/common'

export const metadata: Metadata = {
  title: getPageTitle('调试工具'),
  robots: 'noindex, nofollow', // 防止搜索引擎索引调试页面
}

export default function DebugLayout({ children }: React.PropsWithChildren) {
  return (
    <div>
      {children}
    </div>
  )
}
