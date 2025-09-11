'use client'

import { useMemo, useState } from 'react'

import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'
import { EllipsisVerticalIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
import { createDateColumn } from '~/components/table/table.util'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { FieldTypeEnum } from '~/constants/form'

import { PermissionFormDialog } from './PermissionFormDialog'

import { DeleteConfirmDialog } from '~admin/components/DeleteConfirmDialog'
import {
  permissionsControllerCreateMutation,
  permissionsControllerFindAllOptions,
  permissionsControllerFindAllQueryKey,
  permissionsControllerRemoveMutation,
} from '~api/@tanstack/react-query.gen'
import type { CreatePermissionDto, PermissionListItemDto } from '~api/types.gen'

/**
 * 权限表单状态接口
 * 用于管理权限表单的打开状态、模式和当前编辑的权限数据
 */
interface PermissionFormState {
  /** 表单是否打开 */
  open: boolean
  /** 表单模式：创建或编辑 */
  mode: 'create' | 'edit'
  /** 当前编辑的权限数据，创建模式时为 null */
  current: PermissionListItemDto | null
}

/**
 * 权限列表表格
 * - 使用 ProTable + React Query 拉取数据
 * - 支持新增、删除；编辑 UI 预置（当前缺后端更新接口）
 */
export function PermissionsTable() {
  const queryClient = useQueryClient()

  const [queryKey, setQueryKey] = useState<QueryKey>()

  const [formState, setFormState] = useState<PermissionFormState>({
    open: false,
    mode: 'create',
    current: null,
  })

  const handleOpenForm = (mode: 'create' | 'edit', current: PermissionListItemDto | null = null) => {
    setFormState({
      open: true,
      mode,
      current,
    })
  }

  const handleCloseForm = () => {
    setFormState({
      open: false,
      mode: 'create',
      current: null,
    })
  }

  const [deleteTarget, setDeleteTarget] = useState<PermissionListItemDto | null>(null)

  const createMutation = useMutation({
    ...permissionsControllerCreateMutation(),
    onSuccess: () => {
      toast.success('权限已创建')
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const removeMutation = useMutation({
    ...permissionsControllerRemoveMutation(),
    onSuccess: () => {
      toast.success('权限已删除')
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const columns = useMemo<TableColumnDef<PermissionListItemDto>[]>(() => {
    return [
      {
        accessorKey: 'resource',
        header: '资源',
        cell: ({ row }) => (
          <div className="text-sm">{row.original.resource}</div>
        ),
      },
      {
        accessorKey: 'action',
        header: '操作',
        cell: ({ row }) => (
          <div className="text-sm">{row.original.action}</div>
        ),
      },
      {
        accessorKey: 'slug',
        header: '权限标识',
        cell: ({ row }) => (
          <Badge className="font-mono" variant="outline">
            {row.original.slug}
          </Badge>
        ),
      },
      {
        accessorKey: 'description',
        header: '描述',
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.description ?? (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'system',
        header: '系统内置',
        cell: ({ row }) => (
          <Badge variant={row.original.system ? 'secondary' : 'default'}>
            {row.original.system ? '是' : '否'}
          </Badge>
        ),
      },
      createDateColumn<PermissionListItemDto>({
        accessorKey: 'createdAt',
        header: '创建时间',
        type: FieldTypeEnum.DATE,
      }),
      {
        id: 'actions',
        header: '操作',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const disabled = row.original.system

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="data-[state=open]:bg-muted text-muted-foreground"
                  size="iconNormal"
                  variant="ghost"
                >
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  disabled={disabled}
                  onClick={() => { handleOpenForm('edit', row.original) }}
                >
                  编辑
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={disabled}
                  variant="destructive"
                  onClick={() => {
                    setDeleteTarget(row.original)
                  }}
                >
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
  }, [])

  return (
    <div>
      <ProTable<PermissionListItemDto>
        columns={columns}
        headerTitle="权限列表"
        queryKeyFn={permissionsControllerFindAllQueryKey as QueryKeyFn}
        queryOptionsFn={
          permissionsControllerFindAllOptions as QueryOptionsFn<PermissionListItemDto>
        }
        toolbar={{
          rightContent: (
            <Button
              size="sm"
              onClick={() => { handleOpenForm('create') }}
            >
              <Plus />
              新增权限
            </Button>
          ),
        }}
        onQueryKeyChange={setQueryKey}
      />

      {/* 权限表单对话框 */}
      <PermissionFormDialog
        initialData={formState.current ?? undefined}
        mode={formState.mode}
        open={formState.open}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseForm()
          }
        }}
        onSubmit={async (values: CreatePermissionDto) => {
          // 编辑模式暂缺更新接口：给出提示，保留 UI 流程
          if (formState.mode === 'edit') {
            toast.warning('当前暂不支持更新接口，请先在后端补充更新 API')
          }
          else {
            await createMutation.mutateAsync({ body: values })
            handleCloseForm()
          }
        }}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        confirmText="DELETE"
        deleteButtonText="确认删除"
        description={deleteTarget ? `你即将删除权限：${deleteTarget.slug}` : undefined}
        isDeleting={removeMutation.isPending}
        open={!!deleteTarget}
        title="删除权限"
        onConfirm={async () => {
          if (deleteTarget) {
            await removeMutation.mutateAsync({
              path: { id: deleteTarget.id },
            })
            setDeleteTarget(null)
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
      />
    </div>
  )
}
