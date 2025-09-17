'use client'

import { useMemo } from 'react'

import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { BugReportForm, type BugReportFormValues } from './BugReportForm'

import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'
import {
  bugReportsControllerCreateMutation,
  bugReportsControllerFindByIdOptions,
  bugReportsControllerSaveDraftMutation,
  bugReportsControllerSubmitDraftMutation,
  bugReportsControllerUpdateDraftMutation,
} from '~api/@tanstack/react-query.gen'
import type { CreateBugReportDto, SaveDraftDto, SubmitDraftDto } from '~api/types.gen'
import { BugReportRoleView, BugReportStatus, NEW_BUG_ID, type VulnerabilitySeverity } from '~crowd-test/constants'

export interface BugReportFormEditProps {
  readonly?: boolean
  roleView?: BugReportRoleView
}

export function BugReportFormEdit(props: BugReportFormEditProps) {
  const { readonly, roleView = BugReportRoleView.USER } = props

  const router = useRouter()

  const { bugReportId } = useParams<{ bugReportId: string }>()
  const isNew = bugReportId === NEW_BUG_ID

  const { data } = useQuery({
    ...bugReportsControllerFindByIdOptions({
      path: { id: bugReportId },
    }),
    enabled: typeof bugReportId === 'string' && !isNew,
  })
  const bugReportData = data?.data

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

  return (
    <div>
      <BugReportForm
        initialValues={initialValues}
        isDraft={isDraft || isNew}
        readonly={readonly}
        saveDraftText={saveDraftMutation.isPending || updateDraftMutation.isPending ? '保存中...' : '保存草稿'}
        showSaveDraft={!readonly}
        submitText={submitDraftMutation.isPending ? '处理中...' : (isDraft ? '提交报告' : '确认提交')}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
