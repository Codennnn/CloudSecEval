import { SYSTEM_PERMISSIONS } from '~/common/constants/permissions'

/**
 * 系统角色种子数据
 *
 * 定义系统内置角色和其权限配置
 */

export interface RoleSeedData {
  name: string
  slug: string
  description: string
  system: boolean
  isActive: boolean
  permissions: string[] // permission slugs
}

/**
 * 系统内置角色种子数据
 *
 * 这些角色在所有组织中都可用，为系统级角色
 */
export const SYSTEM_ROLE_SEEDS: RoleSeedData[] = [
  {
    name: '超级管理员',
    slug: 'super_admin',
    description: '拥有系统全部权限，可管理所有组织和用户',
    system: true,
    isActive: true,
    permissions: [SYSTEM_PERMISSIONS.SUPER_ADMIN],
  },
  {
    name: '组织拥有者',
    slug: 'org_owner',
    description: '组织拥有者，拥有组织内全部管理权限',
    system: true,
    isActive: true,
    permissions: [
      'users:*',
      'departments:*',
      'organizations:*',
      'roles:*',
      'permissions:read',
      'statistics:read',
      'licenses:*',
    ],
  },
  {
    name: '组织管理员',
    slug: 'org_admin',
    description: '组织管理员，可管理组织内的用户和部门',
    system: true,
    isActive: true,
    permissions: [
      'users:read',
      'users:create',
      'users:update',
      'departments:*',
      'organizations:read',
      'roles:read',
      'permissions:read',
      'statistics:read',
      'licenses:read',
    ],
  },
  {
    name: '部门主管',
    slug: 'dept_manager',
    description: '部门主管，可管理部门内的用户',
    system: true,
    isActive: true,
    permissions: [
      'users:read',
      'users:update',
      'departments:read',
      'organizations:read',
      'roles:read',
      'permissions:read',
      'statistics:read',
    ],
  },
  {
    name: '普通成员',
    slug: 'member',
    description: '普通组织成员，只有基础查看权限',
    system: true,
    isActive: true,
    permissions: [
      'users:read',
      'departments:read',
      'organizations:read',
    ],
  },
  {
    name: '审计员',
    slug: 'auditor',
    description: '审计人员，只有查看和统计权限',
    system: true,
    isActive: true,
    permissions: [
      'users:read',
      'departments:read',
      'organizations:read',
      'roles:read',
      'permissions:read',
      'statistics:read',
      'licenses:read',
    ],
  },
]

/**
 * 默认组织角色映射
 *
 * 当创建新组织时，可以基于这些角色创建组织级别的角色
 */
export const DEFAULT_ORG_ROLES: Omit<RoleSeedData, 'system'>[] = [
  {
    name: '组织管理员',
    slug: 'admin',
    description: '组织内部管理员，管理用户和部门',
    isActive: true,
    permissions: [
      'users:*',
      'departments:*',
      'organizations:read',
      'organizations:update',
      'roles:read',
      'permissions:read',
      'statistics:read',
    ],
  },
  {
    name: '人事专员',
    slug: 'hr_specialist',
    description: '人事管理专员，管理用户信息',
    isActive: true,
    permissions: [
      'users:read',
      'users:create',
      'users:update',
      'departments:read',
      'organizations:read',
      'statistics:read',
    ],
  },
  {
    name: '普通员工',
    slug: 'employee',
    description: '普通员工，基础查看权限',
    isActive: true,
    permissions: [
      'users:read',
      'departments:read',
      'organizations:read',
    ],
  },
]

/**
 * 角色权限等级定义
 *
 * 用于权限检查时的优先级判断
 */
export const ROLE_LEVELS: Record<string, number> = {
  super_admin: 100,
  org_owner: 90,
  org_admin: 80,
  admin: 70,
  hr_specialist: 50,
  dept_manager: 60,
  auditor: 40,
  employee: 30,
  member: 20,
}
