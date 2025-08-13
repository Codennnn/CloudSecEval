'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'

import type { TableColumnDef } from '~/components/table/table.type'
import { generateSearchFields, getColumnKey } from '~/components/table/table.util'
import { TableEmptyState } from '~/components/table/TableEmptyState'
import { TablePagination } from '~/components/table/TablePagination'
import { TableSkeleton } from '~/components/table/TableSkeleton'
import { TableToolbar } from '~/components/table/TableToolbar'
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

import type { Options } from '~api/sdk.gen'
import type { PaginationMetaDto } from '~api/types.gen'

export type QueryOptions<TData> = (options: Options) =>
UseQueryOptions<ListResponse<TData>, Error, ListResponse<TData>, unknown[]>

/**
 * ProTable 组件属性接口
 */
export interface ProTableProps<TData> {
  /** 表格列定义 */
  columns: TableColumnDef<TData>[]

  // ==================== 外部控制模式 ====================
  /** 表格数据（外部控制模式） */
  data?: TData[]
  /** 加载状态（外部控制模式） */
  loading?: boolean
  /** 分页配置（外部控制模式） */
  pagination?: PaginationMetaDto

  // ==================== 内置请求模式 ====================
  /** 查询配置生成函数（内置请求模式） */
  queryOptions?: QueryOptions<TData>

  /** 工具栏配置 */
  toolbar?: {
    /** 是否显示搜索功能，默认 true */
    showSearch?: boolean
    /** 是否显示列控制功能，默认 true */
    showColumnControl?: boolean
    /** 右侧自定义内容 */
    rightContent?: React.ReactNode
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

  /** 分页变化回调 */
  onPaginationChange?: (pagination: PaginationState) => void
  /** 查询参数变化回调 */
  onQueryParamsChange?: (params: QueryParams) => void
}

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
    queryOptions,
    toolbar = {},
    columnVisibilityStorageKey,
    className,
    paginationConfig = {},
    onPaginationChange,
    onQueryParamsChange,
  } = props

  const {
    showSearch = true,
    showColumnControl = true,
    rightContent,
  } = toolbar

  const {
    showPageSizeSelector = true,
    showSelection = false,
    pageSizeOptions = [10, 20, 30, 40, 50],
  } = paginationConfig

  // 内部状态管理
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: (externalPagination?.page ?? 1) - 1,
    pageSize: externalPagination?.pageSize ?? 10,
  })
  const [queryParams, setQueryParams] = useState<QueryParams>()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([])

  // 判断使用模式
  const isExternalMode = !!externalData

  // 内置查询（仅在内置模式下使用）
  const internalQuery = useQuery(
    isExternalMode || !queryOptions
      ? { enabled: false, queryKey: ['disabled'] }
      : queryOptions({
          query: {
            ...queryParams,
            page: internalPagination.pageIndex + 1,
            pageSize: internalPagination.pageSize,
          },
        }),
  )

  // 确定使用的数据源
  const data = (isExternalMode ? externalData : internalQuery.data?.data) ?? []
  const loading = isExternalMode
    ? externalLoading
    : internalQuery.isLoading
  const pageCount = isExternalMode
    ? externalPagination?.totalPages
    : internalQuery.data?.pagination.totalPages

  useEffect(() => {
    onPaginationChange?.(internalPagination)
  }, [onPaginationChange, internalPagination])

  const handleQueryParamsChange = useEvent((params: QueryParams) => {
    setQueryParams(params)
    onQueryParamsChange?.(params)
  })

  // 动态生成搜索字段
  const searchFields = useMemo(() => generateSearchFields<TData>(columns), [columns])

  // 处理列可见性变化
  const handleColumnVisibilityChange = useEvent((config: ColumnVisibilityConfig) => {
    const newVisibilityState: VisibilityState = {}

    // 所有字段先设为不可见
    searchFields.forEach((field) => {
      newVisibilityState[field.key] = false
    })

    // 设置可见字段
    config.visibleColumns.forEach((key) => {
      newVisibilityState[key] = true
    })

    // 对于不能隐藏的列（如操作列），强制设为可见
    columns.forEach((column) => {
      if (column.enableHiding === false) {
        const key = getColumnKey(column)

        if (key) {
          newVisibilityState[key] = true
        }
      }
    })

    // 更新列的顺序：按照可见列的顺序，然后添加强制可见的列
    const newColumnOrder: string[] = []

    // 首先添加按顺序排列的可见列
    config.visibleColumns.forEach((key) => {
      newColumnOrder.push(key)
    })

    // 添加强制可见的列（如果还没有在列表中）
    columns.forEach((column) => {
      if (column.enableHiding === false) {
        const key = getColumnKey(column)

        if (key && !newColumnOrder.includes(key)) {
          newColumnOrder.push(key)
        }
      }
    })

    setColumnVisibility(newVisibilityState)
    setColumnOrder(newColumnOrder)
  })

  // 根据列可见性配置和顺序重新排序列
  const orderedColumns = useMemo(() => {
    if (columnOrder.length === 0) {
      return columns
    }

    // 创建列的映射
    const columnMap = new Map<string, typeof columns[0]>()
    columns.forEach((column) => {
      const key = getColumnKey(column)

      if (key) {
        columnMap.set(key, column)
      }
    })

    // 按照 columnOrder 的顺序重新排列列
    const orderedCols: typeof columns = []

    // 首先添加按顺序排列的列
    columnOrder.forEach((key) => {
      const column = columnMap.get(key)

      if (column) {
        orderedCols.push(column)
        columnMap.delete(key) // 移除已添加的列
      }
    })

    // 添加剩余的列（如新增的列或未在 order 中的列）
    columnMap.forEach((column) => {
      orderedCols.push(column)
    })

    return orderedCols
  }, [columns, columnOrder])

  // 创建表格实例
  const table = useReactTable({
    data,
    columns: orderedColumns,
    state: {
      pagination: internalPagination,
      columnVisibility,
      columnOrder,
    },
    onPaginationChange: setInternalPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  })

  const tableRows = table.getRowModel().rows

  return (
    <div className={cn('space-y-6', className)}>
      {/* 工具栏 */}
      {(showSearch || showColumnControl || rightContent) && (
        <TableToolbar
          columnVisibilityStorageKey={columnVisibilityStorageKey}
          fields={searchFields}
          right={rightContent}
          onColumnVisibilityChange={showColumnControl ? handleColumnVisibilityChange : undefined}
          onQueryParamsChange={showSearch ? handleQueryParamsChange : undefined}
        />
      )}

      {/* 表格 */}
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
                      columns={orderedColumns.length}
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
                  : <TableEmptyState columnsCount={orderedColumns.length} />
            }
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <TablePagination
        pageSizeOptions={pageSizeOptions}
        showPageSizeSelector={showPageSizeSelector}
        showSelection={showSelection}
        table={table}
      />
    </div>
  )
}
