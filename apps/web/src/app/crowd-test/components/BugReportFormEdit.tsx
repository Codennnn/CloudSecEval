'use client'

import { useMemo } from 'react'

import { useParams } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { BugReportApproval } from './BugReportApproval'
import { BugReportApprovalHistory } from './BugReportApprovalHistory'
import { BugReportForm, type BugReportFormValues } from './BugReportForm'
import { BugReportStatusIndicator } from './BugReportStatusIndicator'

import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'
import { useUser } from '~admin/stores/useUserStore'
import {
  bugReportsControllerCreateMutation,
  bugReportsControllerFindByIdOptions,
  bugReportsControllerResubmitMutation,
  bugReportsControllerSaveDraftMutation,
  bugReportsControllerSubmitDraftMutation,
  bugReportsControllerUpdateDraftMutation,
} from '~api/@tanstack/react-query.gen'
import type { CreateBugReportDto, ResubmitBugReportDto, SaveDraftDto, SubmitDraftDto } from '~api/types.gen'
import { BugReportRoleView, BugReportStatus, NEW_BUG_ID, type VulnerabilitySeverity } from '~crowd-test/constants'

export interface BugReportFormEditProps {
  readonly?: boolean
  roleView?: BugReportRoleView
}

export function BugReportFormEdit(props: BugReportFormEditProps) {
  const { roleView = BugReportRoleView.USER } = props

  const router = useRouter()
  const user = useUser()

  const { bugReportId } = useParams<{ bugReportId: string }>()
  const isNew = bugReportId === NEW_BUG_ID
  const isUser = roleView === BugReportRoleView.USER

  const queryOption = {
    path: { id: bugReportId },
  }

  const { data } = useQuery({
    ...bugReportsControllerFindByIdOptions(queryOption),
    enabled: typeof bugReportId === 'string' && !isNew,
  })

  const bugReportData = data?.data
  const isSameUser = bugReportData?.userId === user?.id
  const canReview = !isSameUser

  // 判断是否为草稿状态
  const isDraft = bugReportData?.status === BugReportStatus.DRAFT

  const hasDraft = isDraft && bugReportData.id

  const createBugReportMutation = useMutation({
    ...bugReportsControllerCreateMutation(),
    onSuccess: () => {
      toast.success('漏洞报告提交成功！')
    },
  })

  const saveDraftMutation = useMutation({
    ...bugReportsControllerSaveDraftMutation(),
    onSuccess: () => {
      toast.success('草稿保存成功！')
    },
  })

  const updateDraftMutation = useMutation({
    ...bugReportsControllerUpdateDraftMutation(),
    onSuccess: () => {
      toast.success('草稿更新成功！')
    },
  })

  const submitDraftMutation = useMutation({
    ...bugReportsControllerSubmitDraftMutation(),
    onSuccess: () => {
      toast.success('草稿提交成功！')
    },
  })

  const resubmitMutation = useMutation({
    ...bugReportsControllerResubmitMutation(),
    onSuccess: () => {
      toast.success('报告重新提交成功！')
    },
  })

  const handleSubmit = async (values: BugReportFormValues) => {
    // 如果是草稿状态，使用提交草稿API
    if (hasDraft) {
      const submitData: SubmitDraftDto = {
        ...values,
      }

      await submitDraftMutation.mutateAsync({
        path: { id: bugReportData.id },
        body: submitData,
      })
    }
    else {
      // 否则使用普通创建API
      const createData: CreateBugReportDto = {
        ...values,
      }

      await createBugReportMutation.mutateAsync({
        body: createData,
      })
    }

    if (roleView === BugReportRoleView.USER) {
      router.replace(getRoutePath(AdminRoutes.CrowdTestMyBugs))
    }
    else {
      router.replace(getRoutePath(AdminRoutes.CrowdTestBugs))
    }
  }

  const handleResubmit = async (values: BugReportFormValues, resubmitNote?: string) => {
    if (!bugReportData?.id) {
      return
    }

    const resubmitData: ResubmitBugReportDto = {
      ...values,
      resubmitNote,
    }

    await resubmitMutation.mutateAsync({
      path: { id: bugReportData.id },
      body: resubmitData,
    })

    if (roleView === BugReportRoleView.USER) {
      router.replace(getRoutePath(AdminRoutes.CrowdTestMyBugs))
    }
    else {
      router.replace(getRoutePath(AdminRoutes.CrowdTestBugs))
    }
  }

  const handleSaveDraft = async (values: BugReportFormValues) => {
    const draftData: SaveDraftDto = {
      ...values.title && { title: values.title },
      ...(values.description && { description: values.description }),
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ...(values.severity && { severity: values.severity }),
      ...(values.discoveredUrls && { discoveredUrls: values.discoveredUrls }),
      ...(values.attachmentIds && { attachmentIds: values.attachmentIds }),
    }

    if (hasDraft) {
      // 更新现有草稿
      await updateDraftMutation.mutateAsync({
        path: { id: bugReportData.id },
        body: draftData,
      })
    }
    else {
      // 创建新草稿
      await saveDraftMutation.mutateAsync({
        body: draftData,
      })
    }

    if (roleView === BugReportRoleView.USER) {
      router.replace(getRoutePath(AdminRoutes.CrowdTestMyBugs))
    }
    else {
      router.replace(getRoutePath(AdminRoutes.CrowdTestBugs))
    }
  }

  const initialValues = useMemo(() => {
    if (bugReportData) {
      return {
        ...bugReportData,
        severity: bugReportData.severity as VulnerabilitySeverity,
      }
    }

    return undefined
  }, [bugReportData])

  // 根据状态确定表单行为
  const getFormBehavior = () => {
    const status = bugReportData?.status

    // 如果是管理员视图且不是同一用户，则只读
    if (roleView === BugReportRoleView.ADMIN && !isSameUser) {
      return {
        readonly: true,
        showSaveDraft: false,
        submitText: '',
        isDraft: false,
        onSubmit: undefined,
        onSaveDraft: undefined,
      }
    }

    // 新建报告
    if (isNew) {
      return {
        readonly: false,
        showSaveDraft: true,
        submitText: createBugReportMutation.isPending ? '提交中...' : '提交报告',
        isDraft: true,
        onSubmit: handleSubmit,
        onSaveDraft: handleSaveDraft,
      }
    }

    // 根据状态决定行为
    switch (status) {
      case BugReportStatus.DRAFT: {
        return {
          readonly: false,
          showSaveDraft: true,
          submitText: submitDraftMutation.isPending ? '提交中...' : '提交报告',
          isDraft: true,
          onSubmit: handleSubmit,
          onSaveDraft: handleSaveDraft,
        }
      }

      case BugReportStatus.REJECTED: {
        return {
          readonly: false,
          showSaveDraft: false,
          submitText: resubmitMutation.isPending ? '重新提交中...' : '重新提交',
          isDraft: false,
          onSubmit: (values: BugReportFormValues) => handleResubmit(values, '根据审核意见进行了修改'),
          onSaveDraft: undefined,
        }
      }

      case BugReportStatus.PENDING:
      // fallthrough

      case BugReportStatus.IN_REVIEW:
      // fallthrough

      case BugReportStatus.APPROVED:
      // fallthrough

      case BugReportStatus.RESOLVED:
      // fallthrough

      case BugReportStatus.CLOSED:
      // fallthrough

      default: {
        return {
          readonly: true,
          showSaveDraft: false,
          submitText: '',
          isDraft: false,
          onSubmit: undefined,
          onSaveDraft: undefined,
        }
      }
    }
  }

  const formBehavior = getFormBehavior()

  return (
    <div className="flex gap-admin-content w-full">
      <div className="flex-1 min-w-0 overflow-auto p-admin-content pr-0">
        <BugReportForm
          initialValues={initialValues}
          isDraft={formBehavior.isDraft}
          readonly={formBehavior.readonly}
          saveDraftText={saveDraftMutation.isPending || updateDraftMutation.isPending ? '保存中...' : '保存草稿'}
          showSaveDraft={formBehavior.showSaveDraft}
          submitText={formBehavior.submitText}
          onSaveDraft={formBehavior.onSaveDraft}
          onSubmit={formBehavior.onSubmit}
        />
      </div>

      <div className="flex flex-col gap-admin-content shrink-0 xl:w-[420px] p-admin-content pl-0">
        {/* 状态显示 */}
        {bugReportData && !isNew && isUser && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">当前状态</h3>
            <BugReportStatusIndicator
              status={bugReportData.status as BugReportStatus}
            />
          </div>
        )}

        {bugReportData && (
          <BugReportApprovalHistory
            bugReportId={bugReportId}
          />
        )}

        {canReview && (
          <>
            {bugReportData && (
              <BugReportApproval
                bugReportId={bugReportId}
                currentStatus={bugReportData.status as BugReportStatus}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
