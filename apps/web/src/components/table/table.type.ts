import type { ColumnDef } from '@tanstack/react-table'

import type { FieldTypeEnum } from '~/constants/form'

export type TableColumnDef<TData> = ColumnDef<TData> & {
  accessorKey?: string

  /** 字段类型 */
  type?: FieldTypeEnum

  /** 枚举选项（仅当 type 为 'enum' 时需要） */
  enumOptions?: { value: string, label: string }[]

  /** 是否在表格中隐藏 */
  hiddenInTable?: boolean
}
