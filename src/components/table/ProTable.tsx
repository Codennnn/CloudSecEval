'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { type QueryKey, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  type PaginationState,
  type RowSelectionState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { consola } from 'consola'

import type { TableColumnDef } from '~/components/table/table.type'
import { generateSearchFields, getColumnKey } from '~/components/table/table.util'
import { TableEmptyState } from '~/components/table/TableEmptyState'
import { TablePagination } from '~/components/table/TablePagination'
import { type SelectionToolbarContext as SelectionToolbarContextType, TableSelectionToolbar } from '~/components/table/TableSelectionToolbar'
import { TableSkeleton } from '~/components/table/TableSkeleton'
import { TableToolbar, type TableToolbarProps } from '~/components/table/TableToolbar'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import type { ListResponse } from '~/lib/api/types'
import { cn } from '~/lib/utils'
import type { ColumnVisibilityConfig, QueryParams } from '~/types/advanced-search'
import type { AnyType } from '~/types/common'

import type { Options } from '~api/sdk.gen'
import type { PaginationMetaDto } from '~api/types.gen'

export type QueryOptionsFn<TData> = (options: Options) =>
UseQueryOptions<ListResponse<TData>, Error, ListResponse<TData>, unknown[]>

export type QueryKeyFn = (options: Options) => QueryKey

/**
 * ProTable 组件属性接口
 */
export interface ProTableProps<TData> {
  /** 表格列定义 */
  columns: TableColumnDef<TData>[]

  /** 表格数据 */
  data?: TData[]
  /** 加载状态 */
  loading?: boolean
  /** 表格标题 */
  headerTitle?: string
  /** 分页配置 */
  pagination?: PaginationMetaDto

  /** 查询配置生成函数 */
  queryOptionsFn?: QueryOptionsFn<TData>
  queryKeyFn?: QueryKeyFn

  /** 工具栏配置 */
  toolbar?: {
    /** 是否显示列控制功能，默认 true */
    showColumnControl?: boolean
    /** 右侧自定义内容 */
    rightContent?: React.ReactNode
    /** 搜索组件配置 */
    search?: Partial<TableToolbarProps['search']>
    /** 刷新按钮配置 */
    refresh?: Partial<TableToolbarProps['refresh']>
  }

  /** 选择工具栏配置（选中行时显示的固定工具栏） */
  selectionToolbar?: {
    /** 是否启用，默认 true（仅在 rowSelection.enabled 为 true 时生效） */
    enabled?: boolean
    /** 固定位置，默认 'bottom' */
    position?: 'top' | 'bottom'
    /** 自定义容器样式类 */
    className?: string
    /** 自定义渲染函数 */
    render?: (ctx: SelectionToolbarContext<TData>) => React.ReactNode
  }

  /** 列可见性存储键名，用于 localStorage 持久化 */
  columnVisibilityStorageKey?: string

  /** 样式类名 */
  className?: string

  /** 分页组件配置 */
  paginationConfig?: {
    /** 是否显示每页条数选择器，默认 true */
    showPageSizeSelector?: boolean
    /** 是否显示选中行数统计，默认 false */
    showSelection?: boolean
    /** 每页条数选项，默认 [10, 20, 30, 40, 50] */
    pageSizeOptions?: number[]
  }

  /** 行选择配置 */
  rowSelection?: {
    /** 是否启用行选择功能，默认 false */
    enabled?: boolean
    /** 初始选中的行 */
    initialSelection?: RowSelectionState
    /** 行选择变化回调 */
    onSelectionChange?: (selection: RowSelectionState) => void
    /** 获取行 ID 的函数，默认使用 'id' 字段 */
    getRowId?: (row: TData) => string
  }

  /** 分页变化回调 */
  onPaginationChange?: (pagination: PaginationState) => void
  /** 查询参数变化回调 */
  onQueryParamsChange?: (params: QueryParams) => void
  /** 查询键变化回调 */
  onQueryKeyChange?: (queryKey?: QueryKey) => void
  /** 刷新回调 */
  onRefresh?: () => void | Promise<void>
}

/** 选择工具栏的渲染上下文 */
export type SelectionToolbarContext<TData> = SelectionToolbarContextType<TData>

/**
 * ProTable - 高级表格组件
 *
 * 集成了 TableToolbar、Table、TablePagination 的功能
 * 支持搜索、过滤、排序、列控制、分页等完整的表格功能
 */
