'use client'

import { useMemo } from 'react'

import { PermissionMode } from '~/constants/permission'
import { matchPermission, type PermissionFlag } from '~/lib/permissions/matcher'

import { useUserPermissions } from '~admin/stores/useUserStore'

/**
 * Hook：通用权限校验（支持单个权限或多个权限的 any/all 模式）
 */
export function useHasPermissions(
  required: PermissionFlag | PermissionFlag[],
  mode: PermissionMode = PermissionMode.Any,
): boolean {
  const perms = useUserPermissions()

  const has = useMemo(() => {
    const matcherMode = mode === PermissionMode.Any ? PermissionMode.Any : PermissionMode.All

    return matchPermission(perms, required, matcherMode)
  }, [perms, required, mode])

  return has
}
