'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { type DefaultError, useMutation, useQuery } from '@tanstack/react-query'
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
import type {
  CreateUserInDepartmentDto,
  DepartmentsControllerCreateUserInDepartmentData,
  DepartmentsControllerCreateUserInDepartmentResponse,
  UpdateUserDto,
  UserListItemDto,
  UsersControllerUpdateData,
  UsersControllerUpdateResponse,
} from '~/lib/api/generated/types.gen'
import type { DepartmentId } from '~/lib/api/types'

import { convertDepartmentValue, convertToDepartmentSelectorValue, DepartmentSelector } from './DepartmentSelector'

import {
  departmentsControllerCreateUserInDepartmentMutation,
  usersControllerFindUserOptions,
  usersControllerUpdateMutation,
} from '~api/@tanstack/react-query.gen'
import type { Options } from '~api/sdk.gen'

// MARK: 表单验证（按模式区分）
const createSchema = z.object({
  email: z.email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码长度不能少于 6 位'),
  name: z.string().max(50, '姓名不能超过 50 个字符').optional(),
  phone: z.string().max(30, '手机号长度过长').optional(),
  isActive: z.boolean().optional(),
  departmentId: z.string(),
})

const editSchema = z.object({
  email: z.email('请输入有效的邮箱地址').optional(),
  // 编辑模式不允许提交密码：保持为空字符串或不提交
  password: z.string().max(0, '编辑模式不允许修改密码').optional(),
  name: z.string().max(50, '姓名不能超过 50 个字符').optional(),
  phone: z.string().max(30, '手机号长度过长').optional(),
  isActive: z.boolean().optional(),
  departmentId: z.string().optional(),
})

export type MemberDialogMode = 'create' | 'edit'

interface MemberDialogProps {
  /** 当前所在部门 ID（创建用户时使用） */
  departmentId: DepartmentId
  /** 对话框模式 */
  mode: MemberDialogMode
  /** 对话框是否打开 */
  open: boolean
  /** 编辑模式下的用户数据（创建模式可为空） */
  user?: UserListItemDto | null
  /** 关闭对话框 */
  onClose: () => void
  /** 操作成功回调（用于外层刷新列表等） */
  onSuccess: () => void
}

/**
 * 成员表单字段
 */
interface MemberFormValues {
  email?: string
  password?: string
  name?: string
  phone?: string
  isActive?: boolean
  departmentId?: DepartmentId
}

// ==================== 主组件 ====================

/**
 * 成员创建/编辑对话框
 * - 创建：使用部门 ID 直接创建用户，必填 email/password
 * - 编辑：禁止修改邮箱与密码，可修改基本信息与部门
 */
