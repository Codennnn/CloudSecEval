import { useCallback, useEffect, useRef } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useUserStore } from '~admin/stores/useUserStore'
import { authControllerGetProfileOptions } from '~api/@tanstack/react-query.gen'

/**
 * 用户数据同步 Hook
 *
 * 功能特性：
 * - 在应用启动时同步 React Query 中的用户数据到 store
 * - 确保两个状态管理系统的数据一致性
 * - 处理页面刷新后的状态恢复
 * - 防止认证失败时的无限循环渲染
 *
 * 使用场景：
 * - 在根组件或布局组件中调用
 * - 确保用户状态在整个应用中保持同步
 */
export function useUserSync() {
  const hasHandledErrorRef = useRef(false)
  const hasHandledSuccessRef = useRef(false)

  const { data, isLoading, isSuccess, isError, error } = useQuery({
    ...authControllerGetProfileOptions(),
    // 认证失败时不要自动重试，避免无限循环
    retry: (failureCount, error) => {
      // 如果是401认证错误，不重试
      if ('status' in error && error.status === 401) {
        return false
      }

      // 其他错误最多重试2次
      return failureCount < 2
    },
    // 增加重试延迟，避免频繁请求
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
  const user = data?.data

  const { setUser, clearUser } = useUserStore()

  // 使用 useCallback 稳定化函数引用
  const handleSuccess = useCallback(() => {
    if (user && !hasHandledSuccessRef.current) {
      setUser(user)
      hasHandledSuccessRef.current = true
      hasHandledErrorRef.current = false // 重置错误标志
    }
  }, [user, setUser])

  const handleError = useCallback(() => {
    if (!hasHandledErrorRef.current) {
      clearUser()
      hasHandledErrorRef.current = true
      hasHandledSuccessRef.current = false // 重置成功标志
    }
  }, [clearUser])

  useEffect(() => {
    if (isSuccess) {
      handleSuccess()
    }
  }, [isSuccess, handleSuccess])

  useEffect(() => {
    if (isError) {
      handleError()
    }
  }, [isError, handleError])

  return {
    isSyncing: isLoading,
    error: isError ? error : null,
  }
}
