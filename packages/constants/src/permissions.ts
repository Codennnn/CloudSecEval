/**
 * 权限系统常量
 *
 * 统一管理前后端权限相关的常量定义，确保权限系统的一致性
 */

/**
 * 规范化的权限标识符类型 `${resource}:${action}`，支持通配符 `${resource}:*`
 */
export type PermissionFlag = `${Resource}:${string}`

/**
 * 系统权限常量
 */
export const SYSTEM_PERMISSIONS: Record<string, string> = {
  /** 超级管理员权限，拥有所有权限 */
  SUPER_ADMIN: 'admin:*',
}

/**
 * 权限校验模式枚举
 */
export enum PermissionMode {
  /** 满足任意一个权限条件即可通过校验 */
  ANY = 'any',
  /** 必须满足所有权限条件才能通过校验 */
  ALL = 'all',
}

/**
 * 资源类型定义
 */
export type Resource
  = 'organizations'
    | 'departments'
    | 'roles'
    | 'users'
    | 'licenses'
    | 'permissions'
    | 'statistics'
    | 'bug_reports'
    | 'uploads'

/**
 * 管理员权限配置
 * 定义各个资源的具体权限操作
 */
export const PERMISSIONS: Record<Resource, Record<string, PermissionFlag>> = {
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
    manage: 'bug_reports:manage',
    create: 'bug_reports:create',
    read: 'bug_reports:read',
    update: 'bug_reports:update',
    delete: 'bug_reports:delete',
    review: 'bug_reports:review',
    update_status: 'bug_reports:update_status',
    batch_operations: 'bug_reports:batch_operations',
    stats: 'bug_reports:stats',
    member_manage: 'bug_reports:member_manage',
    client_manage: 'bug_reports:client_manage',
  },
  uploads: {
    create: 'uploads:create',
    read: 'uploads:read',
    delete: 'uploads:delete',
  },
}
