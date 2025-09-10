import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { User } from '~/lib/api/types'

interface UserState {
  // 状态
  user: User | null

  /** 设置用户信息 */
  setUser: (user: User | null) => void
  /** 更新用户信息（部分更新） */
  updateUser: (updates: Partial<User>) => void
  /** 清除用户信息 */
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

      setUser: (user) => {
        set({ user })
      },

      updateUser: (updates) => {
        const currentUser = get().user

        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },

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
export function useUser() {
  return useUserStore((state) => state.user)
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录的布尔值
 */
export function useIsLoggedIn() {
  return useUserStore((state) => Boolean(state.user))
}
