'use client'

import { useMemo, useState } from 'react'

import {
  AlertTriangleIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  WrenchIcon,
} from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { cn } from '~/lib/utils'

import type { AnalysisResult } from '../types/regulation'

interface DetailPanelProps {
  /** 解析结果 */
  result: AnalysisResult | null
}

/**
 * 详情面板组件
 * 展示法规条款、评估项、风险点、整改措施的详细信息
 */
export function DetailPanel(props: DetailPanelProps) {
  const { result } = props

  const [activeTab, setActiveTab] = useState('clauses')

  // 风险等级配置
  const riskLevelConfig = useMemo(() => {
    return {
      high: { label: '高风险', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-950/30' },
      medium: { label: '中风险', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-950/30' },
      low: { label: '低风险', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-950/30' },
    }
  }, [])

  if (!result) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>详情面板</CardTitle>
          <CardDescription>
            解析完成后，这里将显示详细信息
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BookOpenIcon className="mx-auto mb-2 size-12 opacity-20" />
            <p>暂无数据</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>详情面板</CardTitle>
        <CardDescription>
          查看法规条款、评估项、风险点和整改措施的详细信息
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="clauses">
              法规条款
              <Badge className="ml-1" variant="secondary">
                {result.clauses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="assessments">
              评估项
              <Badge className="ml-1" variant="secondary">
                {result.assessmentItems.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="risks">
              风险点
              <Badge className="ml-1" variant="secondary">
                {result.riskPoints.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="remediations">
              整改措施
              <Badge className="ml-1" variant="secondary">
                {result.remediationMeasures.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* 法规条款 */}
          <TabsContent value="clauses">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {result.clauses.map((clause) => {
                  return (
                    <div
                      key={clause.id}
                      className="rounded-lg border bg-card p-4 shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="size-4 text-blue-500" />
                          <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                            {clause.code}
                          </span>
                        </div>
                        <Badge variant={clause.level === 'high' ? 'default' : 'secondary'}>
                          {clause.level === 'high' ? '重要' : clause.level === 'medium' ? '一般' : '参考'}
                        </Badge>
                      </div>
                      <h4 className="mb-2 font-semibold">{clause.title}</h4>
                      <p className="text-sm text-muted-foreground">{clause.content}</p>
                      <div className="mt-2">
                        <Badge variant="outline">{clause.category}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 评估项 */}
          <TabsContent value="assessments">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {result.assessmentItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border bg-card p-4 shadow-sm"
                    >
                      <div className="mb-3 flex items-start gap-2">
                        <CheckCircle2Icon className="mt-0.5 size-4 flex-shrink-0 text-green-500" />
                        <h4 className="font-semibold">{item.name}</h4>
                      </div>

                      <div className="mb-3 space-y-2">
                        <div className="text-sm font-medium">检查点：</div>
                        <ul className="space-y-1 pl-4">
                          {item.checkpoints.map((checkpoint, index) => {
                            return (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground"
                              >
                                • {checkpoint}
                              </li>
                            )
                          })}
                        </ul>
                      </div>

                      <div className="rounded-md bg-muted/50 p-2 text-sm">
                        <span className="font-medium">评分标准：</span>
                        <span className="text-muted-foreground">{item.scoringCriteria}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 风险点 */}
          <TabsContent value="risks">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {result.riskPoints.map((risk) => {
                  const levelConfig = riskLevelConfig[risk.level]

                  return (
                    <div
                      key={risk.id}
                      className={cn('rounded-lg border p-4 shadow-sm', levelConfig.bgColor)}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <AlertTriangleIcon className={cn('mt-0.5 size-4 flex-shrink-0', levelConfig.color)} />
                          <h4 className="font-semibold">{risk.name}</h4>
                        </div>
                        <Badge className={levelConfig.color} variant="outline">
                          {levelConfig.label}
                        </Badge>
                      </div>

                      <div className="mb-2 space-y-2 text-sm">
                        <div>
                          <span className="font-medium">风险描述：</span>
                          <span className="text-muted-foreground">{risk.description}</span>
                        </div>
                        <div>
                          <span className="font-medium">影响范围：</span>
                          <span className="text-muted-foreground">{risk.impact}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>历史发现次数：</span>
                        <Badge variant="secondary">{risk.frequency} 次</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 整改措施 */}
          <TabsContent value="remediations">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {result.remediationMeasures.map((measure) => {
                  return (
                    <div
                      key={measure.id}
                      className="rounded-lg border bg-card p-4 shadow-sm"
                    >
                      <div className="mb-3 flex items-start gap-2">
                        <WrenchIcon className="mt-0.5 size-4 flex-shrink-0 text-purple-500" />
                        <h4 className="font-semibold">{measure.name}</h4>
                      </div>

                      <div className="mb-3 space-y-2">
                        <div className="text-sm font-medium">操作步骤：</div>
                        <ol className="space-y-1 pl-4">
                          {measure.steps.map((step, index) => {
                            return (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground"
                              >
                                {index + 1}. {step}
                              </li>
                            )
                          })}
                        </ol>
                      </div>

                      <div className="mb-3 flex items-center gap-2 text-sm">
                        <span className="font-medium">预计工作量：</span>
                        <Badge variant="secondary">{measure.estimatedEffort} 人天</Badge>
                      </div>

                      {measure.referenceLinks.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">参考文档：</div>
                          <div className="space-y-1">
                            {measure.referenceLinks.map((link, index) => {
                              return (
                                <a
                                  key={index}
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                                  href={link}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  <ExternalLinkIcon className="size-3" />
                                  <span>参考链接 {index + 1}</span>
                                </a>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
