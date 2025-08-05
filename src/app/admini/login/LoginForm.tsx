'use client'

import { useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { type LoginDto, useLogin } from '~/hooks/api'
import { cn } from '~/lib/utils'

/**
 * 登录表单组件
 * 提供用户登录功能的表单界面
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<Partial<LoginDto>>({})

  const loginMutation = useLogin()

  /**
   * 处理输入框值变化
   */
  const handleInputChange = (field: keyof LoginDto) => (
    ev: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = ev.target.value
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // 清除对应字段的错误
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginDto> = {}

    // 邮箱验证
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址'
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '请输入密码'
    }
    else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为 6 位'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()

    if (validateForm()) {
      loginMutation.mutate(formData)
    }
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
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">邮箱地址</Label>
                <Input
                  required
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={loginMutation.isPending}
                  id="email"
                  placeholder="请输入您的邮箱地址"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                />
                {errors.email && (
                  <span className="text-sm text-red-500">{errors.email}</span>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">密码</Label>
                <Input
                  required
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={loginMutation.isPending}
                  id="password"
                  placeholder="请输入您的密码"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                />
                {errors.password && (
                  <span className="text-sm text-red-500">{errors.password}</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  disabled={loginMutation.isPending}
                  type="submit"
                >
                  {loginMutation.isPending ? '登录中...' : '立即登录'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
