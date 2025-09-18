/**
 * 权限相关常量
 *
 * 统一管理权限系统中使用的常量，避免在代码中使用魔法字符串
 */

/**
 * 系统权限常量
 */
export const SYSTEM_PERMISSIONS = {
  /** 超级管理员权限，拥有所有权限 */
  SUPER_ADMIN: 'admin:*',
} as const

/**
 * 权限检查模式
 */
export const PERMISSION_CHECK_MODES = {
  /** 任意一个权限匹配即可 */
  ANY: 'ANY',
  /** 所有权限都必须匹配 */
  ALL: 'ALL',
} as const

/**
 * 角色检查模式
 */
export const ROLE_CHECK_MODES = {
  /** 任意一个角色匹配即可 */
  ANY: 'ANY',
  /** 所有角色都必须匹配 */
  ALL: 'ALL',
} as const

// 类型定义
export type SystemPermission = typeof SYSTEM_PERMISSIONS[keyof typeof SYSTEM_PERMISSIONS]
export type PermissionCheckMode = typeof PERMISSION_CHECK_MODES[keyof typeof PERMISSION_CHECK_MODES]
export type RoleCheckMode = typeof ROLE_CHECK_MODES[keyof typeof ROLE_CHECK_MODES]
