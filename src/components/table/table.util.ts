import type { TableColumnDef } from '~/components/table/table.type'
import { FieldTypeEnum } from '~/constants/form'
import type { SearchField } from '~/types/advanced-search'

/**
 * 获取表格列的唯一标识符
 * @param column 表格列定义
 * @returns 列的唯一标识符，确保返回字符串类型
 */
export function getColumnKey<TData>(column: TableColumnDef<TData>): string | null {
  // 优先使用 accessorKey（数据列）
  if ('accessorKey' in column && typeof column.accessorKey === 'string') {
    return column.accessorKey
  }

  return column.id ?? null
}

/**
  * 根据表格列定义生成搜索字段配置
  * @param columns 表格列定义数组
  * @returns 搜索字段配置数组
  */
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
        visible,
        sortable: column.enableSorting,
        enableHiding: column.enableHiding,
      }
    })
}
