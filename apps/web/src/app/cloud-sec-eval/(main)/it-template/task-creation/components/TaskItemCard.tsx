'use client'

import { useState } from 'react'

import { ChevronDownIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'

import { ConfigTable } from './ConfigTable'

/**
 * 任务分项数据接口
 */
interface TaskItem {
  id: string
  title: string
  difficulty: string
  requirement: string
  steps: string[]
  configs: Array<{
    label: string
    value: string
    approver?: string
  }>
}

/**
 * 任务分项卡片组件属性
 */
interface TaskItemCardProps {
  item: TaskItem
  index: number
}

/**
 * 任务分项卡片组件
 * 展示单个任务分项的详细信息，支持折叠/展开
 */
export function TaskItemCard(props: TaskItemCardProps) {
  const { item, index } = props
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* 卡片头部 - 标题和折叠按钮 */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-blue-600">
                {item.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                {item.difficulty}
              </Badge>
            </div>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
                <span className="sr-only">
                  {isOpen ? '折叠' : '展开'}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        {/* 可折叠内容区 */}
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* 安全要求 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">安全要求：</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.requirement}
              </p>
            </div>

            {/* 实施步骤 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">安全要求：</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                {item.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="leading-relaxed">
                    {stepIndex + 1}. {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* 配置信息表格 */}
            <ConfigTable configs={item.configs} />
          </CardContent>

          {/* 卡片底部 - 审批人和完成按钮 */}
          <CardFooter className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>审批人：</span>
              <span className="font-medium text-foreground">admin</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              已完成
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

