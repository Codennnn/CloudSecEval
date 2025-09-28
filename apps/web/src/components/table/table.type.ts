import type { ColumnDef } from '@tanstack/react-table'

import type { FieldTypeEnum } from '~/constants/form'

export type TableColumnDef<TData> = ColumnDef<TData> & {
  accessorKey?: string

  /** 字段类型 */
  type?: FieldTypeEnum

  /** 枚举选项 */
  enumOptions?: {
    value: string | boolean | number
    label: string
  }[]

  /** 是否在表格中隐藏 */
  hiddenInTable?: boolean
}
