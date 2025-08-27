'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
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
import type { CreateRoleDto, RoleListItemDto, UpdateRoleDto } from '~/lib/api/generated/types.gen'

import { rolesControllerCreateMutation, rolesControllerUpdateMutation } from '~api/@tanstack/react-query.gen'

export type RoleDialogMode = 'create' | 'edit'

interface RoleDialogProps {
  mode: RoleDialogMode
  open?: boolean
  role?: RoleListItemDto | null
  onClose?: () => void
  onSuccess?: () => void
}

/**
 * 角色创建/编辑对话框
 * - 本期仅包含基础信息：name、slug、description
 */
export function RoleDialog(props: RoleDialogProps) {
  const { mode, open, role, onClose, onSuccess } = props

  const createSchema = useMemo(() => z.object({
    name: z.string().min(1, '请输入角色名称').max(50, '名称不能超过 50 个字符'),
    slug: z.string().min(1, '请输入角色标识符').max(50, '标识符不能超过 50 个字符'),
    description: z.string().max(200, '描述不能超过 200 个字符').optional(),
  }), [])

  const editSchema = useMemo(() => z.object({
    name: z.string().max(50, '名称不能超过 50 个字符').optional(),
    slug: z.string().max(50, '标识符不能超过 50 个字符').optional(),
    description: z.string().max(200, '描述不能超过 200 个字符').optional(),
  }), [])

  type FormValues = z.infer<typeof createSchema> | z.infer<typeof editSchema>

  const isEdit = mode === 'edit'
  const resolver = useMemo(
    () => zodResolver(isEdit ? editSchema : createSchema),
    [isEdit, createSchema, editSchema],
  )

  const form = useForm<FormValues>({
    resolver,
    defaultValues: isEdit
      ? {
          name: role?.name ?? '',
          slug: role?.slug ?? '',
          description: role?.description ?? '',
        }
      : {
          name: '',
          slug: '',
          description: '',
        },
  })

  useEffect(() => {
    if (open) {
      form.reset(isEdit
        ? {
            name: role?.name ?? '',
            slug: role?.slug ?? '',
            description: role?.description ?? '',
          }
        : {
            name: '',
            slug: '',
            description: '',
          })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, role?.id])

  const createMutation = useMutation({
    ...rolesControllerCreateMutation(),
    onSuccess: () => {
      toast.success('角色创建成功')
      onSuccess?.()
      onClose?.()
    },
  })

  const updateMutation = useMutation({
    ...rolesControllerUpdateMutation(),
    onSuccess: () => {
      toast.success('角色更新成功')
      onSuccess?.()
      onClose?.()
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (values: FormValues) => {
    if (isEdit && role?.id) {
      const updated = values as UpdateRoleDto
      const name = updated.name?.trim()
      const slug = updated.slug?.trim()
      const description = updated.description?.trim()

      const body: UpdateRoleDto = {}

      if (name && name.length > 0) {
        body.name = name
      }

      if (slug && slug.length > 0) {
        body.slug = slug
      }

      if (description && description.length > 0) {
        body.description = description
      }

      await updateMutation.mutateAsync({
        path: { id: role.id },
        body,
      })
    }
    else {
      const createBody: CreateRoleDto = {
        name: (values as CreateRoleDto).name.trim(),
        slug: (values as CreateRoleDto).slug.trim(),
        description: (values as CreateRoleDto).description?.trim() ?? undefined,
      }

      await createMutation.mutateAsync({
        body: createBody,
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose?.()
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑角色' : '创建角色'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改角色基础信息' : '填写信息以创建新角色'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-form-item py-form-wrapper">
            <FormField<FormValues>
              control={form.control}
              name={'name' as keyof FormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色名称</FormLabel>
                  <FormControl>
                    <Input
                      ref={field.ref}
                      disabled={isPending}
                      name={field.name as string}
                      placeholder="请输入角色名称"
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
              name={'slug' as keyof FormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色标识符</FormLabel>
                  <FormControl>
                    <Input
                      ref={field.ref}
                      disabled={isPending}
                      name={field.name as string}
                      placeholder="请输入角色标识符"
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
                      disabled={isPending}
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
            disabled={isPending}
            type="button"
            variant="outline"
            onClick={() => { onClose?.() }}
          >
            取消
          </Button>

          <Button
            className="min-w-[100px]"
            disabled={isPending}
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
