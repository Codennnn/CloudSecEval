'use client'

import { useForm } from 'react-hook-form'

import Image from 'next/image'
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
import { SITE_CONFIG } from '~/constants/common'
import { cn } from '~/lib/utils'
import { usePrefetch } from '~/utils/navigation'

import { useLogin } from '~admin/hooks/api/useAuth'
import { AdminRoutes } from '~admin/lib/admin-nav'
import type { LoginDto } from '~api/types.gen'

const loginFormSchema = z.object({
  email: z.email('邮箱格式不正确，请检查后重试'),
  password: z
    .string()
    .min(1, '密码不能为空')
    .min(6, '密码至少需要 6 个字符'),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

/**
 * 登录表单组件
 * 提供用户登录功能的表单界面，使用 zod + react-hook-form 进行表单验证
 * 支持键盘快捷键操作，提供友好的错误提示和加载状态
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  usePrefetch({ href: AdminRoutes.Dashboard })

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
    loginMutation.mutate({ body: loginData })
  }

  return (
    <div className={cn('flex flex-col gap-8', className)} {...props}>
      {/* 品牌标识区域 */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted sm:size-14">
            <Image
              alt="NestJS Logo"
              className="h-8 w-8 sm:h-10 sm:w-10"
              height={40}
              src={SITE_CONFIG.logoPath}
              width={40}
            />
          </div>
          <div className="flex flex-col text-left">
            <div className="text-xl font-semibold text-foreground sm:text-2xl">
              {SITE_CONFIG.name}
            </div>
            <div className="text-sm text-muted-foreground sm:text-base">
              管理后台
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>欢迎回来</CardTitle>
          <CardDescription>
            登录后台管理系统，开始管理你的内容和数据
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              className="grid gap-form-item"
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
                        disabled={loginMutation.isPending}
                        placeholder="输入你的邮箱地址"
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
                        autoComplete="current-password"
                        disabled={loginMutation.isPending}
                        placeholder="输入你的密码"
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
                {loginMutation.isPending ? '正在登录...' : '登录'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
