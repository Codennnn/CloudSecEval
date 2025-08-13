'use client'

import type { LicenseData } from '~/lib/api/types'

import { LicenseDialog } from './LicenseDialog'

import { useLicenseDialogStore } from '~admin/stores/useLicenseDialogStore'

/**
 * 授权码对话框管理器组件
 *
 * 监听全局状态变化并自动渲染对话框
 * 负责协调对话框的显示逻辑和状态同步
 */
export function LicenseDialogManager() {
  const {
    isOpen,
    mode,
    formData,
    closeDialog,
  } = useLicenseDialogStore()

  /**
   * 处理对话框成功操作
   */
  const handleSuccess = () => {
    closeDialog()
  }

  return (
    <LicenseDialog
      formData={formData}
      mode={mode}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog()
        }
      }}
      onSuccess={() => {
        handleSuccess()
      }}
    />
  )
}
