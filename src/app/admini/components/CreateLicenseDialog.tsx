'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
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

const createLicenseFormSchema = z.object({
  email: z.email('请输入有效的邮箱地址'),
  purchaseAmount: z
    .string()
    .min(1, '请输入购买价格')
    .refine((val) => {
      const num = parseFloat(val)

      return !isNaN(num) && num >= 0
    }, '请输入有效的购买价格'),
  expiresAtType: z.enum(['preset', 'custom']),
  expiresAtPreset: z.string().optional(),
  expiresAt: z.string().optional(),
  remark: z.string().optional(),
})

type CreateLicenseFormValues = z.infer<typeof createLicenseFormSchema>

interface CreateLicenseDialogProps {
  children: React.ReactNode
}

/**
 * 创建授权码对话框组件
 * @param children - 触发对话框的子元素
 */
export function CreateLicenseDialog({ children }: CreateLicenseDialogProps) {
  const [open, setOpen] = useState(false)
  const createLicenseMutation = useCreateLicense()

  const form = useForm<CreateLicenseFormValues>({
    resolver: zodResolver(createLicenseFormSchema),
    defaultValues: {
      email: '',
      purchaseAmount: '',
      expiresAtType: 'preset',
      expiresAtPreset: '',
      expiresAt: '',
      remark: '',
    },
  })

  const watchExpiresAtType = form.watch('expiresAtType')

  // 过期时间预设选项
  const expiresAtPresets = [
    { label: '永久', value: 'permanent' },
    { label: '7天', value: '7d' },
    { label: '15天', value: '15d' },
    { label: '30天', value: '30d' },
    { label: '自定义', value: 'custom' },
  ]

  /**
   * 处理过期时间预设选择
   */
  const handleExpiresAtPresetChange = (value: string) => {
    if (value === 'custom') {
      form.setValue('expiresAtType', 'custom')
      form.setValue('expiresAtPreset', '')
      form.setValue('expiresAt', '')
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

      form.setValue('expiresAtType', 'preset')
      form.setValue('expiresAtPreset', value)
      form.setValue('expiresAt', expiresAt)
    }
  }

  /**
   * 重置表单数据
   */
  const resetForm = () => {
    form.reset()
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: CreateLicenseFormValues) => {
    // 验证过期时间（如果是自定义模式）
    if (values.expiresAtType === 'custom' && values.expiresAt) {
      const expiresDate = new Date(values.expiresAt)
      const now = new Date()

      if (expiresDate <= now) {
        toast.error('过期时间必须晚于当前时间')

        return
      }
    }

    const requestData: CreateLicenseDto = {
      email: values.email.trim(),
      remark: values.remark?.trim() ?? undefined,
      purchaseAmount: parseFloat(values.purchaseAmount),
      expiresAt: values.expiresAt ?? undefined,
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

        <Form {...form}>
          <form
            className="grid gap-form-item py-4"
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
                      disabled={createLicenseMutation.isPending}
                      placeholder="请输入邮箱地址"
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
              name="purchaseAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>购买价格（元）</FormLabel>
                  <FormControl>
                    <Input
                      disabled={createLicenseMutation.isPending}
                      min="0"
                      placeholder="请输入购买价格"
                      step="0.01"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAtPreset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>过期时间</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Select
                        disabled={createLicenseMutation.isPending}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleExpiresAtPresetChange(value)
                        }}
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
                    </FormControl>

                    {watchExpiresAtType === 'custom' && (
                      <FormField
                        control={form.control}
                        name="expiresAt"
                        render={({ field: dateField }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    className="flex-1 justify-start text-left font-normal"
                                    disabled={createLicenseMutation.isPending}
                                    variant="outline"
                                  >
                                    {dateField.value
                                      ? new Date(dateField.value).toLocaleDateString('zh-CN')
                                      : '请选择具体日期'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto p-0">
                                  <Calendar
                                    disabled={(date) => date < new Date()}
                                    mode="single"
                                    selected={
                                      dateField.value ? new Date(dateField.value) : undefined
                                    }
                                    onSelect={(date) => {
                                      if (date) {
                                        const formattedDate = date.toISOString().split('T')[0]
                                        dateField.onChange(formattedDate)
                                      }
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={createLicenseMutation.isPending}
                      placeholder="请输入备注信息（可选）"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

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
              void form.handleSubmit(handleSubmit)()
            }}
          >
            {createLicenseMutation.isPending ? '创建中...' : '确认创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
