import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminLoginRoute, loginRedirectRoute } from '~admin/lib/admin-nav'
import { useUserStore } from '~admin/stores/useUserStore'
import { authControllerLoginMutation, authControllerLogoutMutation } from '~api/@tanstack/react-query.gen'

/**
 * 登录 Hook
 *
 * 功能特性：
 * - 用户登录认证
 * - 自动存储 Token
 * - 登录成功后跳转
 * - 错误处理和提示
 */
export function useLogin() {
  const router = useRouter()

  const { setUser } = useUserStore()

  return useMutation({
    ...authControllerLoginMutation(),
    onSuccess: (data) => {
      const user = data.data.user

      // 同步用户信息到 store（持久化存储）
      setUser(user)

      router.replace(loginRedirectRoute)
    },
  })
}

/**
 * 登出 Hook
 *
 * 功能特性：
 * - 用户登出
 * - 清除本地存储的认证信息
 * - 清除查询缓存
 * - 跳转到登录页
 */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { clearUser } = useUserStore()

  return useMutation({
    ...authControllerLogoutMutation(),
    onSuccess: () => {
      clearUser()

      // 清除所有查询缓存
      queryClient.clear()

      router.replace(adminLoginRoute)
    },
  })
}
