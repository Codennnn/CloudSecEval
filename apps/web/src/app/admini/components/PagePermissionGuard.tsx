'use client'

import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app'

import { PermissionMode } from '~/constants/permission'
import { useHasPermissions } from '~/lib/permissions/hooks'
import { isCrowdTest } from '~/utils/platform'

import { AdminRoutes, getPagePermissionByRoute } from '~admin/lib/admin-nav'

/**
 * 页面级权限保护组件
 *
 * 功能特性：
 * - 基于路径自动识别页面权限要求
 * - 集成现有的权限检查逻辑
 * - 无权限时重定向到专用提示页面
 * - 传递原始路径信息供提示页面使用
 */
export function PagePermissionGuard({ children }: React.PropsWithChildren) {
  const router = useRouter()
  const pathname = usePathname()

  const [isChecking, setIsChecking] = useState(true)

  const requiredPermissions = getPagePermissionByRoute(pathname)

  const hasPermission = useHasPermissions(
    requiredPermissions ?? [],
    PermissionMode.Any,
  )

  useEffect(() => {
    // 避免在检查阶段重复执行
    if (isChecking) {
      setIsChecking(false)

      return
    }

    // 如果需要权限但用户没有权限，则重定向
    if (requiredPermissions && !hasPermission) {
      // 构建重定向 URL，包含原始路径信息
      const unauthorizedUrl = new URL(
        isCrowdTest() ? AdminRoutes.CrowdTestUnauthorized : AdminRoutes.Unauthorized,
        window.location.origin,
      )
      unauthorizedUrl.searchParams.set('from', pathname)

      router.replace(unauthorizedUrl.toString())

      return
    }
  }, [hasPermission, requiredPermissions, pathname, router, isChecking])

  if (isChecking) {
    return null
  }

  // 如果没有权限要求或有权限，直接渲染内容
  if (!requiredPermissions || hasPermission) {
    return <>{children}</>
  }

  return null
}
