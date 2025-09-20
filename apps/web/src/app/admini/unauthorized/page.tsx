import { Suspense } from 'react'

import type { Metadata } from 'next'

import { UnauthorizedPage } from './UnauthorizedPage'

import { AdminRoutes, generatePageTitle } from '~admin/lib/admin-nav'

export const metadata: Metadata = {
  title: generatePageTitle(AdminRoutes.Unauthorized),
}

// 加载中的占位组件
function UnauthorizedPageFallback() {
  return (
    <div className="relative flex h-full min-h-screen items-center justify-center p-panel">
      <div className="color-bg">
        <div className="noise-bg" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="border-border/50 bg-card/95 backdrop-blur-sm shadow-xl rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnauthorizedPageX() {
  return (
    <Suspense fallback={<UnauthorizedPageFallback />}>
      <UnauthorizedPage />
    </Suspense>
  )
}
