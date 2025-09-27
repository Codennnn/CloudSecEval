import { PermissionMode } from '@mono/constants'

export type PermissionFlag = string

/**
 * 匹配单个权限
 * @param userPerms 用户权限列表
 * @param required 需要的权限
 * @returns 是否匹配
 */
function matchSinglePermission(userPerms: PermissionFlag[], required: PermissionFlag): boolean {
  // 直接匹配
  if (userPerms.includes(required)) {
    return true
  }

  // 通配符匹配
  const [resource] = required.split(':')
  const wildcardPerm = `${resource}:*`

  return userPerms.includes(wildcardPerm)
}

/**
 * 检查用户是否具有指定权限
 * @param userPerms 用户权限列表
 * @param required 需要的权限（单个或数组）
 * @param mode 权限检查模式
 * @returns 是否匹配
 */
export function matchPermission(
  userPerms: PermissionFlag[],
  required: PermissionFlag | PermissionFlag[],
  mode: PermissionMode = PermissionMode.ANY,
): boolean {
  // 超级管理员权限
  if (userPerms.includes('admin:*')) {
    return true
  }

  // 如果是单个权限，直接进行匹配
  if (typeof required === 'string') {
    return matchSinglePermission(userPerms, required)
  }

  // 如果是空数组，返回 false
  if (required.length === 0) {
    return false
  }

  // 根据模式进行权限校验
  switch (mode) {
    case PermissionMode.ANY:
      return required.some((r) => matchSinglePermission(userPerms, r))

    case PermissionMode.ALL:
      return required.every((r) => matchSinglePermission(userPerms, r))

    default:
      return false
  }
}

/**
 * 检查用户是否具有任意一个权限
 * @param userPerms 用户权限列表
 * @param required 需要的权限数组
 * @returns 是否匹配
 */
export function matchAnyPermission(
  userPerms: PermissionFlag[],
  required: PermissionFlag[],
): boolean {
  return matchPermission(userPerms, required, PermissionMode.ANY)
}

/**
 * 检查用户是否具有所有权限
 * @param userPerms 用户权限列表
 * @param required 需要的权限数组
 * @returns 是否匹配
 */
export function matchAllPermissions(
  userPerms: PermissionFlag[],
  required: PermissionFlag[],
): boolean {
  return matchPermission(userPerms, required, PermissionMode.ALL)
}
