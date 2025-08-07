'use client'

import { useForm } from 'react-hook-form'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'

interface DeleteConfirmDialogProps {
  /** 对话框打开状态 */
  open: boolean
  /** 对话框打开状态变化回调 */
  onOpenChange: (open: boolean) => void
  /** 要删除项目的标题 */
  title: string
  /** 要删除项目的描述信息 */
  description?: React.ReactNode
  /** 需要用户输入确认的文本 */
  confirmText: string
  /** 删除按钮文本 */
  deleteButtonText?: string
  /** 是否正在删除 */
  isDeleting?: boolean
  /** 确认删除的回调 */
  onConfirm: () => void | Promise<void>
}

/**
 * 删除确认对话框组件
 *
 * 提供完善的二次确认功能，用户需要输入指定文本才能确认删除
 * 适用于危险的删除操作，如删除授权码等重要数据
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  deleteButtonText = '确认删除',
  isDeleting = false,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const form = useForm<{ confirmInput: string }>({
    defaultValues: {
      confirmInput: '',
    },
    mode: 'onChange',
  })

  const watchedInput = form.watch('confirmInput')
  const isConfirmDisabled = watchedInput !== confirmText || isDeleting

  const handleConfirm = async () => {
    if (!isConfirmDisabled) {
      try {
        await onConfirm()
      }
      finally {
        // 无论成功或失败，都重置输入值
        form.reset()
      }
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)

    if (!newOpen) {
      // 关闭对话框时重置输入值
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-error">
            {title}
          </DialogTitle>

          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <CalloutInfo
            description="删除后，相关数据将永久丢失且无法恢复，请谨慎操作！"
            title="警告：此操作不可撤销"
            type="error"
          />

          <div className="py-form-wrapper">
            <Form {...form}>
              <FormField
                control={form.control}
                name="confirmInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      请输入
                      <code>
                        {confirmText}
                      </code>
                      来确认删除：
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        className="font-mono"
                        disabled={isDeleting}
                        placeholder={`请输入 "${confirmText}"`}
                      />
                    </FormControl>
                    {field.value && field.value !== confirmText && (
                      <FormMessage>输入的文本不匹配</FormMessage>
                    )}
                  </FormItem>
                )}
                rules={{
                  required: '请输入确认文本',
                  validate: (value) => value === confirmText || '输入的文本不匹配',
                }}
              />
            </Form>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            disabled={isDeleting}
            type="button"
            variant="outline"
            onClick={() => { handleOpenChange(false) }}
          >
            取消
          </Button>
          <Button
            className="min-w-[100px]"
            disabled={isConfirmDisabled}
            type="button"
            variant="destructive"
            onClick={() => {
              void handleConfirm()
            }}
          >
            {isDeleting
              ? '删除中...'
              : (
                  <>
                    {deleteButtonText}
                  </>
                )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
