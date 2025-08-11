'use client'

import { create } from 'zustand'

import type { License, LicenseFormData } from '~/lib/api/types'

/**
 * 授权码对话框模式
 */
export type LicenseDialogMode = 'create' | 'edit'

/**
 * 许可证表单初始数据类型
 * 统一处理创建和编辑模式的表单数据
 * - 创建模式：可以传入部分字段作为默认值
 * - 编辑模式：传入完整的授权码数据
 */
export type LicenseFormInitialData = Partial<Omit<LicenseFormData, 'purchaseAmount'>> & {
  // 扩展字段，用于表单特有的属性
  expiresAtType?: 'preset' | 'custom'
  expiresAtPreset?: string
  purchaseAmount?: string | number
}

/**
 * 授权码对话框状态
 */
interface LicenseDialogState {
  /** 对话框是否打开 */
  isOpen: boolean
  /** 对话框模式 */
  mode: LicenseDialogMode
  /** 表单初始数据（创建模式为默认值，编辑模式为完整数据） */
  formData?: LicenseFormInitialData
  /** 成功回调函数 */
  onSuccess?: (license: License) => void
}

/**
 * 授权码对话框操作
 */
interface LicenseDialogActions {
  /** 打开创建对话框 */
  openCreateDialog: (initialData?: LicenseFormInitialData) => void
  /** 打开编辑对话框 */
  openEditDialog: (license: LicenseFormData) => void
  /** 关闭对话框 */
  closeDialog: () => void
  /** 设置成功回调 */
  setOnSuccess: (callback?: (license: License) => void) => void
  /** 重置状态 */
  reset: () => void
}

/**
 * 授权码对话框 Store 类型
 */
type LicenseDialogStore = LicenseDialogState & LicenseDialogActions

/**
 * 初始状态
 */
const initialState: LicenseDialogState = {
  isOpen: false,
  mode: 'create',
  formData: undefined,
  onSuccess: undefined,
}

/**
 * 授权码对话框状态管理器
 *
 * 统一管理授权码对话框的状态和行为，包括：
 * - 对话框的显示/隐藏状态
 * - 当前操作模式（创建/编辑）
 * - 编辑时的授权码数据
 * - 成功回调处理
 */
export const useLicenseDialogStore = create<LicenseDialogStore>((set) => ({
  ...initialState,

  openCreateDialog: (initialData?: LicenseFormInitialData) => {
    set({
      isOpen: true,
      mode: 'create',
      formData: initialData,
    })
  },

  openEditDialog: (license: LicenseFormData) => {
    set({
      isOpen: true,
      mode: 'edit',
      formData: license,
    })
  },

  closeDialog: () => {
    set({
      isOpen: false,
      formData: undefined,
    })
  },

  setOnSuccess: (callback?: (license: License) => void) => {
    set({ onSuccess: callback })
  },

  reset: () => {
    set(initialState)
  },
}))

/**
 * 授权码对话框操作接口
 *
 * 提供授权码对话框的核心操作方法，简化组件中的状态管理
 *
 * @example
 * ```tsx
 * const { openCreateDialog, openEditDialog, closeDialog } = useLicenseDialog()
 *
 * // 创建授权码（无默认值）
 * <Button onClick={() => openCreateDialog()}>新增授权码</Button>
 *
 * // 创建授权码（带默认值）
 * <Button onClick={() => openCreateDialog({
 *   email: 'user@example.com',
 *   purchaseAmount: '99',
 *   expiresAtPreset: '30d'
 * })}>快速创建</Button>
 *
 * // 编辑授权码
 * <Button onClick={() => openEditDialog(license)}>编辑</Button>
 * ```
 *
 * @returns 授权码对话框控制接口
 */
export function useLicenseDialog() {
  const {
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setOnSuccess,
    reset,
  } = useLicenseDialogStore()

  return {
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setOnSuccess,
    reset,
  }
}
