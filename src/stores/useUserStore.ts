import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { User } from '~/lib/api/types'

interface UserState {
  // 状态
  user: User | null

  // 操作
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
}

/**
 * 用户状态管理 Store
 * 使用 Zustand + persist 中间件实现持久化存储
 * 支持页面刷新后状态恢复和跨标签页同步
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,

      /**
       * 设置用户信息
       * @param user - 用户信息对象或 null
       */
      setUser: (user) => {
        set({ user })
      },

      /**
       * 更新用户信息（部分更新）
       * @param updates - 需要更新的用户字段
       */
      updateUser: (updates) => {
        const currentUser = get().user

        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },

      /**
       * 清除用户信息
       */
      clearUser: () => {
        set({ user: null })
      },
    }),
    {
      name: 'user-storage', // localStorage 键名
      partialize: (state) => ({ user: state.user }), // 只持久化 user 数据
    },
  ),
)

// ==================== 便捷的选择器 hooks ====================

/**
 * 获取当前用户信息
 * @returns 当前用户对象或 null
 */
export const useUser = () => useUserStore((state) => state.user)

/**
 * 检查用户是否已登录
 * @returns 是否已登录的布尔值
 */
export const useIsLoggedIn = () => useUserStore((state) => Boolean(state.user))

/**
 * 获取用户操作方法
 * @returns 用户操作方法对象
 */
export const useUserActions = () => useUserStore((state) => ({
  setUser: state.setUser,
  updateUser: state.updateUser,
  clearUser: state.clearUser,
}))
