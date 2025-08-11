import { Skeleton } from '~/components/ui/skeleton'
import { TableCell, TableRow } from '~/components/ui/table'

interface TableSkeletonProps {
  /** 表格列数，支持单个数字或 [min, preferred, max] 数组 */
  columns: number | [number, number, number]
  /** 骨架行数，默认为 5，支持单个数字或 [min, preferred, max] 数组 */
  rows?: number | [number, number, number]
}

/**
 * 计算 clamp 值，类似 CSS clamp(min, preferred, max)
 */
function calculateClampValue(
  value: number | [number, number, number],
): number {
  if (typeof value === 'number') {
    return value
  }

  const [min, preferred, max] = value

  // 简单的 clamp 实现：取 preferred 值，但确保在 min 和 max 范围内
  return Math.max(min, Math.min(preferred, max))
}

/**
 * 表格骨架加载组件
 * 提供美观的表格加载状态，支持自定义列数和行数
 * 支持类似 CSS clamp 的响应式数值设置
 */
export function TableSkeleton(props: TableSkeletonProps) {
  const { columns = [3, 5, 7], rows = [5, 10, 15] } = props

  const actualColumns = calculateClampValue(columns)
  const actualRows = calculateClampValue(rows)

  return (
    <>
      {Array.from({ length: actualRows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
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
