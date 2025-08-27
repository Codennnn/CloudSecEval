'use client'

import { useMemo, useState } from 'react'

import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'
import { EllipsisVerticalIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { ProTable, type QueryKeyFn, type QueryOptionsFn } from '~/components/table/ProTable'
import type { TableColumnDef } from '~/components/table/table.type'
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
import { formatDate } from '~/utils/date'

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
 * 权限列表表格
 * - 使用 ProTable + React Query 拉取数据
 * - 支持新增、删除；编辑 UI 预置（当前缺后端更新接口）
 */
export function PermissionsTable() {
  const queryClient = useQueryClient()

  // 说明：维护当前查询 key，供变更后刷新列表
  const [queryKey, setQueryKey] = useState<QueryKey>()

  // 表单与删除对话框状态
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [current, setCurrent] = useState<PermissionListItemDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PermissionListItemDto | null>(null)

  // 新增权限
  const createMutation = useMutation({
    ...permissionsControllerCreateMutation(),
    onSuccess: () => {
      toast.success('权限已创建')
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  // 删除权限
  const removeMutation = useMutation({
    ...permissionsControllerRemoveMutation(),
    onSuccess: () => {
      toast.success('权限已删除')
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  // 列定义
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
        header: '标识',
        cell: ({ row }) => (
          <div className="text-sm font-mono">{row.original.slug}</div>
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
      {
        accessorKey: 'createdAt',
        header: '创建时间',
        type: FieldTypeEnum.DATE,
        cell: ({ row }) => (
          <div className="text-sm">{formatDate(row.original.createdAt)}</div>
        ),
      },
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
                  onClick={() => {
                    setFormMode('edit')
                    setCurrent(row.original)
                    setFormOpen(true)
                  }}
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
              onClick={() => {
                setFormMode('create')
                setCurrent(null)
                setFormOpen(true)
              }}
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
        initialData={current ?? undefined}
        mode={formMode}
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false)
            setCurrent(null)
          }
          else {
            setFormOpen(true)
          }
        }}
        onSubmit={async (values: CreatePermissionDto) => {
          // 编辑模式暂缺更新接口：给出提示，保留 UI 流程
          if (formMode === 'edit') {
            toast.warning('当前暂不支持更新接口，请先在后端补充更新 API')
          }
          else {
            await createMutation.mutateAsync({ body: values })
            setFormOpen(false)
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
