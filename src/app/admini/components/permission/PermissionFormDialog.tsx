'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
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

import type { CreatePermissionDto, PermissionListItemDto } from '~api/types.gen'

export type PermissionFormMode = 'create' | 'edit'

interface PermissionFormDialogProps {
  /** 模式：创建或编辑 */
  mode: PermissionFormMode
  /** 是否打开 */
  open?: boolean
  /** 初始数据（编辑模式用） */
  initialData?: PermissionListItemDto
  /** 打开状态变化 */
  onOpenChange?: (open: boolean) => void
  /** 提交回调（创建或编辑） */
  onSubmit?: (values: CreatePermissionDto) => Promise<void> | void
}

/**
 * 权限表单对话框
 * - 字段：resource, action, description?
 * - 编辑模式会预填 initialData
 */
export function PermissionFormDialog(props: PermissionFormDialogProps) {
  const { mode, open, initialData, onOpenChange, onSubmit } = props

  const createSchema = useMemo(() => z.object({
    resource: z.string().min(1, '请输入资源名称').max(100, '长度不能超过 100 个字符'),
    action: z.string().min(1, '请输入操作类型').max(100, '长度不能超过 100 个字符'),
    description: z.string().max(200, '描述不能超过 200 个字符').optional(),
  }), [])

  // 编辑暂用同一套字段校验；若后端允许部分字段更新，可改为可选
  const editSchema = useMemo(() => z.object({
    resource: z.string().min(1, '请输入资源名称').max(100, '长度不能超过 100 个字符').optional(),
    action: z.string().min(1, '请输入操作类型').max(100, '长度不能超过 100 个字符').optional(),
    description: z.string().max(200, '描述不能超过 200 个字符').optional(),
  }), [])

  type CreateValues = z.infer<typeof createSchema>
  type EditValues = z.infer<typeof editSchema>
  type FormValues = CreateValues | EditValues

  const isEdit = mode === 'edit'

  const resolver = useMemo(() => zodResolver(isEdit ? editSchema : createSchema),
    [isEdit, createSchema, editSchema],
  )

  const form = useForm<FormValues>({
    resolver,
    defaultValues: isEdit
      ? {
          resource: initialData?.resource ?? '',
          action: initialData?.action ?? '',
          description: initialData?.description ?? '',
        }
      : {
          resource: '',
          action: '',
          description: '',
        },
  })

  useEffect(() => {
    if (open) {
      form.reset(isEdit
        ? {
            resource: initialData?.resource ?? '',
            action: initialData?.action ?? '',
            description: initialData?.description ?? '',
          }
        : {
            resource: '',
            action: '',
            description: '',
          })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, initialData?.id])

  const handleSubmit = async (values: FormValues) => {
    // 统一构建 CreatePermissionDto 形状，编辑时也沿用此结构由外层决定分支
    const body: CreatePermissionDto = {
      resource: (values.resource ?? '').trim(),
      action: (values.action ?? '').trim(),
      description: values.description?.trim() ?? undefined,
    }

    if (!body.resource || !body.action) {
      toast.error('请输入完整的资源和操作')

      return
    }

    await onSubmit?.(body)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { onOpenChange?.(o) }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑权限' : '创建权限'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改权限信息' : '填写信息以创建新权限'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-form-item py-form-wrapper">
            <FormField<FormValues>
              control={form.control}
              name={'resource' as keyof FormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>资源名称</FormLabel>
                  <FormControl>
                    <Input
                      ref={field.ref}
                      disabled={false}
                      name={field.name as string}
                      placeholder="例如：users、roles"
                      value={(field.value) ?? ''}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField<FormValues>
              control={form.control}
              name={'action' as keyof FormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>操作类型</FormLabel>
                  <FormControl>
                    <Input
                      ref={field.ref}
                      disabled={false}
                      name={field.name as string}
                      placeholder="例如：read、create、update、delete"
                      value={(field.value) ?? ''}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField<FormValues>
              control={form.control}
              name={'description' as keyof FormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Input
                      ref={field.ref}
                      disabled={false}
                      name={field.name as string}
                      placeholder="请输入描述（可选）"
                      value={(field.value) ?? ''}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => { onOpenChange?.(false) }}
          >
            取消
          </Button>
          <Button
            className="min-w-[100px]"
            type="button"
            onClick={() => { void form.handleSubmit(handleSubmit)() }}
          >
            {isEdit ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