export function MemberDialog(props: MemberDialogProps) {
  const {
    departmentId,
    mode,
    open,
    user,
    onClose,
    onSuccess,
  } = props

  const [dialogMode, setDialogMode] = useState<MemberDialogMode>(mode)

  useEffect(() => {
    setDialogMode(mode)
  }, [mode])

  // 编辑模式：获取用户详情，拿到 departmentId 等信息
  const userDetailQuery = useQuery({
    ...usersControllerFindUserOptions({
      path: user ? { id: user.id } : { id: '' },
    }),
    enabled: open && dialogMode === 'edit' && Boolean(user?.id),
  })

  const createMutation = useMutation<
    DepartmentsControllerCreateUserInDepartmentResponse,
    DefaultError,
    Options<DepartmentsControllerCreateUserInDepartmentData>
  >(
    {
      ...departmentsControllerCreateUserInDepartmentMutation(),
      onSuccess: () => {
        onSuccess()
      },
    },
  )

  const updateMutation = useMutation<
    UsersControllerUpdateResponse,
    DefaultError,
    Options<UsersControllerUpdateData>
  >(
    {
      ...usersControllerUpdateMutation(),
      onSuccess: () => {
        onSuccess()
      },
    },
  )

  const isPending = createMutation.isPending || updateMutation.isPending

  const resolver = useMemo(() => zodResolver(dialogMode === 'edit' ? editSchema : createSchema), [dialogMode])

  const form = useForm<MemberFormValues>({
    resolver,
    defaultValues: {
      email: dialogMode === 'edit' ? (user?.email ?? '') : '',
      password: '',
      name: dialogMode === 'edit' ? (user?.name ?? '') : '',
      phone: dialogMode === 'edit' ? (user?.phone ?? '') : '',
      isActive: dialogMode === 'edit' ? (user?.isActive ?? true) : undefined,
      departmentId: undefined,
    },
  })

  // 用户详情返回后，重置编辑表单的可编辑字段与部门默认值
  useEffect(() => {
    if (open) {
      if (dialogMode === 'edit') {
        const detail = userDetailQuery.data?.data
        const currentDepartmentValue = convertToDepartmentSelectorValue(detail?.department?.id)

        form.reset({
          email: user?.email ?? '',
          password: '',
          name: detail?.name ?? user?.name ?? '',
          phone: detail?.phone ?? user?.phone ?? '',
          isActive: detail?.isActive ?? user?.isActive ?? true,
          departmentId: currentDepartmentValue,
        })
      }
      else {
        form.reset({
          email: '',
          password: '',
          name: '',
          phone: '',
          departmentId, // 创建模式下，默认选择当前页面所在的部门
        })
      }
    }
  }, [open, dialogMode, userDetailQuery.data, user, form, departmentId])

  const handleSubmit = async (values: MemberFormValues) => {
    if (dialogMode === 'edit' && user?.id) {
      const updateBody: UpdateUserDto = {
        name: values.name?.trim() ?? undefined,
        phone: values.phone?.trim() ?? undefined,
        isActive: typeof values.isActive === 'boolean' ? values.isActive : undefined,
        departmentId: values.departmentId
          ? convertDepartmentValue(values.departmentId)
          : undefined,
      }

      await updateMutation.mutateAsync({
        path: { id: user.id },
        body: updateBody,
      })

      toast.success('用户更新成功')
      onClose()
    }
    else {
      // 由于使用的 zod 版本不支持 required_error，这里补充一次显式校验，避免 TS 将值视为可选
      if (!values.email) {
        form.setError('email', { type: 'required', message: '请输入邮箱地址' })

        return
      }

      if (!values.password || values.password.length < 6) {
        form.setError('password', { type: 'min', message: '密码长度不能少于 6 位' })

        return
      }

      if (!values.departmentId) {
        form.setError('departmentId', { type: 'required', message: '请选择所属部门' })

        return
      }

      const createBody: CreateUserInDepartmentDto = {
        email: values.email.trim(),
        password: values.password,
        name: values.name?.trim() ?? undefined,
        phone: values.phone?.trim() ?? undefined,
      }

      await createMutation.mutateAsync({
        path: { departmentId: values.departmentId },
        body: createBody,
      })

      toast.success('用户创建成功')
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{dialogMode === 'edit' ? '编辑用户' : '创建成员'}</DialogTitle>
          <DialogDescription>
            {dialogMode === 'edit' ? '修改用户的相关信息' : '填写信息以在该部门下创建新用户'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-form-item py-form-wrapper">
            {/* 邮箱（编辑禁用） */}
            <FormField<MemberFormValues>
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input
                      ref={field.ref}
                      disabled={isPending || dialogMode === 'edit'}
                      name={field.name}
                      placeholder="请输入邮箱"
                      type="email"
                      value={(field.value as string | undefined) ?? ''}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 密码（仅创建时可填） */}
            {dialogMode !== 'edit' && (
              <FormField<MemberFormValues>
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        ref={field.ref}
                        disabled={isPending}
                        name={field.name}
                        placeholder="请输入密码"
                        type="password"
                        value={(field.value as string | undefined) ?? ''}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField<MemberFormValues>
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input
                      ref={field.ref}
                      disabled={isPending}
                      name={field.name}
                      placeholder="请输入姓名（可选）"
                      value={(field.value as string | undefined) ?? ''}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField<MemberFormValues>
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>手机号</FormLabel>
                  <FormControl>
                    <Input
                      ref={field.ref}
                      disabled={isPending}
                      name={field.name}
                      placeholder="请输入手机号（可选）"
                      value={(field.value as string | undefined) ?? ''}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 已移除头像 URL 字段 */}

            {/* 编辑模式：启用状态 */}
            {dialogMode === 'edit' && (
              <FormField<MemberFormValues>
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">启用状态</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        是否启用该用户
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={Boolean(field.value)}
                        disabled={isPending}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField<MemberFormValues>
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>所属部门</FormLabel>
                  <FormControl>
                    <DepartmentSelector
                      disabled={isPending}
                      placeholder="请选择所属部门"
                      showRootOption={false}
                      value={typeof field.value === 'string' ? field.value : undefined}
                      onValueChange={field.onChange}
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
            disabled={isPending}
            type="button"
            variant="outline"
            onClick={() => { onClose() }}
          >
            取消
          </Button>

          <Button
            disabled={isPending}
            type="button"
            onClick={() => { void form.handleSubmit(handleSubmit)() }}
          >
            {isPending ? (dialogMode === 'edit' ? '保存中...' : '创建中...') : (dialogMode === 'edit' ? '保存修改' : '确认创建')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
