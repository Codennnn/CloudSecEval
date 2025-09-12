'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import type { DialogProps } from '@radix-ui/react-dialog'
import { toast } from 'sonner'
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
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import { emitter, EVENT_KEY } from '~/constants/common'
import { isCrowdTest } from '~/utils/platform'

import { convertDepartmentValue, convertToDepartmentSelectorValue, DepartmentSelector } from './DepartmentSelector'
import type {
  DepartmentDialogProps,
  DepartmentFormInitialData,
  DepartmentFormValues,
} from './types'

import { useCreateDepartment, useUpdateDepartment } from '~admin/hooks/api/useDepartment'
import type { CreateDepartmentDto, UpdateDepartmentDto } from '~api/types.gen'

// ==================== 表单验证模式 ====================

const departmentFormSchema = z.object({
  name: z
    .string()
    .min(1, '请输入部门名称')
    .max(50, '部门名称不能超过50个字符'),
  remark: z
    .string()
    .max(200, '部门描述不能超过200个字符')
    .optional(),
  parentId: z
    .string()
    .optional(),
  isActive: z.boolean(),
})

// ==================== 默认值定义 ====================

const BASE_DEFAULT_VALUES: DepartmentFormValues = {
  name: '',
  remark: '',
  parentId: 'ROOT',
  isActive: true,
}

// ==================== 工具函数 ====================

/**
 * 转换初始数据为表单值
 * 统一处理创建和编辑模式的数据转换
 */
const convertToFormValues = (
  formData?: DepartmentFormInitialData,
): DepartmentFormValues => {
  if (!formData) {
    return BASE_DEFAULT_VALUES
  }

  return {
    name: formData.name ?? BASE_DEFAULT_VALUES.name,
    remark: formData.remark ?? BASE_DEFAULT_VALUES.remark,
    parentId: convertToDepartmentSelectorValue(formData.parentId),
    isActive: formData.isActive ?? BASE_DEFAULT_VALUES.isActive,
  }
}

// ==================== 主组件 ====================

/**
 * 部门对话框组件
 *
 * 支持创建和编辑部门信息
 * 严格的类型安全和表单验证
 */
export function DepartmentDialog(props: DepartmentDialogProps) {
  const {
    mode = 'create',
    formData,
    open,
    onOpenChange,
    onSuccess,
    orgId,
  } = props

  const isEditMode = mode === 'edit'

  // ==================== UI 文案 ====================
  const noun = isCrowdTest() ? '团队' : '部门'
  const dialogTitle = isEditMode ? `编辑${noun}` : `创建${noun}`
  const dialogDescription = isEditMode
    ? `修改${noun}的相关信息`
    : `请填写以下信息来创建新的${noun}`
  const submitButtonText = isEditMode ? '保存修改' : '确认创建'
  const loadingButtonText = isEditMode ? '保存中...' : '创建中...'

  // ==================== API Hooks ====================
  const createDepartmentMutation = useCreateDepartment()
  const updateDepartmentMutation = useUpdateDepartment()

  const isPending = createDepartmentMutation.isPending || updateDepartmentMutation.isPending

  // ==================== 表单处理 ====================
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: convertToFormValues(formData),
  })

  // ==================== 副作用处理 ====================

  /**
   * 当对话框打开时重置表单数据
   */
  useEffect(() => {
    if (open) {
      form.reset(convertToFormValues(formData))
    }
  }, [formData, mode, open, form])

  // ==================== 事件处理 ====================

  /**
   * 处理对话框关闭
   */
  const handleOpenChange: DialogProps['onOpenChange'] = (newOpen) => {
    onOpenChange(newOpen)

    if (!newOpen) {
      form.reset(convertToFormValues(formData))
    }
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: DepartmentFormValues) => {
    try {
      if (isEditMode && formData?.id) {
        // 编辑模式
        const updateData: UpdateDepartmentDto = {
          name: values.name.trim(),
          remark: values.remark?.trim() ?? undefined,
          parentId: convertDepartmentValue(values.parentId ?? 'ROOT'),
          isActive: values.isActive,
        }

        await updateDepartmentMutation.mutateAsync({
          path: {
            id: formData.id,
          },
          body: updateData,
        })

        toast.success(`${noun}更新成功`)
      }
      else {
        // 创建模式
        const createData: CreateDepartmentDto = {
          orgId,
          name: values.name.trim(),
          remark: values.remark?.trim() ?? undefined,
          parentId: convertDepartmentValue(values.parentId ?? 'ROOT'),
          isActive: values.isActive,
        }

        await createDepartmentMutation.mutateAsync({
          body: createData,
        })

        toast.success(`${noun}创建成功`)
      }

      // 触发数据刷新
      emitter.emit(EVENT_KEY.REFRESH_TABLE)
      onSuccess?.()
      handleOpenChange(false)
    }
    catch {
      toast.error(`${isEditMode ? '更新' : '创建'}${noun}失败，请稍后重试`)
    }
  }

  // ==================== 渲染 ====================

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="grid gap-form-item py-form-wrapper"
            onSubmit={(ev) => {
              ev.preventDefault()
              void form.handleSubmit(handleSubmit)(ev)
            }}
          >
            {/* 名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{`${noun}名称`}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder={`请输入${noun}名称`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 上级选择 */}
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{`上级${noun}`}</FormLabel>
                  <FormControl>
                    <DepartmentSelector
                      disabled={isPending}
                      excludeDepartmentId={formData?.id}
                      orgId={orgId}
                      placeholder={`请选择上级${noun}`}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 描述 */}
            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{`${noun}描述`}</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder={`请输入${noun}描述（可选）`}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 是否启用 */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">启用状态</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {`是否启用该${noun}`}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      disabled={isPending}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            disabled={isPending}
            type="button"
            variant="outline"
            onClick={() => {
              handleOpenChange(false)
            }}
          >
            取消
          </Button>

          <Button
            disabled={isPending}
            type="button"
            onClick={() => {
              void form.handleSubmit(handleSubmit)()
            }}
          >
            {isPending ? loadingButtonText : submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
