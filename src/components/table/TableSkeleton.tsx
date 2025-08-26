import { Skeleton } from '~/components/ui/skeleton'
import { TableCell, TableRow } from '~/components/ui/table'

interface TableSkeletonProps {
  /** 表格列数，支持单个数字或 [min, preferred, max] 数组 */
  columns: number | [number, number, number]
  /** 骨架行数，默认为 5，支持单个数字或 [min, preferred, max] 数组 */
  rows?: number | [number, number, number]
}

/**
 * 计算 clamp 数值，语义等同于 CSS 的 clamp(min, preferred, max)。
 *
 * 约定：
 * - 当传入 `value` 为单个数字时，将其视为 preferred，并使用 `fallbackClamp` 的
 *   min / max 进行约束，避免极端值导致骨架行/列渲染过多。
 * - 当传入 `value` 为三元数组时，按其定义的 [min, preferred, max] 进行约束。
 */
function calculateClampValue(
  value: number | [number, number, number],
  fallbackClamp: [number, number, number],
): number {
  let min = fallbackClamp[0]
  let preferred = fallbackClamp[1]
  let max = fallbackClamp[2]

  if (Array.isArray(value)) {
    min = value[0]
    preferred = value[1]
    max = value[2]
  }
  else {
    preferred = value
  }

  const clampedValue = Math.max(min, Math.min(preferred, max))

  return clampedValue
}

/**
 * 表格骨架加载组件
 * 提供美观的表格加载状态，支持自定义列数和行数
 * 支持类似 CSS clamp 的响应式数值设置
 */
export function TableSkeleton(props: TableSkeletonProps) {
  const { columns = [3, 5, 7], rows = [5, 10, 15] } = props

  // 为数值型入参提供默认的 clamp 边界，避免出现超大值时渲染过多骨架元素
  const defaultColumnsClamp: [number, number, number] = [3, 5, 7]
  const defaultRowsClamp: [number, number, number] = [5, 10, 15]

  const actualColumns = calculateClampValue(columns, defaultColumnsClamp)
  const actualRows = calculateClampValue(rows, defaultRowsClamp)

  return (
    <>
      {Array.from({ length: actualRows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="pointer-events-none">
          {Array.from({ length: actualColumns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="py-2">
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
