'use client'

import { UserIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { cn } from '~/lib/utils'

/**
 * 用户头像组件的属性接口
 */
export interface UserAvatarProps {
  /** 用户名称，用于生成头像的 alt 文本和首字母 fallback */
  name?: string | null
  /** 头像图片 URL */
  avatarUrl?: string | null
  /** 头像大小，支持预设大小或自定义 className */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** 自定义样式类名 */
  className?: string
  /** 是否显示圆角边框 */
  rounded?: boolean
  /** 自定义 fallback 内容，如果不提供则使用默认的用户图标或首字母 */
  fallback?: React.ReactNode
  /** 是否显示首字母 fallback（当没有头像时） */
  showInitials?: boolean
}

/**
 * 预设的头像大小样式映射
 */
const sizeClassNames = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
  xl: 'size-16',
  '2xl': 'size-24',
} as const

/**
 * 获取用户名称的首字母
 * @param name - 用户名称
 * @returns 首字母（大写）
 */
function getInitials(name: UserAvatarProps['name']): string {
  if (name) {
    return name.charAt(0).toUpperCase()
  }

  return ''
}

/**
 * 可复用的用户头像组件
 *
 * 支持多种尺寸、样式自定义、fallback 显示等功能
 * 可用于导航栏、个人资料页、用户列表等多个场景
 */
export function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
  className,
  rounded = false,
  fallback,
  showInitials = true,
}: UserAvatarProps) {
  const sizeClassName = sizeClassNames[size]
  const initials = getInitials(name)
  const displayName = name ?? '-'

  return (
    <Avatar
      className={cn(
        sizeClassName,
        rounded && 'rounded-lg',
        className,
      )}
    >
      <AvatarImage
        alt={displayName}
        src={avatarUrl ?? undefined}
      />

      <AvatarFallback
        className={cn(
          rounded && 'rounded-lg',
          // 根据尺寸调整文字大小
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          size === 'xl' && 'text-lg',
          size === '2xl' && 'text-2xl',
        )}
      >
        {fallback ?? (
          showInitials && initials
            ? initials
            : (
                <UserIcon
                  className={cn(
                    size === 'sm' && 'size-3',
                    size === 'md' && 'size-4',
                    size === 'lg' && 'size-5',
                    size === 'xl' && 'size-8',
                    size === '2xl' && 'size-12',
                  )}
                />
              )
        )}
      </AvatarFallback>
    </Avatar>
  )
}
