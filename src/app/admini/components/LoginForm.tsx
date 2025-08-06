'use client'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import type { LoginDto } from '~/lib/api/types'
import { cn } from '~/lib/utils'
import { usePrefetch } from '~/utils/navigation'

import { useLogin } from '~admin/hooks/api/useAuth'

const loginFormSchema = z.object({
  email: z.email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码长度至少为 6 位'),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

/**
 * 登录表单组件
 * 提供用户登录功能的表单界面，使用 zod + react-hook-form 进行表单验证
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  usePrefetch({ href: '/admini/dashboard' })

  const loginMutation = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  /**
   * 处理表单提交
   */
  const handleSubmit = (values: LoginFormValues) => {
    const loginData: LoginDto = {
      email: values.email,
      password: values.password,
    }
    loginMutation.mutate(loginData)
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>登录您的账户</CardTitle>
          <CardDescription>
            请输入您的邮箱和密码来登录账户
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              className="space-y-6"
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
                        disabled={loginMutation.isPending}
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loginMutation.isPending}
                        placeholder="请输入您的密码"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                disabled={loginMutation.isPending}
                type="submit"
              >
                {loginMutation.isPending ? '登录中...' : '立即登录'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
