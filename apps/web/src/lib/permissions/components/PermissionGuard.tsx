'use client'

import { usePathname } from 'next/navigation'

import { useUserPermissions } from '~/lib/permissions/hooks'
import { matchPermission, type PermissionFlag } from '~/lib/permissions/matcher'
import { resolveRequiredPermissionByPath } from '~/lib/permissions/route-permissions'
import { cn } from '~/lib/utils'

/**
 * 组件：页面/区块权限守卫
 * - 支持 required 为单个或多个权限
 * - mode 为 any/all，默认 any
 * - fallback 自定义无权时的显示内容
 */
export function PermissionGuard(props: {
  required: PermissionFlag | PermissionFlag[]
  mode?: 'any' | 'all'
  fallback?: React.ReactNode
  children: React.ReactNode
}): React.JSX.Element {
  const { required, children } = props
  const mode = props.mode ?? 'any'
  const fallbackNode = props.fallback ?? (
    <div className={cn('border border-border rounded-md p-6 text-sm text-muted-foreground')}>
      暂无访问该页面（或区域）的权限
    </div>
  )

  const perms = useUserPermissions()
  const requiredList = Array.isArray(required) ? required : [required]

  let granted = false

  if (mode === 'all') {
    granted = requiredList.every((r) => matchPermission(perms, r))
  }
  else {
    granted = requiredList.some((r) => matchPermission(perms, r))
  }

  let node: React.ReactNode = null

  if (granted) {
    node = children
  }
  else {
    node = fallbackNode
  }

  return <>{node}</>
}

/**
 * 组件：客户端路由守卫
 * - 用于在布局或页面中包裹 children，实现“按路由配置”的权限控制
 * - 通过 pathname 匹配到路由->权限映射，再复用 PermissionGuard
 */
export function AdminRouteGuard(props: React.PropsWithChildren): React.JSX.Element {
  const { children } = props
  const pathname = usePathname() || ''
  const required = resolveRequiredPermissionByPath(pathname)

  let node: React.ReactNode = children

  if (required !== undefined) {
    node = (
      <PermissionGuard required={required}>
        {children}
      </PermissionGuard>
    )
  }

  return <>{node}</>
}
