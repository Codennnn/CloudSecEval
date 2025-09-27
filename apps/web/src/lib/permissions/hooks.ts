'use client'

import { useMemo } from 'react'

import { PermissionMode } from '@mono/constants'

import { matchPermission, type PermissionFlag } from '~/lib/permissions/matcher'

import { useUserPermissions } from '~admin/stores/useUserStore'

/**
 * Hook：通用权限校验（支持单个权限或多个权限的 PermissionMode.ANY/PermissionMode.ALL 模式）
 */
export function useHasPermissions(
  required: PermissionFlag | PermissionFlag[],
  mode: PermissionMode = PermissionMode.ANY,
): boolean {
  const perms = useUserPermissions()

  const has = useMemo(() => {
    const matcherMode = mode === PermissionMode.ANY ? PermissionMode.ANY : PermissionMode.ALL

    return matchPermission(perms, required, matcherMode)
  }, [perms, required, mode])

  return has
}
