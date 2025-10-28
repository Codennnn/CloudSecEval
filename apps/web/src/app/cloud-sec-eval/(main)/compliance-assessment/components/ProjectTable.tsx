'use client'

import { useRouter } from 'next/navigation'

import { EyeIcon, MoreHorizontalIcon, Trash2Icon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Progress } from '~/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import {
  assessmentTypeNames,
  processStageNames,
  projectStatusNames,
} from '../lib/mock-data'
import { formatRelativeTime } from '../lib/process-simulator'
import type { AssessmentProject } from '../types/assessment'

interface ProjectTableProps {
  /** 项目列表 */
  projects: AssessmentProject[]
  /** 删除项目回调 */
  onDelete?: (projectId: string) => void
}

/**
 * 评估项目列表表格
 */
export function ProjectTable(props: ProjectTableProps) {
  const { projects, onDelete } = props
  const router = useRouter()

  /**
   * 处理查看详情
   */
  const handleViewDetails = (projectId: string) => {
    router.push(`/cloud-sec-eval/compliance-assessment/${projectId}`)
  }

  /**
   * 处理删除项目
   */
  const handleDelete = (projectId: string) => {
    if (confirm('确定要删除这个项目吗？此操作不可恢复。')) {
      onDelete?.(projectId)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>评估项目列表</CardTitle>
        <CardDescription>
          查看和管理所有合规评估项目
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>项目名称</TableHead>
                <TableHead>评估类型</TableHead>
                <TableHead>当前阶段</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>自动化率</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0
                ? (
                    <TableRow>
                      <TableCell
                        className="h-24 text-center text-muted-foreground"
                        colSpan={7}
                      >
                        暂无评估项目
                      </TableCell>
                    </TableRow>
                  )
                : (
                    projects.map(project => (
                      <TableRow
                        key={project.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          handleViewDetails(project.id)
                        }}
                      >
                        {/* 项目名称 */}
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div>{project.name}</div>
                            {project.description && (
                              <div className="text-xs text-muted-foreground">
                                {project.description}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* 评估类型 */}
                        <TableCell>
                          <Badge variant="outline">
                            {assessmentTypeNames[project.type]}
                          </Badge>
                        </TableCell>

                        {/* 当前阶段 */}
                        <TableCell>
                          {processStageNames[project.currentStage]}
                        </TableCell>

                        {/* 状态 */}
                        <TableCell>
                          <StatusBadge status={project.status} />
                        </TableCell>

                        {/* 自动化率 */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress
                                className="h-2 w-20"
                                value={project.automationRate * 100}
                              />
                              <span className="text-sm font-medium">
                                {Math.round(project.automationRate * 100)}%
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* 创建时间 */}
                        <TableCell className="text-muted-foreground">
                          {formatRelativeTime(project.createdAt)}
                        </TableCell>

                        {/* 操作 */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <MoreHorizontalIcon className="size-4" />
                                <span className="sr-only">操作菜单</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewDetails(project.id)
                                }}
                              >
                                <EyeIcon className="mr-2 size-4" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(project.id)
                                }}
                              >
                                <Trash2Icon className="mr-2 size-4" />
                                删除项目
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 状态徽章组件
 */
function StatusBadge(props: { status: AssessmentProject['status'] }) {
  const { status } = props

  const variants: Record<typeof status, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'outline',
    'in-progress': 'default',
    'pending-review': 'secondary',
    completed: 'default',
    archived: 'outline',
  }

  const colors: Record<typeof status, string> = {
    draft: 'text-gray-600',
    'in-progress': 'text-blue-600',
    'pending-review': 'text-orange-600',
    completed: 'text-green-600',
    archived: 'text-gray-500',
  }

  return (
    <Badge className={colors[status]} variant={variants[status]}>
      {projectStatusNames[status]}
    </Badge>
  )
}

