'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import type { CreateLicenseDto } from '~/lib/api/types'

import { useCreateLicense } from '../hooks/api/useLicense'

interface CreateLicenseDialogProps {
  children: React.ReactNode
}

interface CreateLicenseData {
  email: string
  remark: string
  purchaseAmount: string
  expiresAt: string
  expiresAtType: 'preset' | 'custom'
}

/**
 * 创建授权码对话框组件
 * @param children - 触发对话框的子元素
 */
export function CreateLicenseDialog({ children }: CreateLicenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateLicenseData>({
    email: '',
    remark: '',
    purchaseAmount: '',
    expiresAt: '',
    expiresAtType: 'preset',
  })

  const createLicenseMutation = useCreateLicense()

  // 过期时间预设选项
  const expiresAtPresets = [
    { label: '永久', value: 'permanent' },
    { label: '7天', value: '7d' },
    { label: '15天', value: '15d' },
    { label: '30天', value: '30d' },
    { label: '自定义', value: 'custom' },
  ]

  /**
   * 处理表单输入变化
   */
  const handleInputChange = (field: keyof CreateLicenseData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]
      handleInputChange('expiresAt', formattedDate)
    }
  }

  /**
   * 处理过期时间预设选择
   */
  const handleExpiresAtPresetChange = (value: string) => {
    if (value === 'custom') {
      setFormData((prev) => ({
        ...prev,
        expiresAtType: 'custom',
        expiresAt: '',
      }))
    }
    else {
      let expiresAt = ''

      if (value !== 'permanent') {
        const now = new Date()

        if (value === '7d') {
          now.setDate(now.getDate() + 7)
        }
        else if (value === '15d') {
          now.setDate(now.getDate() + 15)
        }
        else if (value === '30d') {
          now.setDate(now.getDate() + 30)
        }
        else if (value === '90d') {
          now.setDate(now.getDate() + 90)
        }
        else if (value === '1y') {
          now.setFullYear(now.getFullYear() + 1)
        }

        expiresAt = now.toISOString().split('T')[0]
      }

      setFormData((prev) => ({
        ...prev,
        expiresAtType: 'preset',
        expiresAt,
      }))
    }
  }

  /**
   * 重置表单数据
   */
  const resetForm = () => {
    setFormData({
      email: '',
      remark: '',
      purchaseAmount: '',
      expiresAt: '',
      expiresAtType: 'preset',
    })
  }

  /**
   * 处理创建授权码
   */
  const handleCreateLicense = async () => {
    if (!formData.email.trim()) {
      toast.error('请输入邮箱地址')

      return
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(formData.email)) {
      toast.error('请输入有效的邮箱地址')

      return
    }

    // 验证购买价格
    if (!formData.purchaseAmount.trim()) {
      toast.error('请输入购买价格')

      return
    }

    const purchaseAmount = parseFloat(formData.purchaseAmount)

    if (isNaN(purchaseAmount) || purchaseAmount < 0) {
      toast.error('请输入有效的购买价格')

      return
    }

    // 验证过期时间（如果是自定义模式）
    if (formData.expiresAtType === 'custom' && formData.expiresAt) {
      const expiresDate = new Date(formData.expiresAt)
      const now = new Date()

      if (expiresDate <= now) {
        toast.error('过期时间必须晚于当前时间')

        return
      }
    }

    const requestData: CreateLicenseDto = {
      email: formData.email.trim(),
      remark: formData.remark.trim() || undefined,
      purchaseAmount,
      expiresAt: formData.expiresAt || undefined,
    }

    try {
      await createLicenseMutation.mutateAsync(requestData)
      toast.success('授权码创建成功')

      // 重置表单并关闭对话框
      resetForm()
      setOpen(false)
    }
    catch (error) {
      console.error('创建授权码失败:', error)
      toast.error('创建授权码失败，请稍后重试')
    }
  }

  /**
   * 处理对话框关闭
   */
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)

    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建授权码</DialogTitle>
          <DialogDescription>
            请填写以下信息来创建新的授权码
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">邮箱地址</Label>
            <Input
              disabled={createLicenseMutation.isPending}
              id="email"
              placeholder="请输入邮箱地址"
              type="email"
              value={formData.email}
              onChange={(ev) => { handleInputChange('email', ev.target.value) }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="purchaseAmount">购买价格（元）</Label>
            <Input
              disabled={createLicenseMutation.isPending}
              id="purchaseAmount"
              min="0"
              placeholder="请输入购买价格"
              step="0.01"
              type="number"
              value={formData.purchaseAmount}
              onChange={(ev) => { handleInputChange('purchaseAmount', ev.target.value) }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expiresAt">过期时间</Label>
            <Select
              disabled={createLicenseMutation.isPending}
              onValueChange={handleExpiresAtPresetChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择过期时间" />
              </SelectTrigger>
              <SelectContent>
                {expiresAtPresets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formData.expiresAtType === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-full justify-start text-left font-normal"
                    disabled={createLicenseMutation.isPending}
                    variant="outline"
                  >
                    {formData.expiresAt
                      ? new Date(formData.expiresAt).toLocaleDateString('zh-CN')
                      : '请选择具体日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    disabled={(date) => date < new Date()}
                    mode="single"
                    selected={formData.expiresAt ? new Date(formData.expiresAt) : undefined}
                    onSelect={handleDateSelect}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="remark">备注</Label>
            <Textarea
              disabled={createLicenseMutation.isPending}
              id="remark"
              placeholder="请输入备注信息（可选）"
              rows={3}
              value={formData.remark}
              onChange={(e) => { handleInputChange('remark', e.target.value) }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={createLicenseMutation.isPending}
            type="button"
            variant="outline"
            onClick={() => { setOpen(false) }}
          >
            取消
          </Button>

          <Button
            disabled={createLicenseMutation.isPending}
            type="button"
            onClick={() => {
              void handleCreateLicense()
            }}
          >
            {createLicenseMutation.isPending ? '创建中...' : '确认创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
