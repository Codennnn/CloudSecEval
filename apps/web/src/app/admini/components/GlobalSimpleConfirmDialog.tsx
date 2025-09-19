'use client'

import { consola } from 'consola'

import { useSimpleConfirmDialogStore } from '../stores/useSimpleConfirmDialogStore'

import { SimpleConfirmDialog } from './SimpleConfirmDialog'

/**
 * 全局简约确认对话框组件
 *
 * 该组件应该被放置在应用的根级别（如 layout.tsx 中），
 * 用于监听全局状态并自动显示简约确认对话框
 *
 * 使用方式：
 * 1. 在 layout.tsx 或其他根组件中引入此组件
 * 2. 在任何地方使用 useSimpleConfirmDialog hook 来显示对话框
 */
export function GlobalSimpleConfirmDialog() {
  const {
    isOpen,
    isLoading,
    options,
    closeDialog,
    setLoading,
  } = useSimpleConfirmDialogStore()

  const handleConfirm = async () => {
    if (!options?.onConfirm || isLoading) {
      return
    }

    try {
      setLoading(true)
      await options.onConfirm()
      closeDialog()
    }
    catch (error) {
      consola.error('确认操作执行失败:', error)
      // 发生错误时不关闭对话框，让用户可以重试
    }
    finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      closeDialog()
    }
  }

  if (!options) {
    return null
  }

  return (
    <SimpleConfirmDialog
      cancelButtonText={options.cancelButtonText}
      confirmButtonText={options.confirmButtonText}
      description={options.description}
      isLoading={isLoading}
      open={isOpen}
      showWarning={options.showWarning}
      title={options.title}
      variant={options.variant}
      warningMessage={options.warningMessage}
      onConfirm={handleConfirm}
      onOpenChange={handleOpenChange}
    />
  )
}
