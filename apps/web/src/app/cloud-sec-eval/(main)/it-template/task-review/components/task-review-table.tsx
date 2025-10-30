import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import type { TaskReviewItem } from '../lib/mock-data'

/**
 * 任务审核表格组件属性
 */
interface TaskReviewTableProps {
  tasks: TaskReviewItem[]
}

/**
 * 任务审核表格组件
 * 用于展示待审核的任务数据
 */
export function TaskReviewTable({ tasks }: TaskReviewTableProps) {
  /**
   * 处理审核按钮点击
   */
  const handleReview = (task: TaskReviewItem) => {
    console.log('审核任务:', task)
    // 静态演示，仅打印日志
    alert(`审核任务：${task.workOrderTitle}`)
  }

  /**
   * 处理查看详情按钮点击
   */
  const handleViewDetails = (task: TaskReviewItem) => {
    console.log('查看详情:', task)
    // 静态演示，仅打印日志
    alert(`查看详情：${task.workOrderTitle}`)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">工单标题</TableHead>
            <TableHead className="w-[150px]">标题分类</TableHead>
            <TableHead className="w-[150px]">安全要求</TableHead>
            <TableHead className="w-[120px]">填写部门</TableHead>
            <TableHead className="w-[180px]">创建时间</TableHead>
            <TableHead className="w-[150px] text-center">操作</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={6}>
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                {/* 工单标题 */}
                <TableCell className="font-medium">{task.workOrderTitle}</TableCell>

                {/* 标题分类 */}
                <TableCell>{task.titleCategory}</TableCell>

                {/* 安全要求 */}
                <TableCell>{task.securityRequirement}</TableCell>

                {/* 填写部门 */}
                <TableCell>{task.fillingDepartment}</TableCell>

                {/* 创建时间 */}
                <TableCell className="text-muted-foreground">
                  {task.createdAt}
                </TableCell>

                {/* 操作 */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      className="text-blue-600 hover:text-blue-700"
                      size="sm"
                      variant="link"
                      onClick={() => {
                        handleReview(task)
                      }}
                    >
                      审核
                    </Button>

                    <Button
                      className="text-gray-600 hover:text-gray-700"
                      size="sm"
                      variant="link"
                      onClick={() => {
                        handleViewDetails(task)
                      }}
                    >
                      详情
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

