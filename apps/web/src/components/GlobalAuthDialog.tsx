'use client'

import { useEffect, useState } from 'react'
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
import {
  useAuthDialogConfig,
  useAuthDialogOpen,
  useCloseAuthDialog,
} from '~/stores/useAuthDialogStore'
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
 * 使用 Zustand store 管理状态，可以从任何地方触发显示
 */
export function GlobalAuthDialog() {
  const { setLicenseInfo } = useLicenseStore()
  const isOpen = useAuthDialogOpen()
  const config = useAuthDialogConfig()
  const closeAuthDialog = useCloseAuthDialog()

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  })

  // 授权验证状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldVerify, setShouldVerify] = useState(false)
  const [verificationData, setVerificationData] = useState<{
    email: string
    code: string
  } | null>(null)

  const verificationResult = useLicenseVerification({
    credentials: verificationData,
    enabled: shouldVerify,
  })

  const {
    hasAccess,
    isLoading: isVerifying,
    isError,
    error,
    data: authData,
  } = verificationResult

  // 处理验证结果
  useEffect(() => {
    if (shouldVerify && authData) {
      if (hasAccess) {
        // 保存授权信息到 store
        if (verificationData) {
          setLicenseInfo({
            email: verificationData.email,
            code: verificationData.code,
          })
        }

        // 重置表单
        form.reset()

        // 关闭对话框
        closeAuthDialog()

        // 调用成功回调
        if (config.onSuccess) {
          config.onSuccess()
        }
      }
      else {
        form.setError('code', {
          type: 'manual',
          message: '授权码无效或已过期',
        })
      }

      // 重置状态
      setShouldVerify(false)
      setVerificationData(null)
      setIsSubmitting(false)
    }
  }, [
    authData,
    shouldVerify,
    verificationData,
    hasAccess,
    form,
    closeAuthDialog,
    config,
    setLicenseInfo,
  ])

  // 处理验证错误
  useEffect(() => {
    if (shouldVerify && isError) {
      const errorMessage = error instanceof Error
        ? error.message
        : '验证失败，请重试'
      form.setError('code', {
        type: 'manual',
        message: errorMessage,
      })

      // 重置状态
      setShouldVerify(false)
      setVerificationData(null)
      setIsSubmitting(false)
    }
  }, [isError, error, shouldVerify, form])

  /**
   * 处理表单提交
   */
  const handleSubmit = (values: AuthFormValues) => {
    setIsSubmitting(true)
    setVerificationData({
      email: values.email.trim(),
      code: values.code.trim(),
    })
    setShouldVerify(true)
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
            className="space-y-4"
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
                      disabled={isSubmitting || isVerifying}
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
                      disabled={isSubmitting || isVerifying}
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
                disabled={isSubmitting || isVerifying}
                type="button"
                variant="outline"
                onClick={() => {
                  handleOpenChange(false)
                }}
              >
                取消
              </Button>
              <Button disabled={isSubmitting || isVerifying} type="submit">
                {isSubmitting || isVerifying ? '验证中...' : '确认授权'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
