type Resource = 'organizations' | 'departments' | 'roles' | 'users' | 'licenses' | 'permissions' | 'statistics' | 'bug_reports' | 'uploads'
type AdminPermission = Record<Resource, Record<string, `${Resource}:${string}`>>

export const adminPermission = {
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
} satisfies AdminPermission

/** 权限校验模式 */
export const enum PermissionMode {
  /** 满足任意一个权限条件即可通过校验 */
  Any = 'any',
  /** 必须满足所有权限条件才能通过校验 */
  All = 'all',
}
