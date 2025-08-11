import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '~/lib/api/client'
import { authEndpoints } from '~/lib/api/endpoints'
import type { LoginDto, LoginResponse } from '~/lib/api/types'

import { AdminRoutes } from '~admin/lib/admin-nav'
import { useUserStore } from '~admin/stores/useUserStore'

// ==================== 查询键定义 ====================

/**
 * 认证相关查询键
 */
export const authQueryKeys = {
  all: ['auth'] as const,
  profile: () => [...authQueryKeys.all, 'profile'] as const,
} as const

// ==================== Hook 函数 ====================

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
  const queryClient = useQueryClient()
  const { setUser } = useUserStore()

  return useMutation({
    mutationFn: async (loginData: LoginDto): Promise<LoginResponse> => {
      const res = await api.post<LoginResponse>(
        authEndpoints.login(),
        loginData,
      )

      return res
    },
    onSuccess: (data: LoginResponse) => {
      // 缓存用户信息到 React Query
      queryClient.setQueryData(authQueryKeys.profile(), data.user)

      // 同步用户信息到 store（持久化存储）
      setUser(data.user)

      router.replace(AdminRoutes.Dashboard)
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
    mutationFn: async (): Promise<void> => {
      try {
        // 调用后端登出接口
        await api.post(authEndpoints.logout())
      }
      catch (error) {
        // 即使后端登出失败，也继续清除本地状态
        console.warn('后端登出请求失败，继续清除本地状态', error)
      }
    },
    onSuccess: () => {
      clearUser()

      // 清除所有查询缓存
      queryClient.clear()

      router.replace(AdminRoutes.Login)
    },
  })
}
