'use client'

import { useEffect, useState } from 'react'
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
import type { CreateLicenseDto, License, UpdateLicenseDto } from '~/lib/api/types'

/**
 * 扩展的 License 类型，用于编辑表单
 */
interface ExtendedLicense extends License {
  email?: string
  purchaseAmount?: number
  remark?: string
}

import { useCreateLicense, useUpdateLicense } from '../hooks/api/useLicense'

const licenseFormSchema = z.object({
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
  status: z.enum(['active', 'inactive', 'expired']).optional(),
  remark: z.string().optional(),
})

type LicenseFormValues = z.infer<typeof licenseFormSchema>

type LicenseDialogMode = 'create' | 'edit'

/**
 * 授权码对话框属性
 */
interface LicenseDialogProps {
  /** 对话框模式 */
  mode?: LicenseDialogMode
  /** 编辑时的授权码数据 */
  license?: ExtendedLicense
  /** 触发器内容 */
  children: React.ReactNode
  /** 对话框打开状态（外部控制） */
  open?: boolean
  /** 对话框打开状态变化回调 */
  onOpenChange?: (open: boolean) => void
  /** 成功操作后的回调 */
  onSuccess?: (license: License) => void
}

/**
 * 授权码对话框组件 - 支持创建和编辑
 */
export function LicenseDialog(props: LicenseDialogProps) {
  const {
    mode = 'create',
    license,
    children,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
    onSuccess,
  } = props

  const [internalOpen, setInternalOpen] = useState(false)
  const isControlledOpen = externalOpen !== undefined
  const open = isControlledOpen ? externalOpen : internalOpen
  const setOpen = isControlledOpen
    ? (externalOnOpenChange ?? (() => { /* noop */ }))
    : setInternalOpen

  const isEditMode = mode === 'edit'
  const dialogTitle = isEditMode ? '编辑授权码' : '创建授权码'
  const dialogDescription = isEditMode
    ? '修改授权码的相关信息'
    : '请填写以下信息来创建新的授权码'
  const submitButtonText = isEditMode ? '保存修改' : '确认创建'
  const loadingButtonText = isEditMode ? '保存中...' : '创建中...'

  const createLicenseMutation = useCreateLicense()
  const updateLicenseMutation = useUpdateLicense()

  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseFormSchema),
    defaultValues: {
      email: '',
      purchaseAmount: '',
      expiresAtType: 'preset',
      expiresAtPreset: '',
      expiresAt: '',
      status: 'active',
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
   * 根据过期时间值推断预设类型
   */
  const inferExpiresAtPreset = (expiresAt: string | undefined): string => {
    if (!expiresAt) {
      return 'permanent'
    }

    const expiresDate = new Date(expiresAt)
    const now = new Date()
    const diffTime = expiresDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // 允许一定的误差范围（±1天）
    if (Math.abs(diffDays - 7) <= 1) {
      return '7d'
    }

    if (Math.abs(diffDays - 15) <= 1) {
      return '15d'
    }

    if (Math.abs(diffDays - 30) <= 1) {
      return '30d'
    }

    return 'custom'
  }

  /**
   * 预填充表单数据（编辑模式）
   */
  useEffect(() => {
    if (isEditMode && license && open) {
      const expiresAtPreset = inferExpiresAtPreset(license.expiresAt)
      const expiresAtType = expiresAtPreset === 'custom' ? 'custom' : 'preset'

      form.reset({
        email: license.email ?? '',
        purchaseAmount: license.purchaseAmount?.toString() ?? '',
        expiresAtType,
        expiresAtPreset: expiresAtPreset === 'custom' ? '' : expiresAtPreset,
        expiresAt: license.expiresAt ?? '',
        status: license.status,
        remark: license.description ?? license.remark ?? '',
      })
    }
  }, [isEditMode, license, open, form])

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

  const resetForm = () => {
    form.reset()
  }

  const handleSubmit = async (values: LicenseFormValues) => {
    // 验证过期时间（如果是自定义模式）
    if (values.expiresAtType === 'custom' && values.expiresAt) {
      const expiresDate = new Date(values.expiresAt)
      const now = new Date()

      if (expiresDate <= now) {
        toast.error('过期时间必须晚于当前时间')

        return
      }
    }

    try {
      let result: License

      if (isEditMode && license?.id) {
        // 编辑模式
        const updateData: UpdateLicenseDto = {
          status: values.status,
          description: values.remark?.trim() ?? undefined,
          expiresAt: values.expiresAt ?? undefined,
        }

        result = await updateLicenseMutation.mutateAsync({
          id: license.id,
          data: updateData,
        })

        toast.success('授权码更新成功')
      }
      else {
        // 创建模式
        const createData: CreateLicenseDto = {
          email: values.email.trim(),
          remark: values.remark?.trim() ?? undefined,
          purchaseAmount: parseFloat(values.purchaseAmount),
          expiresAt: values.expiresAt ?? undefined,
        }

        result = await createLicenseMutation.mutateAsync(createData)
        toast.success('授权码创建成功')
      }

      // 调用成功回调
      onSuccess?.(result)

      // 重置表单并关闭对话框
      resetForm()
      setOpen(false)
    }
    catch (error) {
      console.error(`${isEditMode ? '更新' : '创建'}授权码失败:`, error)
      toast.error(`${isEditMode ? '更新' : '创建'}授权码失败，请稍后重试`)
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
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
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
                      disabled={
                        isEditMode
                        || createLicenseMutation.isPending
                        || updateLicenseMutation.isPending
                      }
                      placeholder="请输入邮箱地址"
                      readOnly={isEditMode}
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditMode && (
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
            )}

            {isEditMode && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <FormControl>
                      <Select
                        disabled={updateLicenseMutation.isPending}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择状态" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">激活</SelectItem>
                          <SelectItem value="inactive">未激活</SelectItem>
                          <SelectItem value="expired">已过期</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="expiresAtPreset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>过期时间</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Select
                        disabled={
                          createLicenseMutation.isPending
                          || updateLicenseMutation.isPending
                        }
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
                                    disabled={
                                      createLicenseMutation.isPending
                                      || updateLicenseMutation.isPending
                                    }
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
                      disabled={
                        createLicenseMutation.isPending
                        || updateLicenseMutation.isPending
                      }
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
            disabled={
              createLicenseMutation.isPending
              || updateLicenseMutation.isPending
            }
            type="button"
            variant="outline"
            onClick={() => { setOpen(false) }}
          >
            取消
          </Button>

          <Button
            disabled={
              createLicenseMutation.isPending
              || updateLicenseMutation.isPending
            }
            type="button"
            onClick={() => {
              void form.handleSubmit(handleSubmit)()
            }}
          >
            {(createLicenseMutation.isPending || updateLicenseMutation.isPending)
              ? loadingButtonText
              : submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
