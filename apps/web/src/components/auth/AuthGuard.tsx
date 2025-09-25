'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'nextjs-toploader/app'

import { tokenManager } from '~/lib/auth/token'
import { isCookieEnabled } from '~/utils/platform'

import { adminLoginRoute } from '~admin/lib/admin-nav'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * 认证守卫组件
 * 在客户端检查认证状态，适用于 localStorage 认证模式
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // 检查认证状态
    const checkAuth = () => {
      if (!isCookieEnabled()) {
        // localStorage 模式：检查 localStorage 中的 token
        const hasToken = tokenManager.isAuthenticated()
        setIsAuthenticated(hasToken)

        if (!hasToken) {
          router.replace(adminLoginRoute)
        }
      }
      else {
        // Cookie 模式：假设已通过 middleware 验证，直接允许访问
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [router])

  // 加载中状态
  if (isAuthenticated === null) {
    return fallback ?? (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // 未认证状态
  if (!isAuthenticated) {
    return fallback ?? null
  }

  // 已认证，渲染子组件
  return <>{children}</>
}

/**
 * 高阶组件：为页面添加认证保护
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard fallback={fallback}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
