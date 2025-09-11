type Resource = 'organizations' | 'departments' | 'roles' | 'users' | 'licenses' | 'permissions' | 'statistics'
type AdminPermission = Record<Resource, Record<string, `${Resource}:${string}`>>

export const adminPermission = {
  organizations: {
    all: 'organizations:*',
    read: 'organizations:read',
    create: 'organizations:create',
    update: 'organizations:update',
    delete: 'organizations:delete',
  },
  departments: {
    all: 'departments:*',
    read: 'departments:read',
    create: 'departments:create',
    update: 'departments:update',
    delete: 'departments:delete',
  },
  roles: {
    all: 'roles:*',
    read: 'roles:read',
    create: 'roles:create',
    update: 'roles:update',
    delete: 'roles:delete',
  },
  users: {
    all: 'users:*',
    read: 'users:read',
    create: 'users:create',
    update: 'users:update',
    delete: 'users:delete',
  },
  licenses: {
    all: 'licenses:*',
    read: 'licenses:read',
    create: 'licenses:create',
    update: 'licenses:update',
    delete: 'licenses:delete',
  },
  permissions: {
    all: 'permissions:*',
    read: 'permissions:read',
    create: 'permissions:create',
    update: 'permissions:update',
    delete: 'permissions:delete',
  },
  statistics: {
    all: 'statistics:*',
    read: 'statistics:read',
    create: 'statistics:create',
    update: 'statistics:update',
    delete: 'statistics:delete',
  },
} satisfies AdminPermission/** 权限校验模式 */

export const enum PermissionMode {
  /** 满足任意一个权限条件即可通过校验 */
  Any = 'any',
  /** 必须满足所有权限条件才能通过校验 */
  All = 'all',
}
