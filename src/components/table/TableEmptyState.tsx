import { SearchIcon } from 'lucide-react'

import {
  TableCell,
  TableRow,
} from '~/components/ui/table'

function BackgroundPattern() {
  const opacity = 0.08

  return (
    <svg
      fill="none"
      height={480}
      viewBox="0 0 480 480"
      width={480}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="240"
        cy="240"
        opacity={opacity}
        r="47.5"
        stroke="currentColor"
      />
      <circle
        cx="240"
        cy="240"
        opacity={opacity - 0.02}
        r="79.5"
        stroke="currentColor"
      />
      <circle
        cx="240"
        cy="240"
        opacity={opacity - 0.04}
        r="111.5"
        stroke="currentColor"
      />
      <circle
        cx="240"
        cy="240"
        opacity={opacity - 0.06}
        r="143.5"
        stroke="currentColor"
      />
      <circle
        cx="240"
        cy="240"
        opacity={opacity - 0.08}
        r="143.5"
        stroke="currentColor"
      />
      <circle
        cx="240"
        cy="240"
        opacity={opacity - 0.1}
        r="175.5"
        stroke="currentColor"
      />
      <circle
        cx="240"
        cy="240"
        opacity={opacity - 0.12}
        r="207.5"
        stroke="currentColor"
      />
      <circle
        cx="240"
        cy="240"
        opacity={opacity - 0.14}
        r="239.5"
        stroke="currentColor"
      />
    </svg>
  )
}

interface TableEmptyStateProps {
  columnsCount: number
}

export function TableEmptyState(props: TableEmptyStateProps) {
  const { columnsCount } = props

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={columnsCount}
      >
        <div className="flex flex-col items-center justify-center overflow-hidden p-14">
          <div className="pointer-events-none relative">
            <div className="inline-flex items-center justify-center rounded-lg border border-divider bg-background p-3 shadow-[inset_0_-2px_0_0_oklch(from_var(--primary)_l_c_h_/_10%),_0_1px_2px_0_oklch(from_var(--primary)_l_c_h_/_20%)] dark:shadow-[inset_0_-2px_0_0_oklch(from_var(--primary)_l_c_h_/_80%),_0_1px_2px_0_oklch(from_var(--primary)_l_c_h_/_60%)]">
              <SearchIcon />
            </div>

            <div className="absolute left-1/2 top-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2">
              <BackgroundPattern />
            </div>
          </div>

          <div className="z-10 flex flex-col items-center">
            <div className="mb-2 mt-6 text-lg font-medium">
              <slot name="title">
                暂无数据记录
              </slot>
            </div>

            <div>请调整查询条件或添加新的数据</div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
