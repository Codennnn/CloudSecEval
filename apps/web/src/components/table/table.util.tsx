import { get } from 'lodash-es'

import type { TableColumnDef } from '~/components/table/table.type'
import { Badge } from '~/components/ui/badge'
import { FieldTypeEnum } from '~/constants/form'
import { cn } from '~/lib/utils'
import type { SearchField } from '~/types/advanced-search'
import { DateFormat, formatDate, formatRelativeTime } from '~/utils/date'

/**
 * 获取表格列的唯一标识符
 */
export function getColumnKey<TData>(column: TableColumnDef<TData>): string | null {
  if ('accessorKey' in column && typeof column.accessorKey === 'string') {
    return column.accessorKey
  }

  return column.id ?? null
}

/** 根据表格列定义生成搜索字段配置 */
export function generateSearchFields<TData>(columns: TableColumnDef<TData>[]): SearchField[] {
  return columns
    .filter((column): column is TableColumnDef<TData> & { accessorKey: string } => {
      return 'accessorKey' in column && typeof column.accessorKey === 'string'
    })
    .map<SearchField>((column) => {
      const key = column.accessorKey
      const header = typeof column.header === 'string' ? column.header : '???'
      const fieldType = column.type ?? FieldTypeEnum.STRING
      const visible = column.hiddenInTable !== true

      return {
        key,
        label: header,
        type: fieldType,
        // 传递枚举选项
        options: column.enumOptions,
        visible,
        sortable: column.enableSorting,
        enableHiding: column.enableHiding,
      }
    })
}

export type DateColumnOptions<TData> = TableColumnDef<TData> & {
  showRelative?: boolean
  format?: DateFormat
  className?: string
}

export function createDateColumn<TData>(
  options: DateColumnOptions<TData>,
): TableColumnDef<TData> {
  const {
    showRelative = false,
    format = DateFormat.YYYY_MM_DD_HH_MM,
    className,
    ...rest
  } = options

  return {
    ...rest,
    type: FieldTypeEnum.DATE,
    cell: ({ row }) => {
      const value = typeof rest.accessorKey === 'string'
        ? get(row.original, rest.accessorKey)
        : undefined

      if (value) {
        const textRelative = showRelative ? formatRelativeTime(value) : undefined
        const text = textRelative ?? formatDate(value, format)

        return (
          <div className={cn('text-xs text-muted-foreground', className)}>
            {text}
          </div>
        )
      }

      return '-'
    },
  }
}

export type EnumColumnOptions<TData> = TableColumnDef<TData> & {
  enumOptions: { value: string, label: string }[]
  getLabelFn?: (value: string) => string
  className?: string
}

/**
 * 创建枚举类型的表格列
 */
export function createEnumColumn<TData>(
  options: EnumColumnOptions<TData>,
): TableColumnDef<TData> {
  const {
    enumOptions,
    getLabelFn,
    className,
    ...rest
  } = options

  return {
    ...rest,
    type: FieldTypeEnum.ENUM,
    enumOptions,
    cell: ({ row }) => {
      const value = typeof rest.accessorKey === 'string'
        ? get(row.original, rest.accessorKey)
        : undefined

      if (value) {
        const label = getLabelFn?.(String(value))
          ?? enumOptions.find((opt) => opt.value === value)?.label
          ?? String(value)

        return (
          <Badge className={className} variant="outline">
            {label}
          </Badge>
        )
      }

      return '-'
    },
  }
}
