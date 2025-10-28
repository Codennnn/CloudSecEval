'use client'

import { useState } from 'react'

import { CheckIcon, XIcon } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { ScrollArea } from '~/components/ui/scroll-area'

import { reviewCategoryNames } from '../../lib/mock-data'
import { simulateBatchApproval } from '../../lib/process-simulator'
import type { AssessmentProject, ReviewItem } from '../../types/assessment'

interface ManualReviewStageProps {
  /** 评估项目 */
  project: AssessmentProject
  /** 刷新回调 */
  onRefresh?: () => void
}

/**
 * 人工复核阶段组件
 */
export function ManualReviewStage(props: ManualReviewStageProps) {
  const { project } = props

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  // 筛选需要人工复核的项目
  const pendingItems = project.reviewItems.filter(
    item => item.status === 'manual-review' || item.requiresManualReview,
  )

  /**
   * 处理选择项目
   */
  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      }
      else {
        next.add(itemId)
      }
      return next
    })
  }

  /**
   * 处理全选/取消全选
   */
  const handleToggleAll = () => {
    if (selectedItems.size === pendingItems.length) {
      setSelectedItems(new Set())
    }
    else {
      setSelectedItems(new Set(pendingItems.map(item => item.id)))
    }
  }

  /**
   * 处理批量审批
   */
  const handleBatchApproval = async (approved: boolean) => {
    if (selectedItems.size === 0) {
      return
    }

    setIsProcessing(true)

    await simulateBatchApproval(Array.from(selectedItems), approved)

    setIsProcessing(false)
    setSelectedItems(new Set())

    // 这里应该更新项目状态
    console.log(`批量${approved ? '通过' : '驳回'}了 ${selectedItems.size} 项`)
  }

  /**
   * 处理进入下一阶段
   */
  const handleNextStage = () => {
    console.log('进入报告生成阶段')
  }

  const allReviewed = pendingItems.length === 0

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">待复核项目</p>
            <p className="text-sm text-muted-foreground">
              共 {pendingItems.length} 项需要人工复核
            </p>
          </div>
          {pendingItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedItems.size === pendingItems.length && pendingItems.length > 0}
                id="select-all"
                onCheckedChange={handleToggleAll}
              />
              <label
                className="cursor-pointer text-sm font-medium"
                htmlFor="select-all"
              >
                全选
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 待复核项目列表 */}
      {pendingItems.length > 0
        ? (
            <>
              <ScrollArea className="h-[400px] rounded-lg border">
                <div className="space-y-2 p-4">
                  {pendingItems.map(item => (
                    <ReviewItemCard
                      key={item.id}
                      isSelected={selectedItems.has(item.id)}
                      item={item}
                      onToggle={() => {
                        handleToggleItem(item.id)
                      }}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* 批量操作按钮 */}
              {selectedItems.size > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                  <p className="font-medium">
                    已选择 {selectedItems.size} 项
                  </p>
                  <div className="flex gap-2">
                    <Button
                      disabled={isProcessing}
                      variant="outline"
                      onClick={() => {
                        handleBatchApproval(false)
                      }}
                    >
                      <XIcon className="mr-2 size-4" />
                      批量驳回
                    </Button>
                    <Button
                      disabled={isProcessing}
                      onClick={() => {
                        handleBatchApproval(true)
                      }}
                    >
                      <CheckIcon className="mr-2 size-4" />
                      批量通过
                    </Button>
                  </div>
                </div>
              )}
            </>
          )
        : (
            <div className="rounded-lg border bg-green-50 p-8 text-center dark:bg-green-950/20">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CheckIcon className="size-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-100">
                所有项目已复核完成
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                可以进入下一阶段生成评估报告
              </p>
            </div>
          )}

      {/* 进入下一阶段按钮 */}
      {allReviewed && (
        <div className="flex justify-end">
          <Button size="lg" onClick={handleNextStage}>
            生成评估报告
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * 复核项目卡片组件
 */
function ReviewItemCard(props: {
  item: ReviewItem
  isSelected: boolean
  onToggle: () => void
}) {
  const { item, isSelected, onToggle } = props

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:bg-muted/50'
      }`}
    >
      <Checkbox
        checked={isSelected}
        className="mt-1"
        onCheckedChange={onToggle}
      />
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{item.code}</span>
              <Badge variant="outline">
                {reviewCategoryNames[item.category]}
              </Badge>
              {item.priority === 'high' && (
                <Badge variant="destructive">高优先级</Badge>
              )}
            </div>
            <p className="font-medium">{item.name}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {item.description}
        </p>

        {item.autoReviewResult && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">AI 审核意见：</p>
            <p className="text-muted-foreground">
              {item.autoReviewResult.comment}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              置信度：{Math.round(item.autoReviewResult.confidence * 100)}%
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

