'use client'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { sleep } from '@mono/utils'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { PasswordInput } from '~/components/ui/password-input'

import { useLogout } from '~admin/hooks/api/useAuth'
import { authControllerChangePasswordMutation } from '~api/@tanstack/react-query.gen'

// 表单验证 Schema
const changePasswordFormSchema = z.object({
  currentPassword: z
    .string()
    .min(1, '请输入当前密码'),
  newPassword: z
    .string()
    .min(6, '新密码长度至少为 6 位'),
  confirmNewPassword: z
    .string()
    .min(1, '请确认新密码'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: '新密码和确认密码不一致',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: '新密码不能与当前密码相同',
  path: ['newPassword'],
})

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>

/**
 * 密码修改表单组件
 * 提供修改密码的功能，包含当前密码验证和新密码确认
 */
export function ChangePasswordForm() {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onSubmit',
  })

  const logoutMutation = useLogout()

  const changePasswordMutation = useMutation({
    ...authControllerChangePasswordMutation(),
    onSuccess: async () => {
      toast.success('密码修改成功', {
        description: '即将退出登录，请使用新密码重新登录',
      })

      form.reset()

      // 延迟后退出登录，让用户看到成功提示
      await sleep(1000)

      await logoutMutation.mutateAsync({})
    },
  })

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    await changePasswordMutation.mutateAsync({
      body: {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      },
    })
  }

  return (
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
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>当前密码</FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={changePasswordMutation.isPending}
                  placeholder="请输入当前密码"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>新密码</FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={changePasswordMutation.isPending}
                  placeholder="请输入新密码（至少 6 位）"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认新密码</FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={changePasswordMutation.isPending}
                  placeholder="请再次输入新密码"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            className="w-full"
            disabled={changePasswordMutation.isPending}
            type="submit"
          >
            {changePasswordMutation.isPending ? '修改中...' : '修改密码'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
