'use client'

import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

import { authControllerChangePasswordMutation } from '~api/@tanstack/react-query.gen'
import type { ChangePasswordDto } from '~api/types.gen'

interface PasswordVisibility {
  current: boolean
  new: boolean
  confirm: boolean
}

/**
 * 密码修改表单组件
 * 提供修改密码的功能，包含当前密码验证和新密码确认
 */
export function ChangePasswordForm() {
  const [formData, setFormData] = useState<ChangePasswordDto>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibility>({
    current: false,
    new: false,
    confirm: false,
  })

  const changePasswordMutation = useMutation({
    ...authControllerChangePasswordMutation(),
    onSuccess: () => {
      toast.success('密码修改成功', {
        description: '请重新登录以继续使用',
      })
      // 重置表单
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
    },
  })

  const handleInputChange = (field: keyof ChangePasswordDto, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()

    // 基本验证
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      toast.error('请填写所有密码字段')

      return
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('新密码和确认密码不一致')

      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('新密码长度至少为6位')

      return
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error('新密码不能与当前密码相同')

      return
    }

    await changePasswordMutation.mutateAsync({
      body: formData,
    })
  }

  const isFormValid = formData.currentPassword
    && formData.newPassword
    && formData.confirmNewPassword
    && formData.newPassword === formData.confirmNewPassword
    && formData.newPassword.length >= 6
    && formData.currentPassword !== formData.newPassword

  return (
    <form className="space-y-4" onSubmit={(ev) => { void handleSubmit(ev) }}>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">当前密码</Label>
        <div className="relative">
          <Input
            className="pr-10"
            id="currentPassword"
            placeholder="请输入当前密码"
            type={passwordVisibility.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => { handleInputChange('currentPassword', e.target.value) }}
          />
          <Button
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => { togglePasswordVisibility('current') }}
          >
            {passwordVisibility.current
              ? (
                  <EyeOffIcon className="size-4" />
                )
              : (
                  <EyeIcon className="size-4" />
                )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">新密码</Label>
        <div className="relative">
          <Input
            className="pr-10"
            id="newPassword"
            placeholder="请输入新密码（至少6位）"
            type={passwordVisibility.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => { handleInputChange('newPassword', e.target.value) }}
          />
          <Button
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => { togglePasswordVisibility('new') }}
          >
            {passwordVisibility.new
              ? (
                  <EyeOffIcon className="size-4" />
                )
              : (
                  <EyeIcon className="size-4" />
                )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">确认新密码</Label>
        <div className="relative">
          <Input
            className="pr-10"
            id="confirmNewPassword"
            placeholder="请再次输入新密码"
            type={passwordVisibility.confirm ? 'text' : 'password'}
            value={formData.confirmNewPassword}
            onChange={(e) => { handleInputChange('confirmNewPassword', e.target.value) }}
          />
          <Button
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => { togglePasswordVisibility('confirm') }}
          >
            {passwordVisibility.confirm
              ? (
                  <EyeOffIcon className="size-4" />
                )
              : (
                  <EyeIcon className="size-4" />
                )}
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <Button
          className="w-full"
          disabled={!isFormValid || changePasswordMutation.isPending}
          type="submit"
        >
          {changePasswordMutation.isPending ? '修改中...' : '修改密码'}
        </Button>
      </div>
    </form>
  )
}
