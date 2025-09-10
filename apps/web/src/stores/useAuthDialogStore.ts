import { create } from 'zustand'

/**
 * AuthDialog 配置接口
 */
interface AuthDialogConfig {
  /** 对话框标题 */
  title?: string
  /** 对话框描述文本 */
  description?: string
  /** 授权成功后的回调函数 */
  onSuccess?: () => void
}

interface AuthDialogState {
  /** 对话框是否打开 */
  isOpen: boolean
  /** 对话框配置 */
  config: AuthDialogConfig

  /** 打开授权对话框 */
  openAuthDialog: (config?: AuthDialogConfig) => void
  /** 关闭授权对话框 */
  closeAuthDialog: () => void
  /** 设置对话框配置 */
  setConfig: (config: AuthDialogConfig) => void
}

/**
 * AuthDialog 全局状态管理 Store
 * 用于控制授权对话框的显示状态和配置
 */
export const useAuthDialogStore = create<AuthDialogState>()((set) => ({
  isOpen: false,
  config: {},

  openAuthDialog: (config = {}) => {
    set({ isOpen: true, config })
  },

  closeAuthDialog: () => {
    set({ isOpen: false, config: {} })
  },

  setConfig: (config) => {
    set((state) => ({ config: { ...state.config, ...config } }))
  },
}))

// ==================== 便捷的选择器 hooks ====================

/**
 * 获取 AuthDialog 的打开状态
 * @returns 对话框是否打开的布尔值
 */
export function useAuthDialogOpen() {
  return useAuthDialogStore((state) => state.isOpen)
}

/**
 * 获取 AuthDialog 的配置
 * @returns 对话框配置对象
 */
export function useAuthDialogConfig() {
  return useAuthDialogStore((state) => state.config)
}

/**
 * 获取打开 AuthDialog 的函数
 * @returns 打开对话框的函数
 */
export function useOpenAuthDialog() {
  return useAuthDialogStore((state) => state.openAuthDialog)
}

/**
 * 获取关闭 AuthDialog 的函数
 * @returns 关闭对话框的函数
 */
export function useCloseAuthDialog() {
  return useAuthDialogStore((state) => state.closeAuthDialog)
}
