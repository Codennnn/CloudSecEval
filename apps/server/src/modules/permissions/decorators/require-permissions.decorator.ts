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
 * 权限标识符
 * 格式为 'resource:action'
 */
export type PermissionFlag = string

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
