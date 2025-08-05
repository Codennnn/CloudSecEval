import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '~/lib/api/client'
import { authEndpoints } from '~/lib/api/endpoints'
import type { LoginDto, LoginResponse, User } from '~/lib/api/types'

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
 *
 * @returns 登录相关的状态和方法
 */
export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (loginData: LoginDto): Promise<LoginResponse> => {
      return await api.post<LoginResponse>(
        authEndpoints.login(),
        loginData,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        },
      )
    },
    onSuccess: (data: LoginResponse) => {
      // 缓存用户信息到 React Query
      queryClient.setQueryData(authQueryKeys.profile(), data.user)

      // 显示成功提示
      toast.success('登录成功！')

      // 跳转到管理后台首页
      router.push('/admini/dashboard')
    },
    onError: (error: Error) => {
      // 错误提示已在 api client 中处理
      console.error('登录失败：', error)
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
 *
 * @returns 登出相关的状态和方法
 */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

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
      // HttpOnly Cookie 由后端清除，前端无需手动操作
      // 后端登出接口应该清除 HttpOnly Cookie

      // 清除所有查询缓存
      queryClient.clear()

      // 显示成功提示
      toast.success('已成功登出')

      // 跳转到登录页
      router.push('/admini/login')
    },
    onError: (error: Error) => {
      console.error('登出失败：', error)
      toast.error('登出失败，请重试')
    },
  })
}

/**
 * 获取当前用户信息 Hook
 *
 * 功能特性：
 * - 获取当前登录用户的详细信息
 * - 自动缓存用户数据
 * - 支持自动重新获取
 *
 * @returns 用户信息查询状态和数据
 */
export function useProfile() {
  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: async (): Promise<User> => {
      return await api.get<User>(authEndpoints.profile())
    },
    // 由于使用 HttpOnly Cookie，总是尝试获取用户信息
    // 如果未登录，后端会返回 401 错误
    enabled: typeof window !== 'undefined',
    // 数据比较稳定，可以缓存长一点
    staleTime: 10 * 60 * 1000, // 10 分钟
    retry: (failureCount, error) => {
      // 如果是认证错误（401），不重试
      if (typeof error === 'object' && 'status' in error && error.status === 401) {
        return false
      }

      return failureCount < 2
    },
  })
}

/**
 * 检查用户是否已登录
 *
 * 由于使用 HttpOnly Cookie，无法通过 JavaScript 直接检查
 * 改为通过查询用户信息来判断登录状态
 *
 * @returns 登录状态查询结果
 */
export function useIsAuthenticated() {
  const { data: user, isError, error } = useProfile()

  // 如果有用户数据，说明已登录
  if (user) {
    return { isAuthenticated: true, isLoading: false }
  }

  // 如果是 401 错误，说明未登录
  if (isError && typeof error === 'object' && 'status' in error && error.status === 401) {
    return { isAuthenticated: false, isLoading: false }
  }

  // 其他情况视为加载中
  return { isAuthenticated: false, isLoading: true }
}