export function ProTable<TData>(props: ProTableProps<TData>) {
  const {
    columns,
    data: externalData,
    loading: externalLoading = false,
    pagination: externalPagination,
    queryOptionsFn,
    queryKeyFn,
    headerTitle,
    toolbar = {},
    selectionToolbar,
    columnVisibilityStorageKey,
    className,
    paginationConfig = {},
    rowSelection: rowSelectionConfig = {},

    onPaginationChange,
    onQueryParamsChange,
    onQueryKeyChange,
    onRefresh,
  } = props

  const {
    rightContent,
    search,
    refresh,
  } = toolbar

  const {
    showPageSizeSelector = true,
    showSelection = false,
    pageSizeOptions = [10, 20, 30, 40, 50],
  } = paginationConfig

  const {
    enabled: rowSelectionEnabled = false,
    initialSelection = {},
    onSelectionChange,
    getRowId,
  } = rowSelectionConfig

  const {
    enabled: selectionToolbarEnabled = true,
    position: selectionToolbarPosition = 'bottom',
    className: selectionToolbarClassName,
    render: selectionToolbarRender,
  } = selectionToolbar ?? {}

  // 内部状态管理
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: (externalPagination?.page ?? 1) - 1,
    pageSize: externalPagination?.pageSize ?? 10,
  })
  const [queryParams, setQueryParams] = useState<QueryParams>()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialSelection)

  const isExternalMode = !!externalData

  const queryClient = useQueryClient()

  const queryOptions = useMemo(() => {
    return {
      query: {
        ...queryParams,
        page: internalPagination.pageIndex + 1,
        pageSize: internalPagination.pageSize,
      },
    }
  }, [queryParams, internalPagination])

  const queryKey = useMemo(() => queryKeyFn?.(queryOptions), [queryKeyFn, queryOptions])

  useEffect(() => {
    onQueryKeyChange?.(queryKey)
  }, [queryKey, onQueryKeyChange])

  // 内置查询（仅在内置模式下使用）
  const internalQuery = useQuery(
    isExternalMode || typeof queryOptionsFn !== 'function'
      ? {
          enabled: false,
          queryKey: ['disabled'],
          queryFn: () => Promise.resolve(null as AnyType),
        }
      : queryOptionsFn(queryOptions),
  )

  const handleRefresh = useEvent(async () => {
    void onRefresh?.()

    if (!isExternalMode) {
      if (queryKey) {
        await queryClient.invalidateQueries({
          queryKey,
        })
      }
      else {
        consola.warn('找不到 queryKey！')
      }
    }
  })

  const data = (isExternalMode ? externalData : internalQuery.data?.data) ?? []
  const loading = isExternalMode
    ? externalLoading
    : internalQuery.isLoading
  const pageCount = isExternalMode
    ? externalPagination?.totalPages
    : internalQuery.data?.pagination.totalPages

  const { pageIndex, pageSize } = internalPagination

  useEffect(() => {
    onPaginationChange?.({
      pageIndex,
      pageSize,
    })
  }, [onPaginationChange, pageIndex, pageSize])

  const handleQueryParamsChange = useEvent((params: QueryParams) => {
    setQueryParams(params)
    onQueryParamsChange?.(params)
  })

  /**
   * 处理行选择状态变化
   * 统一处理函数式更新和直接赋值两种情况
   */
  const handleRowSelectionChange = useEvent(
    (updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updaterOrValue === 'function'
        ? updaterOrValue(rowSelection)
        : updaterOrValue

      setRowSelection(newSelection)
      onSelectionChange?.(newSelection)
    },
  )

  // 动态生成搜索字段
  const searchFields = useMemo(() => generateSearchFields<TData>(columns), [columns])

  /**
   * 获取强制可见的列键名
   * 这些列不能被隐藏（如操作列、选择列等）
   */
  const getForceVisibleColumnKeys = useMemo(() => {
    const keys: string[] = []

    // 添加选择列
    if (rowSelectionEnabled) {
      keys.push('select')
    }

    // 添加其他强制可见的列
    columns.forEach((column) => {
      if (column.enableHiding === false) {
        const key = getColumnKey(column)

        if (key) {
          keys.push(key)
        }
      }
    })

    return keys
  }, [columns, rowSelectionEnabled])

  /**
   * 处理列可见性变化
   * 重构后的逻辑更清晰，职责分离
   */
  const handleColumnVisibilityChange = useEvent((config: ColumnVisibilityConfig) => {
    // 1. 构建新的可见性状态
    const newVisibilityState: VisibilityState = {}

    // 初始化所有搜索字段为不可见
    searchFields.forEach((field) => {
      newVisibilityState[field.key] = false
    })

    // 设置用户选择的可见列
    config.visibleColumns.forEach((key) => {
      newVisibilityState[key] = true
    })

    // 强制显示不能隐藏的列
    getForceVisibleColumnKeys.forEach((key) => {
      newVisibilityState[key] = true
    })

    // 2. 构建新的列顺序
    const newColumnOrder = [
      ...config.visibleColumns,
      // 添加强制可见但不在用户选择中的列
      ...getForceVisibleColumnKeys.filter((key) =>
        !config.visibleColumns.includes(key),
      ),
    ]

    // 3. 更新状态
    setColumnVisibility(newVisibilityState)
    setColumnOrder(newColumnOrder)
  })

  // 创建选择列定义
  const selectionColumn = useMemo<TableColumnDef<TData> | null>(() => {
    if (!rowSelectionEnabled) {
      return null
    }

    return {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            aria-label="Select all"
            checked={
              table.getIsAllPageRowsSelected()
              || (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => { table.toggleAllPageRowsSelected(!!value) }}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => { row.toggleSelected(!!value) }}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    }
  }, [rowSelectionEnabled])

  /**
   * 获取最终的列配置
   * 整合了选择列、用户列和排序逻辑
   * 确保选择列始终排在第一列
   */
  const finalColumns = useMemo(() => {
    // 1. 如果没有自定义排序，返回默认顺序（选择列在前）
    if (columnOrder.length === 0) {
      return [
        ...(selectionColumn ? [selectionColumn] : []),
        ...columns,
      ]
    }

    // 2. 创建非选择列的映射表
    const columnMap = new Map<string, TableColumnDef<TData>>()
    columns.forEach((column) => {
      const key = getColumnKey(column)

      if (key) {
        columnMap.set(key, column)
      }
    })

    // 3. 按照排序顺序重新组织列，但排除选择列
    const sortedColumns: TableColumnDef<TData>[] = []
    const usedKeys = new Set<string>()

    // 按顺序添加非选择列
    columnOrder.forEach((key) => {
      // 跳过选择列，它会在最后统一处理
      if (key === 'select') {
        return
      }

      const column = columnMap.get(key)

      if (column) {
        sortedColumns.push(column)
        usedKeys.add(key)
      }
    })

    // 添加未排序的剩余列（排除选择列）
    columns.forEach((column) => {
      const key = getColumnKey(column)

      if (key && !usedKeys.has(key)) {
        sortedColumns.push(column)
      }
    })

    // 4. 最终组合：选择列始终在最前面
    return [
      ...(selectionColumn ? [selectionColumn] : []),
      ...sortedColumns,
    ]
  }, [columns, columnOrder, selectionColumn])

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      pagination: internalPagination,
      columnVisibility,
      ...(rowSelectionEnabled && { rowSelection }),
    },
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    enableRowSelection: rowSelectionEnabled,
    onPaginationChange: setInternalPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    ...(rowSelectionEnabled && { onRowSelectionChange: handleRowSelectionChange }),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  })

  const tableRows = table.getRowModel().rows

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        {!!headerTitle && <h2 className="font-bold">{headerTitle}</h2>}

        {/* MARK: 工具栏 */}
        <TableToolbar
          className="ml-auto"
          columnVisibilityStorageKey={columnVisibilityStorageKey}
          fields={searchFields}
          refresh={{
            show: true,
            ...refresh,
            onRefresh: () => {
              void handleRefresh()
            },
          }}
          right={rightContent}
          search={search}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onQueryParamsChange={handleQueryParamsChange}
        />
      </div>

      {/* MARK: 表格 */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {
              loading
                ? (
                    <TableSkeleton
                      columns={finalColumns.length}
                      rows={internalPagination.pageSize}
                    />
                  )
                : tableRows.length > 0
                  ? (
                      tableRows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )
                  : <TableEmptyState columnsCount={finalColumns.length} />
            }
          </TableBody>
        </Table>
      </div>

      {/* MARK: 分页 */}
      <TablePagination
        pageSizeOptions={pageSizeOptions}
        showPageSizeSelector={showPageSizeSelector}
        showSelection={showSelection}
        table={table}
      />

      {/* MARK: 选中工具栏 */}
      {rowSelectionEnabled && selectionToolbarEnabled
        ? (
            <TableSelectionToolbar
              className={selectionToolbarClassName}
              enabled={selectionToolbarEnabled}
              position={selectionToolbarPosition}
              render={selectionToolbarRender}
              table={table}
            />
          )
        : null}
    </div>
  )
}
