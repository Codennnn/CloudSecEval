/**
 * 用户有效权限信息
 */
export interface UserEffectivePermissions {
  userId: string
  orgId: string
  permissions: Set<string>
  roles: {
    id: string
    name: string
    slug: string
  }[]
  /** 权限缓存的过期时间 */
  cachedAt?: Date
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  /** 是否有权限 */
  hasPermission: boolean
  /** 匹配的权限列表 */
  matchedPermissions: string[]
  /** 用户的所有有效权限 */
  userPermissions: string[]
}
