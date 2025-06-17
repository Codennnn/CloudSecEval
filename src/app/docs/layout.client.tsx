'use client'

import { useHashNavigation } from '~/hooks/useHashNavigation'

interface DocsLayoutClientProps {
  containerId: string
  children: React.ReactNode
}

export function DocsLayoutClient({ containerId, children }: DocsLayoutClientProps) {
  // 使用 hash 导航 hook
  useHashNavigation({
    containerId,
    behavior: 'smooth',
    delay: 100,
  })

  return <>{children}</>
}
