import type { ColumnDef } from '@tanstack/react-table'

import type { FieldTypeEnum } from '~/constants/form'

export type TableColumnDef<TData> = ColumnDef<TData> & {
  type?: FieldTypeEnum
}
