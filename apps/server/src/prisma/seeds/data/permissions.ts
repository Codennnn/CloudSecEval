/**
 * 系统权限种子数据
 *
 * 定义系统中所有可用的权限
 */

export interface PermissionSeedData {
  resource: string
  action: string
  description: string
}

/**
 * 权限种子数据
 *
 * 按资源分组定义权限，支持通配符权限
 */
export const PERMISSION_SEEDS: PermissionSeedData[] = [
  // 用户管理权限
  { resource: 'users', action: 'read', description: '查看用户列表和详情' },
  { resource: 'users', action: 'create', description: '创建新用户' },
  { resource: 'users', action: 'update', description: '更新用户信息' },
  { resource: 'users', action: 'delete', description: '删除用户' },
  { resource: 'users', action: '*', description: '用户管理全部权限' },

  // 部门管理权限
  { resource: 'departments', action: 'read', description: '查看部门列表和详情' },
  { resource: 'departments', action: 'create', description: '创建新部门' },
  { resource: 'departments', action: 'update', description: '更新部门信息' },
  { resource: 'departments', action: 'delete', description: '删除部门' },
  { resource: 'departments', action: '*', description: '部门管理全部权限' },

  // 组织管理权限
  { resource: 'organizations', action: 'read', description: '查看组织信息' },
  { resource: 'organizations', action: 'update', description: '更新组织信息' },
  { resource: 'organizations', action: '*', description: '组织管理全部权限' },

  // 角色管理权限
  { resource: 'roles', action: 'read', description: '查看角色列表和详情' },
  { resource: 'roles', action: 'create', description: '创建新角色' },
  { resource: 'roles', action: 'update', description: '更新角色信息和权限' },
  { resource: 'roles', action: 'delete', description: '删除角色' },
  { resource: 'roles', action: 'assign', description: '分配角色给用户' },
  { resource: 'roles', action: '*', description: '角色管理全部权限' },

  // 权限管理权限
  { resource: 'permissions', action: 'read', description: '查看权限目录' },
  { resource: 'permissions', action: 'create', description: '创建新权限' },
  { resource: 'permissions', action: 'delete', description: '删除权限' },
  { resource: 'permissions', action: '*', description: '权限管理全部权限' },

  // 统计分析权限
  { resource: 'statistics', action: 'read', description: '查看统计数据' },
  { resource: 'statistics', action: '*', description: '统计分析全部权限' },

  // 授权码管理权限
  { resource: 'licenses', action: 'read', description: '查看授权码列表和详情' },
  { resource: 'licenses', action: 'create', description: '创建新授权码' },
  { resource: 'licenses', action: 'update', description: '更新授权码信息' },
  { resource: 'licenses', action: 'delete', description: '删除授权码' },
  { resource: 'licenses', action: '*', description: '授权码管理全部权限' },

  // 系统管理权限（超级管理员）
  { resource: 'admin', action: '*', description: '系统管理员全部权限' },
]

/**
 * 按资源分组的权限数据
 */
export const PERMISSIONS_BY_RESOURCE
  = PERMISSION_SEEDS.reduce<Record<string, PermissionSeedData[]>>((acc, permission) => {
    const { resource } = permission

    if (!(resource in acc)) {
      acc[resource] = []
    }

    acc[resource].push(permission)

    return acc
  }, {})

/**
 * 资源显示名称映射
 */
export const RESOURCE_DISPLAY_NAMES: Record<string, string> = {
  users: '用户管理',
  departments: '部门管理',
  organizations: '组织管理',
  roles: '角色管理',
  permissions: '权限管理',
  statistics: '统计分析',
  licenses: '授权码管理',
  admin: '系统管理',
}
