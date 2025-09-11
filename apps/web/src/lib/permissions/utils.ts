import { matchPermission, type PermissionFlag } from './matcher'

import { adminNavConfig, type AdminRoutes } from '~admin/lib/admin-nav'

/**
 * 权限相关工具函数
 */

/**
 * 获取用户可访问的管理后台路由列表
 * @param userPermissions 用户权限列表
 * @returns 可访问的路由数组
 */
export function getAccessibleAdminRoutes(
  userPermissions: PermissionFlag[],
): AdminRoutes[] {
  return Object.entries(adminNavConfig)
    .filter(([, config]) => {
      if (!config.requiredPermission) {
        return true
      }

      return matchPermission(userPermissions, config.requiredPermission)
    })
    .map(([route]) => route as AdminRoutes)
}

/**
 * 检查用户是否可以访问指定路由
 * @param userPermissions 用户权限列表
 * @param route 要检查的路由
 * @returns 是否可以访问
 */
export function canAccessRoute(
  userPermissions: PermissionFlag[],
  route: AdminRoutes,
): boolean {
  if (route in adminNavConfig) {
    const config = adminNavConfig[route]

    if (!config.requiredPermission) {
      return true
    }

    return matchPermission(userPermissions, config.requiredPermission)
  }

  return false
}

/**
 * 获取用户无法访问的路由列表
 * @param userPermissions 用户权限列表
 * @returns 无法访问的路由数组
 */
export function getInaccessibleAdminRoutes(
  userPermissions: PermissionFlag[],
): AdminRoutes[] {
  return Object.entries(adminNavConfig)
    .filter(([, config]) => {
      if (!config.requiredPermission) {
        return false
      }

      return !matchPermission(userPermissions, config.requiredPermission)
    })
    .map(([route]) => route as AdminRoutes)
}

/**
 * 根据用户权限筛选导航配置
 * @param userPermissions 用户权限列表
 * @returns 用户可访问的导航配置对象
 */
export function filterNavConfigByPermissions(
  userPermissions: PermissionFlag[],
): Partial<Record<AdminRoutes, typeof adminNavConfig[AdminRoutes]>> {
  const accessibleRoutes = getAccessibleAdminRoutes(userPermissions)
  const result: Partial<Record<AdminRoutes, typeof adminNavConfig[AdminRoutes]>> = {}

  for (const route of accessibleRoutes) {
    result[route] = adminNavConfig[route]
  }

  return result
}
