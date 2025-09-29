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
