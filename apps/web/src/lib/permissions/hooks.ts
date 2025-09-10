'use client'

import { useMemo } from 'react'

import { matchPermission, type PermissionFlag } from '~/lib/permissions/matcher'

import { useUserPermissions } from '~admin/stores/useUserStore'

/** 权限校验模式 */
export const enum PermissionMode {
  /** 满足任意一个权限条件即可通过校验 */
  Any = 'any',
  /** 必须满足所有权限条件才能通过校验 */
  All = 'all',
}

/**
 * Hook：通用权限校验（支持单个权限或多个权限的 any/all 模式）
 */
export function useHasPermissions(
  required: PermissionFlag | PermissionFlag[],
  mode: PermissionMode = PermissionMode.Any,
): boolean {
  const perms = useUserPermissions()
  const has = useMemo(() => {
    if (typeof required === 'string') {
      return matchPermission(perms, required)
    }

    if (required.length === 0) {
      return false
    }

    if (mode === PermissionMode.Any) {
      return required.some((r) => matchPermission(perms, r))
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (mode === PermissionMode.All) {
      return required.every((r) => matchPermission(perms, r))
    }

    return false
  }, [perms, required, mode])

  return has
}
