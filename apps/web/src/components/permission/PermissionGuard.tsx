'use client'

import { PermissionMode } from '~/constants/permission'
import { useHasPermissions } from '~/lib/permissions/hooks'
import { type PermissionFlag } from '~/lib/permissions/matcher'

interface PermissionGuardProps {
  required: PermissionFlag | PermissionFlag[]
  mode?: PermissionMode
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * 页面/区块权限守卫
 */
export function PermissionGuard(props: PermissionGuardProps) {
  const { required, children } = props

  const fallbackNode = props.fallback ?? null

  const mode = props.mode ?? PermissionMode.Any
  const granted = useHasPermissions(required, mode)

  if (granted) {
    return children
  }
  else {
    return fallbackNode
  }
}
