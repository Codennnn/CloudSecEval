import { type PermissionFlag, PermissionMode } from '@mono/constants'
import { SetMetadata } from '@nestjs/common'

/**
 * 权限检查装饰器元数据键
 */
export const PERMISSIONS_KEY = 'permissions'

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
  const permissionArray = Array.isArray(permissions)
    ? permissions
    : [permissions]

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
