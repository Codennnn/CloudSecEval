'use client'

import { CalloutInfo } from '~/components/doc/CalloutInfo'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

interface SimpleConfirmDialogProps {
  /** 对话框打开状态 */
  open: boolean
  /** 对话框打开状态变化回调 */
  onOpenChange: (open: boolean) => void
  /** 操作的标题 */
  title: string
  /** 操作的描述信息 */
  description?: React.ReactNode
  /** 确认按钮文本 */
  confirmButtonText?: string
  /** 取消按钮文本 */
  cancelButtonText?: string
  /** 是否正在执行操作 */
  isLoading?: boolean
  /** 确认操作的回调 */
  onConfirm: () => void | Promise<void>
  /** 按钮变体类型 */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /** 是否显示警告信息 */
  showWarning?: boolean
  /** 自定义警告信息 */
  warningMessage?: string
}

/**
 * 简约二次确认对话框组件
 *
 * 提供简洁直观的确认功能，用户只需点击确认按钮即可执行操作
 * 适用于需要二次确认但不需要输入验证的场景
 */
export function SimpleConfirmDialog(props: SimpleConfirmDialogProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    confirmButtonText = '确认',
    cancelButtonText = '取消',
    isLoading = false,
    onConfirm,
    variant = 'default',
    showWarning = false,
    warningMessage = '此操作执行后可能无法撤销，请确认是否继续？',
  } = props

  const handleConfirm = async () => {
    if (!isLoading) {
      try {
        await onConfirm()
      }
      catch (error) {
        // 错误处理可以在父组件中进行
        console.error('操作执行失败:', error)
      }
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
          </DialogTitle>

          {description && (
            <DialogDescription asChild>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {showWarning && (
            <CalloutInfo
              description={warningMessage}
              title="操作提醒"
              type="warning"
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            disabled={isLoading}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => { handleOpenChange(false) }}
          >
            {cancelButtonText}
          </Button>
          <Button
            disabled={isLoading}
            size="sm"
            type="button"
            variant={variant}
            onClick={() => {
              void handleConfirm()
            }}
          >
            {isLoading
              ? '执行中...'
              : confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
