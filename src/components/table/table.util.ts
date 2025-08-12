import type { TableColumnDef } from '~/components/table/table.type'
import { FieldTypeEnum } from '~/constants/form'
import type { SearchField } from '~/types/advanced-search'

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
      const visible = column.enableHiding === false ? true : undefined

      return {
        key,
        label: header,
        type: fieldType,
        sortable: column.enableSorting,
        visible,
      }
    })
}
