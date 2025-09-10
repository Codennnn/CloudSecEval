import type { PermissionFlag } from '~/lib/permissions/matcher'

import { AdminRoutes } from '~admin/lib/admin-nav'

/**
 *   UI  
 *  
 */
export const routePermissions: Record<string, PermissionFlag | PermissionFlag[]> = {
  [AdminRoutes.Roles]: 'roles:read',
  [AdminRoutes.Permissions]: 'permissions:read',
  [AdminRoutes.Users]: 'users:read',
  [AdminRoutes.Licenses]: 'licenses:read',
  [AdminRoutes.Dashboard]: 'statistics:read',
}

/**
 *   
 * @param pathname 
 * @returns 
 */
export function resolveRequiredPermissionByPath(
  pathname: string,
): PermissionFlag | PermissionFlag[] | undefined {
  const keys = Object.keys(routePermissions).sort((a, b) => b.length - a.length)
  let required: PermissionFlag | PermissionFlag[] | undefined = undefined

  for (const key of keys) {
    if (pathname.startsWith(key)) {
      required = routePermissions[key]
      break
    }
  }

  return required
}
