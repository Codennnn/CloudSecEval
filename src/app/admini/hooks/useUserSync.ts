import { useEffect } from 'react'

import { useUserStore } from '~/stores/useUserStore'

import { useProfile } from '~admin/hooks/api/useAuth'

/**
 * 用户数据同步 Hook
 *
 * 功能特性：
 * - 在应用启动时同步 React Query 中的用户数据到 Zustand store
 * - 确保两个状态管理系统的数据一致性
 * - 处理页面刷新后的状态恢复
 *
 * 使用场景：
 * - 在根组件或布局组件中调用
 * - 确保用户状态在整个应用中保持同步
 */
export function useUserSync() {
  const { data: user, isSuccess, isError } = useProfile()
  const { user: storeUser, setUser, clearUser } = useUserStore()

  useEffect(() => {
    // 如果 React Query 成功获取到用户数据，且与 store 中的数据不一致
    if (isSuccess) {
      // 检查是否需要更新 store（避免不必要的更新）
      if (!storeUser || storeUser.id !== user.id) {
        setUser(user)
      }
    }

    // 如果 React Query 获取用户数据失败（如 401 未登录），清除 store 中的数据
    if (isError && storeUser) {
      clearUser()
    }
  }, [isSuccess, isError, user, storeUser, setUser, clearUser])

  return {
    /**
     * 是否正在同步用户数据
     */
    isSyncing: !isSuccess && !isError,

    /**
     * 同步是否完成
     */
    isSynced: isSuccess || isError,
  }
}
