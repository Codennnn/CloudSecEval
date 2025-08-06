'use client'

import { useUserSync } from '~admin/hooks/useUserSync'

/**
 * 用户同步提供者组件
 *
 * 功能特性：
 * - 在应用启动时自动同步用户状态
 * - 确保 React Query 和 store 的数据一致性
 * - 处理页面刷新后的状态恢复
 *
 * 使用方式：
 * - 在根布局或应用入口处使用
 * - 必须在 QueryProvider 内部使用
 */
export function UserSyncProvider({ children }: React.PropsWithChildren) {
  // 执行用户数据同步逻辑
  useUserSync()

  return children
}
