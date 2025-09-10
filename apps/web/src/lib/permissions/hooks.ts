'use client'

import { useMemo } from 'react'

import { matchPermission, type PermissionFlag } from '~/lib/permissions/matcher'

import { useUserStore } from '~admin/stores/useUserStore'

/**
 * Hook：获取当前用户权限列表
 * @returns 权限标识字符串数组（如 ["users:read", "users:*"]）
 */
export function useUserPermissions(): PermissionFlag[] {
  const perms = useUserStore((s) => s.user?.permissions ?? [])

  return perms
}

/**
 * 权限校验模式
 * 使用 const enum 确保类型安全并通过编译时优化提升运行时性能
 */
export const enum PermissionMode {
  /** 满足任意一个权限条件即可通过校验 */
  Any = 'any',
  /** 必须满足所有权限条件才能通过校验 */
  All = 'all',
}

/**
 * Hook：判断是否具有指定权限
 * @param required 需要检查的权限标识（resource:action）
 * @returns 是否具有该权限
 */
export function useHasPermission(required: PermissionFlag): boolean {
  const perms = useUserPermissions()
  const has = useMemo(() => {
    const result = matchPermission(perms, required)

    return result
  }, [perms, required])

  return has
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
    // 如果是单个权限，直接校验
    if (typeof required === 'string') {
      return matchPermission(perms, required)
    }

    // 如果是权限数组，根据模式进行校验
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

/**
 * Hook：判断是否具有任一权限（ANY 模式）
 * @param requiredList 需要检查的权限标识列表
 * @returns 是否至少具有其中之一
 */
export function useHasAnyPermission(requiredList: PermissionFlag[]): boolean {
  const perms = useUserPermissions()
  const has = useMemo(() => {
    let result = false

    if (requiredList.length > 0) {
      result = requiredList.some((r) => matchPermission(perms, r))
    }
    else {
      result = false
    }

    return result
  }, [perms, requiredList])

  return has
}

/**
 * Hook：判断是否同时具有所有权限（ALL 模式）
 * @param requiredList 需要检查的权限标识列表
 * @returns 是否全部具备
 */
export function useHasAllPermissions(requiredList: PermissionFlag[]): boolean {
  const perms = useUserPermissions()
  const has = useMemo(() => {
    let result = false

    if (requiredList.length > 0) {
      result = requiredList.every((r) => matchPermission(perms, r))
    }
    else {
      result = false
    }

    return result
  }, [perms, requiredList])

  return has
}
