'use client'

import { useUserSync } from '~admin/hooks/useUserSync'

/**
 * 作用：
 * - 在应用启动或页面刷新后主动拉取并对齐用户登录态与基础资料，消除闪烁与数据不一致问题。
 * - 将服务端返回的用户状态同步至 React Query 缓存与全局 store，确保数据源唯一且可追踪。
 * - 在同步期间暂停渲染子树，避免依赖用户信息的组件先渲染后修正导致的 UI 抖动。
 *
 * 使用场景与约束：
 * - 放置于应用入口或根布局的客户端区域内，并且必须包裹在 QueryProvider 内部使用。
 * - 仅负责“状态对齐”，不承担鉴权拦截；鉴权请交由上层路由守卫或专用组件处理。
 *
 * 交互与表现：
 * - 当 isSyncing 为 true 时返回 null，不渲染 children；同步完成后自动恢复渲染，保持过渡自然。
 * - 可与全局骨架屏或占位 UI 配合，统一加载与过渡体验。
 *
 * 推荐用法：
 * - 在 app/layout.tsx 或特定子树布局中包裹依赖用户信息的页面与组件，确保初始渲染即为一致状态。
 */
export function UserSyncProvider({ children }: React.PropsWithChildren) {
  const { isSyncing } = useUserSync()

  if (isSyncing) {
    return null
  }

  return children
}
