'use client'

import { useMemo } from 'react'

import { usePathname } from 'next/navigation'

import { cn } from '~/lib/utils'

import { AdminRoutes } from '~admin/lib/admin-nav'
import { useUserStore } from '~admin/stores/useUserStore'

/**
 * 权限字符串类型（resource:action）
 * 例："users:read"、"users:*"、"licenses:create"。
 */
export type PermissionFlag = string

/**
 * 路由与所需权限的映射配置
 * 注意：此处仅用于前端 UI 控制；后端必须始终进行强制鉴权。
 */
export const routePermissions: Record<string, PermissionFlag | PermissionFlag[]> = {
  [AdminRoutes.Roles]: 'roles:read',
  [AdminRoutes.Permissions]: 'permissions:read',
  [AdminRoutes.Users]: 'users:read',
  [AdminRoutes.Licenses]: 'licenses:read',
  // 仪表盘：通常展示统计类信息
  [AdminRoutes.Dashboard]: 'statistics:read',
}

/**
 * 根据当前路径解析需要的权限（最长前缀匹配）
 * @param pathname 当前路径
 * @returns 命中的权限需求；未命中返回 undefined
 */
export function resolveRequiredPermissionByPath(
  pathname: string,
): PermissionFlag | PermissionFlag[] | undefined {
  // 取所有配置路径，按长度降序，确保更具体的路径优先
  const keys = Object.keys(routePermissions).sort((a, b) => b.length - a.length)

  for (const key of keys) {
    if (pathname.startsWith(key)) {
      return routePermissions[key]
    }
  }

  return undefined
}

/**
 * 基础工具：分解权限标识为资源与动作
 * @param flag 权限标识，如 "users:read"
 */
function splitFlag(flag: string): { resource: string, action: string } {
  const idx = flag.indexOf(':')

  if (idx === -1) {
    return { resource: flag, action: '' }
  }

  const resource = flag.slice(0, idx)
  const action = flag.slice(idx + 1)

  return { resource, action }
}

/**
 * 权限匹配（支持 "resource:action" 与 "resource:*"）
 * @param userPerms 用户拥有的权限列表
 * @param required  需要校验的权限
 * @returns 是否匹配
 */
export function matchPermission(userPerms: PermissionFlag[], required: PermissionFlag): boolean {
  const { resource: reqRes, action: reqAct } = splitFlag(required)
  let matched = false

  for (const p of userPerms) {
    const { resource, action } = splitFlag(p)
    const sameRes = resource === reqRes
    const actionOk = action === reqAct || action === '*'

    if (sameRes && actionOk) {
      matched = true
      break
    }
  }

  return matched
}

/**
 * Hook：获取当前用户的权限数组
 * 兼容 UserResponseDto.permissions?: string[]
 */
export function useUserPermissions(): PermissionFlag[] {
  const perms = useUserStore((s) => s.user?.permissions ?? [])

  return perms
}

/**
 * Hook：是否拥有指定权限
 */
export function useHasPermission(required: PermissionFlag): boolean {
  const perms = useUserPermissions()
  const has = useMemo(() => {
    return matchPermission(perms, required)
  }, [perms, required])

  return has
}

/**
 * Hook：是否拥有列表中任一权限（ANY）
 */
export function useHasAnyPermission(requiredList: PermissionFlag[]): boolean {
  const perms = useUserPermissions()
  const has = useMemo(() => {
    if (requiredList.length === 0) {
      return false
    }

    return requiredList.some((r) => matchPermission(perms, r))
  }, [perms, requiredList])

  return has
}

/**
 * Hook：是否拥有列表中全部权限（ALL）
 */
export function useHasAllPermissions(requiredList: PermissionFlag[]): boolean {
  const perms = useUserPermissions()
  const has = useMemo(() => {
    if (requiredList.length === 0) {
      return false
    }

    return requiredList.every((r) => matchPermission(perms, r))
  }, [perms, requiredList])

  return has
}

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
}) {
  const { required, children } = props
  const mode = props.mode ?? 'any'
  const fallbackNode = props.fallback ?? (
    <div className={cn('border border-border rounded-md p-6 text-sm text-muted-foreground')}>暂无访问该页面（或区域）的权限</div>
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
 * 组件：按钮级权限控制
 * - 默认无权限时 disabled；若 hideIfDenied 为 true，则隐藏
 */
export function PermitButton(props: {
  required: PermissionFlag
  hideIfDenied?: boolean
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>): React.JSX.Element {
  const { required, hideIfDenied, className, children, ...rest } = props
  const allowed = useHasPermission(required)

  let node: React.ReactNode = null

  if (allowed || !hideIfDenied) {
    node = (
      <button
        {...rest}
        className={cn('inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90', className)}
        disabled={!allowed || rest.disabled}
      >
        {children}
      </button>
    )
  }

  return <>{node}</>
}

/**
 * 客户端路由守卫：在布局或页面中包裹 children，实现按路由的权限控制
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
