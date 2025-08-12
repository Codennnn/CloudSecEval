import {
  TableCell,
  TableRow,
} from '~/components/ui/table'

interface TableEmptyStateProps {
  columnsCount: number
}

export function TableEmptyState(props: TableEmptyStateProps) {
  const { columnsCount } = props

  return (
    <TableRow>
      <TableCell
        className="h-24 text-center"
        colSpan={columnsCount}
      >
        暂无数据
      </TableCell>
    </TableRow>
  )
}
