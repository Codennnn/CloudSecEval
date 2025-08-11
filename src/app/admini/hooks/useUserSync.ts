import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useUser, useUserStore } from '~admin/stores/useUserStore'
import { authControllerGetProfileOptions } from '~api/@tanstack/react-query.gen'

/**
 * 用户数据同步 Hook
 *
 * 功能特性：
 * - 在应用启动时同步 React Query 中的用户数据到 store
 * - 确保两个状态管理系统的数据一致性
 * - 处理页面刷新后的状态恢复
 *
 * 使用场景：
 * - 在根组件或布局组件中调用
 * - 确保用户状态在整个应用中保持同步
 */
export function useUserSync() {
  const storeUser = useUser()

  const { data, isLoading, isSuccess, isError } = useQuery({
    ...authControllerGetProfileOptions(),
    enabled: !storeUser,
  })
  const user = data?.data

  const { setUser, clearUser } = useUserStore()

  useEffect(() => {
    // 如果成功获取到用户数据，则存储到 store 中
    if (isSuccess) {
      if (user) {
        setUser(user)
      }
    }

    // 如果获取用户数据失败（如 401 未登录），则清除 store 中的数据
    if (isError) {
      clearUser()
    }
  }, [isSuccess, isError, user, setUser, clearUser])

  return {
    /**
     * 是否正在同步用户数据
     */
    isSyncing: isLoading,
  }
}
