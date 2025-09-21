'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { tokenManager } from '~/lib/auth/token'

import { adminLoginRoute } from '~admin/lib/admin-nav'

/**
 * 认证状态同步 Hook
 * 监听 localStorage 中的 token 变化，自动同步认证状态 Cookie
 */
export function useAuthSync() {
  const router = useRouter()

  useEffect(() => {
    const cookieDisabled = process.env.NEXT_PUBLIC_JWT_USE_COOKIE === 'false'

    if (!cookieDisabled) {
      return // Cookie 模式下不需要同步
    }

    // 检查当前认证状态
    const checkAuthStatus = () => {
      const hasToken = tokenManager.isAuthenticated()

      // 同步认证状态到 Cookie
      tokenManager.setAuthStatusCookie(hasToken)

      return hasToken
    }

    // 初始检查
    checkAuthStatus()

    // 监听 storage 事件（跨标签页同步）
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'access_token') {
        const hasToken = checkAuthStatus()

        // 如果 token 被清除，重定向到登录页
        if (!hasToken && window.location.pathname.startsWith('/admini') && !window.location.pathname.startsWith('/admini/login')) {
          router.replace(adminLoginRoute)
        }
      }
    }

    // 监听 beforeunload 事件，在页面关闭前同步状态
    const handleBeforeUnload = () => {
      checkAuthStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // 定期检查认证状态（可选，用于处理 token 过期）
    const interval = setInterval(checkAuthStatus, 60000) // 每分钟检查一次

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(interval)
    }
  }, [router])
}

/**
 * 页面级认证检查 Hook
 * 在页面组件中使用，确保用户已登录
 */
export function useRequireAuth() {
  const router = useRouter()

  useEffect(() => {
    const cookieDisabled = process.env.NEXT_PUBLIC_JWT_USE_COOKIE === 'false'

    if (cookieDisabled) {
      const hasToken = tokenManager.isAuthenticated()

      if (!hasToken) {
        router.replace(adminLoginRoute)
      }
    }
  }, [router])
}
