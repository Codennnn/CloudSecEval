'use client'

import { create } from 'zustand'

/**
 * 简约确认对话框配置选项
 */
export interface SimpleConfirmDialogOptions {
  /** 操作的标题 */
  title: string
  /** 操作的描述信息 */
  description?: React.ReactNode
  /** 确认按钮文本 */
  confirmButtonText?: string
  /** 取消按钮文本 */
  cancelButtonText?: string
  /** 按钮变体类型 */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /** 是否显示警告信息 */
  showWarning?: boolean
  /** 自定义警告信息 */
  warningMessage?: string
  /** 确认操作的回调 */
  onConfirm: () => void | Promise<void>
  /** 取消操作的回调（可选） */
  onCancel?: () => void
}

/**
 * 简约确认对话框状态
 */
interface SimpleConfirmDialogState {
  /** 对话框是否打开 */
  isOpen: boolean
  /** 是否正在执行操作 */
  isLoading: boolean
  /** 对话框配置选项 */
  options?: SimpleConfirmDialogOptions
}

/**
 * 简约确认对话框操作
 */
interface SimpleConfirmDialogActions {
  /** 显示确认对话框 */
  showConfirmDialog: (options: SimpleConfirmDialogOptions) => void
  /** 关闭对话框 */
  closeDialog: () => void
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
  /** 重置状态 */
  reset: () => void
}

/**
 * 简约确认对话框 Store 类型
 */
type SimpleConfirmDialogStore = SimpleConfirmDialogState & SimpleConfirmDialogActions

/**
 * 初始状态
 */
const initialState: SimpleConfirmDialogState = {
  isOpen: false,
  isLoading: false,
  options: undefined,
}

/**
 * 简约确认对话框 Store
 *
 * 提供全局的简约确认对话框状态管理
 * 支持命令式调用，无需在每个组件中显式插入对话框组件
 */
export const useSimpleConfirmDialogStore = create<SimpleConfirmDialogStore>((set, get) => ({
  ...initialState,

  showConfirmDialog: (options: SimpleConfirmDialogOptions) => {
    set({
      isOpen: true,
      isLoading: false,
      options,
    })
  },

  closeDialog: () => {
    const { options } = get()

    // 如果有取消回调，执行它
    if (options?.onCancel) {
      options.onCancel()
    }

    set({
      isOpen: false,
      isLoading: false,
      options: undefined,
    })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  reset: () => {
    set(initialState)
  },
}))

/**
 * 简约确认对话框 Hook
 *
 * 提供便捷的方法来显示和控制简约确认对话框
 */
export function useSimpleConfirmDialog() {
  const {
    showConfirmDialog,
    closeDialog,
    setLoading,
    reset,
  } = useSimpleConfirmDialogStore()

  return {
    showConfirmDialog,
    closeDialog,
    setLoading,
    reset,
  }
}
