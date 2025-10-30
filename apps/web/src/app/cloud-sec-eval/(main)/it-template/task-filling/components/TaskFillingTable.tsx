import { FileTextIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import { taskFillingStatusConfig, type TaskFillingItem } from '../lib/task-filling-data'

/**
 * 任务填报表格组件属性
 */
interface TaskFillingTableProps {
  tasks: TaskFillingItem[]
}

/**
 * 任务填报表格组件
 * 展示任务填报列表数据
 */
export function TaskFillingTable(props: TaskFillingTableProps) {
  const { tasks } = props

  /**
   * 处理详情操作
   */
  const handleViewDetails = (taskId: string) => {
    // 静态演示，不执行实际操作
    console.log('查看详情:', taskId)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">工单标题</TableHead>
            <TableHead className="w-[150px]">标题分类</TableHead>
            <TableHead className="w-[120px]">安全要求</TableHead>
            <TableHead className="w-[250px]">检查项</TableHead>
            <TableHead className="w-[100px]">下发人</TableHead>
            <TableHead className="w-[100px]">状态</TableHead>
            <TableHead className="w-[180px]">创建时间</TableHead>
            <TableHead className="w-[100px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0
            ? (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={8}
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              )
            : (
                tasks.map((task) => {
                  const statusConfig = taskFillingStatusConfig[task.status]

                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {task.workOrderTitle}
                      </TableCell>
                      <TableCell>{task.titleCategory}</TableCell>
                      <TableCell>{task.securityRequirement}</TableCell>
                      <TableCell className="max-w-[250px] truncate" title={task.checkItem}>
                        {task.checkItem}
                      </TableCell>
                      <TableCell>{task.assignedBy}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {task.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-blue-600"
                          onClick={() => {
                            handleViewDetails(task.id)
                          }}
                        >
                          <FileTextIcon className="mr-1 h-3.5 w-3.5" />
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
        </TableBody>
      </Table>
    </div>
  )
}

