import { PermissionMode } from '~/constants/permission'

/**
 * 权限字符串类型（resource:action）
 * 例如："users:read"、"users:*"、"licenses:create"。
 */
export type PermissionFlag = string

/**
 * 内部工具：将权限标识拆分为资源与动作
 * @param flag 权限标识，例如 "users:read"
 * @returns 形如 { resource, action }
 */
function splitFlag(flag: string): { resource: string, action: string } {
  const idx = flag.indexOf(':')
  let resource = ''
  let action = ''

  if (idx !== -1) {
    resource = flag.slice(0, idx)
    action = flag.slice(idx + 1)
  }
  else {
    resource = flag
    action = ''
  }

  return { resource, action }
}

/**
 * 单个权限匹配函数：支持 "resource:action" 与 "resource:*" 通配符
 * @param userPerms 用户拥有的权限列表
 * @param required  需要校验的权限标识
 * @returns 是否匹配
 */
function matchSinglePermission(userPerms: PermissionFlag[], required: PermissionFlag): boolean {
  const req = splitFlag(required)
  let matched = false

  for (const p of userPerms) {
    const cur = splitFlag(p)
    const sameResource = cur.resource === req.resource
    const actionOk = cur.action === req.action || cur.action === '*'

    if (sameResource && actionOk) {
      matched = true
      break
    }
  }

  return matched
}

/**
 * 权限匹配函数：支持单个权限或多个权限的 any/all 模式校验
 * @param userPerms 用户拥有的权限列表
 * @param required  需要校验的权限标识（单个或数组）
 * @param mode      校验模式：'any' 表示满足任一权限即可，'all' 表示必须满足所有权限
 * @returns 是否匹配
 */
export function matchPermission(
  userPerms: PermissionFlag[],
  required: PermissionFlag | PermissionFlag[],
  mode: PermissionMode = PermissionMode.Any,
): boolean {
  // 如果是单个权限，直接进行匹配
  if (typeof required === 'string') {
    return matchSinglePermission(userPerms, required)
  }

  // 如果是空数组，返回 false
  if (required.length === 0) {
    return false
  }

  // 根据模式进行权限校验
  if (mode === PermissionMode.Any) {
    return required.some((r) => matchSinglePermission(userPerms, r))
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (mode === PermissionMode.All) {
    return required.every((r) => matchSinglePermission(userPerms, r))
  }

  return false
}
