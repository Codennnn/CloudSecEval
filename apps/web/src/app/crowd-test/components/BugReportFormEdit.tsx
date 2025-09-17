'use client'

import { useMemo } from 'react'

import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { BugReportForm, type BugReportFormValues } from './BugReportForm'

import { bugReportsControllerCreateMutation, bugReportsControllerFindByIdOptions } from '~api/@tanstack/react-query.gen'
import type { BugReportResponseDto, CreateBugReportDto, VulnerabilitySeverity } from '~api/types.gen'
import { NEW_BUG_ID } from '~crowd-test/constants'

export interface BugReportFormEditProps {
  readonly?: boolean
}

export function BugReportFormEdit(props: BugReportFormEditProps) {
  const { readonly } = props

  const { bugReportId } = useParams()

  const { data: bugReportData } = useQuery({
    ...bugReportsControllerFindByIdOptions({
      path: { id: bugReportId as string },
    }),
    enabled: typeof bugReportId === 'string' && bugReportId !== NEW_BUG_ID,
  })

  const createBugReportMutation = useMutation({
    ...bugReportsControllerCreateMutation(),
    onSuccess: () => {
      toast.success('漏洞报告提交成功！')
    },
  })

  const handleSubmit = async (values: BugReportFormValues) => {
    const createData: CreateBugReportDto = {
      title: values.title,
      severity: values.severity,
      attackMethod: values.attackType,
      description: values.description,
      discoveredUrls: values.discoveredUrls?.filter((url: string) => url.length > 0),
      // 暂时不处理附件，后续可以扩展
      attachmentIds: [],
    }

    await createBugReportMutation.mutateAsync({
      body: createData,
    })
  }

  const initialValues = useMemo(() => {
    if (bugReportData) {
      const data: BugReportResponseDto = bugReportData

      const severity = data.severity as VulnerabilitySeverity
      const attackType = (data.attackMethod ?? 'web') as BugReportFormValues['attackType']
      const discoveredUrls = data.discoveredUrls ?? []

      return {
        id: data.id,
        title: data.title,
        description: data.description ?? '',
        severity,
        attackType,
        discoveredUrls,
      }
    }

    return undefined
  }, [bugReportData])

  return (
    <div>
      <BugReportForm
        initialValues={initialValues}
        readonly={readonly}
        submitText={createBugReportMutation.isPending ? '提交中...' : '提交'}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
