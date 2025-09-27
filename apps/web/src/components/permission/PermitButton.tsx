'use client'

import { PermissionMode } from '@mono/constants'
import type { VariantProps } from 'class-variance-authority'

import { Button, type buttonVariants } from '~/components/ui/button'
import { useHasPermissions } from '~/lib/permissions/hooks'
import { type PermissionFlag } from '~/lib/permissions/matcher'

type PermitButtonProps
  = React.ComponentProps<typeof Button>
    & VariantProps<typeof buttonVariants>
    & {
      /** 所需的权限（单个权限或权限数组） */
      required: PermissionFlag | PermissionFlag[]
      mode?: PermissionMode
      /** 没有权限时是否隐藏按钮 */
      hideIfDenied?: boolean
    }

export function PermitButton(props: PermitButtonProps) {
  const {
    required,
    mode = PermissionMode.ANY,
    hideIfDenied = false,
    children,
    disabled,
    ...restProps
  } = props

  const allowed = useHasPermissions(required, mode)

  if (!allowed && hideIfDenied) {
    return null
  }

  return (
    <Button
      {...restProps}
      disabled={!allowed || disabled}
    >
      {children}
    </Button>
  )
}
