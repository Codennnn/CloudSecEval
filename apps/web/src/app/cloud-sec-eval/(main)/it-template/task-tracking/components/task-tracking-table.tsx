import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import type { TaskTrackingItem } from '../lib/mock-data'
import { StatusBadges } from './status-badges'

/**
 * 任务跟踪表格组件属性
 */
interface TaskTrackingTableProps {
  tasks: TaskTrackingItem[]
}

/**
 * 任务跟踪表格组件
 * 用于展示任务跟踪数据
 */
export function TaskTrackingTable({ tasks }: TaskTrackingTableProps) {
  /**
   * 处理详情按钮点击
   */
  const handleViewDetails = (task: TaskTrackingItem) => {
    console.log('查看详情:', task)
    // 静态演示，仅打印日志
    alert(`查看任务详情：${task.templateName}`)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">模版名称</TableHead>
            <TableHead>统计</TableHead>
            <TableHead className="w-[100px] text-center">总计</TableHead>
            <TableHead className="w-[100px] text-center">操作</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={4}>
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                {/* 模版名称 */}
                <TableCell className="font-medium">{task.templateName}</TableCell>

                {/* 统计标签组 */}
                <TableCell>
                  <StatusBadges stats={task.stats} />
                </TableCell>

                {/* 总计 */}
                <TableCell className="text-center">{task.total}</TableCell>

                {/* 操作 */}
                <TableCell className="text-center">
                  <Button
                    className="text-blue-600 hover:text-blue-700"
                    size="sm"
                    variant="link"
                    onClick={() => {
                      handleViewDetails(task)
                    }}
                  >
                    详情
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

