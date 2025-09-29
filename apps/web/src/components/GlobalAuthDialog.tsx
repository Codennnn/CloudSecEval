'use client'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
import { useLicenseVerification } from '~/hooks/useLicenseVerification'
import { useAuthDialogStore } from '~/stores/useAuthDialogStore'
import { useLicenseStore } from '~/stores/useLicenseStore'

const authFormSchema = z.object({
  email: z.email('邮箱格式不正确，请检查后重试'),
  code: z
    .string()
    .min(1, '授权码不能为空'),
})

type AuthFormValues = z.infer<typeof authFormSchema>

/**
 * 全局授权对话框组件
 * 使用 store 管理状态，可以从任何地方触发显示
 */
export function GlobalAuthDialog() {
  const { setLicenseInfo } = useLicenseStore()
  const { isOpen, config, closeAuthDialog } = useAuthDialogStore()

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  })

  const verificationResult = useLicenseVerification()

  const {
    isLoading: isVerifying,
    verify,
  } = verificationResult

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: AuthFormValues) => {
    try {
      const credentials = {
        email: values.email.trim(),
        code: values.code.trim(),
      }

      const result = await verify(credentials)

      if (result.data.authorized) {
        setLicenseInfo({
          email: credentials.email,
          code: credentials.code,
        })

        form.reset()
        closeAuthDialog()
        config.onSuccess?.()
      }
      else {
        form.setError('code', {
          type: 'manual',
          message: '授权码无效或已过期',
        })
      }
    }
    catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : '验证失败，请重试'

      form.setError('code', {
        type: 'manual',
        message: errorMessage,
      })
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      closeAuthDialog()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {config.title ?? '输入授权信息'}
          </DialogTitle>

          <DialogDescription>
            {config.description ?? '请输入你的邮箱和授权码来解锁付费内容'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-form-item"
            onSubmit={(ev) => {
              ev.preventDefault()
              void form.handleSubmit(handleSubmit)(ev)
            }}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱地址</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      disabled={isVerifying}
                      placeholder="请输入您的邮箱地址"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>授权码</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isVerifying}
                      placeholder="请输入您的授权码"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={isVerifying}
                type="button"
                variant="outline"
                onClick={() => {
                  handleOpenChange(false)
                }}
              >
                取消
              </Button>

              <Button disabled={isVerifying} type="submit">
                {isVerifying ? '验证中...' : '确认授权'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
