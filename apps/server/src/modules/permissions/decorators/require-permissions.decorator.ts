import { SetMetadata } from '@nestjs/common'

/**
 * 权限检查装饰器元数据键
 */
export const PERMISSIONS_KEY = 'permissions'

/**
 * 权限检查模式
 */
export enum PermissionMode {
  /** 需要拥有任一权限 */
  ANY = 'any',
  /** 需要拥有所有权限 */
  ALL = 'all',
}

/**
 * 权限检查选项
 */
interface PermissionOptions {
  /** 检查模式，默认为 ANY */
  mode?: PermissionMode
  /** 是否允许超级管理员绕过检查 */
  allowSuperAdmin?: boolean
}

/**
 * 资源与动作全集（单一事实源）
 *
 * 如需新增资源或动作，请优先在此处维护。
 */
export const RESOURCES = [
  'users',
  'roles',
  'permissions',
  'departments',
  'organizations',
  'statistics',
  'licenses',
  'bug_reports',
  'uploads',
  'admin',
] as const

export const ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'export',
  'review',
  'update_status',
  'batch_operations',
  'stats',
] as const

export type Resource = typeof RESOURCES[number]
export type BaseAction = typeof ACTIONS[number]
export type WildcardAction = '*'
export type Action = BaseAction | WildcardAction

/**
 * 规范化的权限标识符类型 `${resource}:${action}`，支持通配符 `${resource}:*`
 */
export type PermissionSlug = `${Resource}:${Action}`

/**
 * 资源 → 动作的常量映射（非通配符）
 *
 * 注意：通配符请使用 `P(resource).all` 生成；此对象仅维护具体动作，便于 IDE 提示。
 */
export const PERMISSIONS = {
  users: {
    create: 'users:create',
    read: 'users:read',
    update: 'users:update',
    delete: 'users:delete',
    export: 'users:export',
  },
  roles: {
    create: 'roles:create',
    read: 'roles:read',
    update: 'roles:update',
    delete: 'roles:delete',
  },
  permissions: {
    create: 'permissions:create',
    read: 'permissions:read',
    delete: 'permissions:delete',
  },
  departments: {
    create: 'departments:create',
    read: 'departments:read',
    update: 'departments:update',
    delete: 'departments:delete',
  },
  organizations: {
    create: 'organizations:create',
    read: 'organizations:read',
    update: 'organizations:update',
    delete: 'organizations:delete',
  },
  statistics: {
    read: 'statistics:read',
  },
  licenses: {
    create: 'licenses:create',
    read: 'licenses:read',
    update: 'licenses:update',
    delete: 'licenses:delete',
  },
  bug_reports: {
    create: 'bug_reports:create',
    read: 'bug_reports:read',
    update: 'bug_reports:update',
    delete: 'bug_reports:delete',
    review: 'bug_reports:review',
    update_status: 'bug_reports:update_status',
    batch_operations: 'bug_reports:batch_operations',
    stats: 'bug_reports:stats',
  },
  uploads: {
    create: 'uploads:create',
    read: 'uploads:read',
    delete: 'uploads:delete',
  },
  // admin 通常通过通配符控制：P('admin').all → 'admin:*'
  admin: {},
} as const satisfies Record<Resource, Partial<Record<BaseAction, PermissionSlug>>>

/**
 * 权限标识构造器
 *
 * 用于生成 `${resource}:${action}` 字面量，包含 `all` 通配符便捷字段。
 */
export function P<R extends Resource>(resource: R) {
  return {
    create: `${resource}:create` as const,
    read: `${resource}:read` as const,
    update: `${resource}:update` as const,
    delete: `${resource}:delete` as const,
    export: `${resource}:export` as const,
    review: `${resource}:review` as const,
    update_status: `${resource}:update_status` as const,
    batch_operations: `${resource}:batch_operations` as const,
    stats: `${resource}:stats` as const,
    all: `${resource}:*` as const,
  }
}

/**
 * 权限标识符
 * 格式为 'resource:action'
 */
export type PermissionFlag = PermissionSlug

/**
 * 权限元数据
 */
export interface PermissionMetadata {
  permissions: PermissionFlag[]
  options: PermissionOptions
}

/**
 * 权限检查装饰器
 *
 * 用于标记路由需要的权限，配合 PermissionsGuard 使用
 *
 * @param permissions 权限标识符列表
 * @param options 权限检查选项
 */
export function RequirePermissions(
  permissions: PermissionFlag | PermissionFlag[],
  options: PermissionOptions = {},
): MethodDecorator {
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions]

  const metadata: PermissionMetadata = {
    permissions: permissionArray,
    options: {
      mode: PermissionMode.ANY,
      allowSuperAdmin: true,
      ...options,
    },
  }

  return SetMetadata(PERMISSIONS_KEY, metadata)
}

/**
 * 角色检查装饰器元数据键
 */
export const ROLES_KEY = 'roles'

/**
 * 角色检查模式
 */
export enum RoleMode {
  /** 需要拥有任一角色 */
  ANY = 'any',
  /** 需要拥有所有角色 */
  ALL = 'all',
}

/**
 * 角色检查选项
 */
export interface RoleOptions {
  /** 检查模式，默认为 ANY */
  mode?: RoleMode
  /** 是否允许超级管理员绕过检查 */
  allowSuperAdmin?: boolean
}

/**
 * 角色元数据
 */
export interface RoleMetadata {
  roles: string[]
  options: RoleOptions
}

/**
 * 角色检查装饰器
 *
 * 用于标记路由需要的角色，配合 PermissionsGuard 使用
 *
 * @param roles 角色标识符列表
 * @param options 角色检查选项
 */
export function RequireRoles(
  roles: string | string[],
  options: RoleOptions = {},
): MethodDecorator {
  const roleArray = Array.isArray(roles) ? roles : [roles]

  const metadata: RoleMetadata = {
    roles: roleArray,
    options: {
      mode: RoleMode.ANY,
      allowSuperAdmin: true,
      ...options,
    },
  }

  return SetMetadata(ROLES_KEY, metadata)
}
