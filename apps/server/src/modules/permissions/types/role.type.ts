import type { Permission, Role, UserRole } from '#prisma/client'

/**
 * 角色类型枚举
 */
export const ROLE_TYPES = {
  /** 系统级角色（跨组织） */
  SYSTEM: 'system',
  /** 组织级角色 */
  ORGANIZATION: 'organization',
} as const

export type RoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES]

/**
 * 权限资源枚举
 * TODO: 后续可扩展更多资源类型
 */
export const PERMISSION_RESOURCES = {
  USERS: 'users',
  DEPARTMENTS: 'departments',
  ORGANIZATIONS: 'organizations',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  STATISTICS: 'statistics',
  LICENSES: 'licenses',
  ADMIN: 'admin',
} as const

export type PermissionResource = typeof PERMISSION_RESOURCES[keyof typeof PERMISSION_RESOURCES]

/**
 * 权限操作枚举
 */
export const PERMISSION_ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ALL: '*',
} as const

export type PermissionAction = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS]

/**
 * 带关联信息的角色类型
 */
export interface RoleWithRelations extends Role {
  organization?: { id: string, name: string } | null
  rolePermissions?: {
    permission: Permission
  }[]
  userRoles?: UserRole[]
  _count?: {
    rolePermissions?: number
    userRoles?: number
  }
}

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

/**
 * 角色分配选项
 */
export interface RoleAssignmentOptions {
  /** 分配备注 */
  note?: string
  /** 过期时间 */
  expiresAt?: Date
  /** 是否发送通知 */
  sendNotification?: boolean
}

/**
 * 批量角色分配结果
 */
export interface BatchRoleAssignmentResult {
  /** 成功分配的用户ID列表 */
  successUserIds: string[]
  /** 失败的用户ID和原因 */
  failures: {
    userId: string
    reason: string
  }[]
  /** 总数统计 */
  summary: {
    total: number
    success: number
    failed: number
  }
}
