'use client'

import { useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

import { bugReportsControllerProcessApprovalMutation } from '~api/@tanstack/react-query.gen'
import type { ProcessApprovalDto } from '~api/types.gen'
import { BugReportStatus } from '~crowd-test/constants'

export interface BugReportApprovalProps {
  bugReportId: string
  currentStatus: BugReportStatus
  onApprovalComplete?: () => void
}

const APPROVAL_ACTIONS = [
  { value: 'APPROVE', label: '审批通过', variant: 'default' as const },
  { value: 'REJECT', label: '审批驳回', variant: 'destructive' as const },
  {
    value: 'REQUEST_INFO',
    label: '要求补充信息',
    variant: 'secondary' as const,
  },
  { value: 'FORWARD', label: '转发审批', variant: 'outline' as const },
] as const

export function BugReportApproval({
  bugReportId,
  currentStatus,
  onApprovalComplete,
}: BugReportApprovalProps) {
  const [selectedAction, setSelectedAction] = useState<ProcessApprovalDto['action'] | ''>('')
  const [comment, setComment] = useState('')
  const [targetUserId, setTargetUserId] = useState('')

  const queryClient = useQueryClient()

  const processApprovalMutation = useMutation({
    ...bugReportsControllerProcessApprovalMutation(),
    onSuccess: () => {
      const actionLabels = {
        APPROVE: '审批通过',
        REJECT: '审批驳回',
        REQUEST_INFO: '已要求补充信息',
        FORWARD: '已转发审批',
      }
      toast.success(`${actionLabels[selectedAction as keyof typeof actionLabels]}成功！`)

      // 重新获取数据
      void queryClient.invalidateQueries({
        queryKey: ['bugReportsController', 'findById', { path: { id: bugReportId } }],
      })

      // 重置表单
      setSelectedAction('')
      setComment('')
      setTargetUserId('')

      onApprovalComplete?.()
    },
    onError: (error) => {
      toast.error(`操作失败: ${error.message || '未知错误'}`)
    },
  })

  // 检查是否可以审批
  const canApprove = [BugReportStatus.PENDING, BugReportStatus.IN_REVIEW].includes(currentStatus)

  if (!canApprove) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>审批操作</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            当前状态：{currentStatus}，不支持审批操作
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = () => {
    if (!selectedAction || !comment.trim()) {
      toast.error('请选择审批动作并填写审批意见')

      return
    }

    if (selectedAction === 'FORWARD' && !targetUserId.trim()) {
      toast.error('转发操作需要指定目标用户ID')

      return
    }

    const approvalData: ProcessApprovalDto = {
      action: selectedAction,
      comment: comment.trim(),
      ...(selectedAction === 'FORWARD' && { targetUserId: targetUserId.trim() }),
    }

    processApprovalMutation.mutate({
      path: { id: bugReportId },
      body: approvalData,
    })
  }

  const selectedActionConfig = APPROVAL_ACTIONS.find((action) => action.value === selectedAction)

  return (
    <Card>
      <CardHeader>
        <CardTitle>审批操作</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="approval-action">审批动作</Label>
          <Select
            value={selectedAction}
            onValueChange={(value: ProcessApprovalDto['action']) => {
              setSelectedAction(value)
            }}
          >
            <SelectTrigger id="approval-action">
              <SelectValue placeholder="选择审批动作" />
            </SelectTrigger>
            <SelectContent>
              {APPROVAL_ACTIONS.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAction === 'FORWARD' && (
          <div className="space-y-2">
            <Label htmlFor="target-user">目标用户ID</Label>
            <Input
              id="target-user"
              placeholder="请输入要转发的用户ID"
              value={targetUserId}
              onChange={(e) => {
                setTargetUserId(e.target.value)
              }}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="approval-comment">审批意见</Label>
          <Textarea
            id="approval-comment"
            placeholder="请输入审批意见..."
            rows={4}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value)
            }}
          />
        </div>

        <Button
          className="w-full"
          disabled={!selectedAction || !comment.trim() || processApprovalMutation.isPending}
          variant={selectedActionConfig?.variant ?? 'default'}
          onClick={handleSubmit}
        >
          {processApprovalMutation.isPending
            ? '处理中...'
            : selectedActionConfig?.label ?? '提交审批'}
        </Button>
      </CardContent>
    </Card>
  )
}
