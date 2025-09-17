'use client'

import { useMemo } from 'react'

import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { BugReportForm, type BugReportFormValues } from './BugReportForm'

import { AdminRoutes, getRoutePath } from '~admin/lib/admin-nav'
import { bugReportsControllerCreateMutation, bugReportsControllerFindByIdOptions } from '~api/@tanstack/react-query.gen'
import type { CreateBugReportDto, VulnerabilitySeverity } from '~api/types.gen'
import { BugReportRoleView, NEW_BUG_ID } from '~crowd-test/constants'

export interface BugReportFormEditProps {
  readonly?: boolean
  roleView?: BugReportRoleView
}

export function BugReportFormEdit(props: BugReportFormEditProps) {
  const { readonly, roleView = BugReportRoleView.USER } = props

  const router = useRouter()

  const { bugReportId } = useParams<{ bugReportId: string }>()

  const { data } = useQuery({
    ...bugReportsControllerFindByIdOptions({
      path: { id: bugReportId },
    }),
    enabled: typeof bugReportId === 'string' && bugReportId !== NEW_BUG_ID,
  })
  const bugReportData = data?.data

  const createBugReportMutation = useMutation({
    ...bugReportsControllerCreateMutation(),
    onSuccess: () => {
      toast.success('漏洞报告提交成功！')
    },
  })

  const handleSubmit = async (values: BugReportFormValues) => {
    const createData: CreateBugReportDto = {
      ...values,
      attackMethod: values.attackType,
    }

    await createBugReportMutation.mutateAsync({
      body: createData,
    })

    if (roleView === BugReportRoleView.USER) {
      router.replace(getRoutePath(AdminRoutes.CrowdTestMyBugs))
    }
    else {
      router.replace(getRoutePath(AdminRoutes.CrowdTestBugs))
    }
  }

  const initialValues = useMemo(() => {
    if (bugReportData) {
      const attackType = (bugReportData.attackMethod ?? 'web') as BugReportFormValues['attackType']

      return {
        ...bugReportData,
        severity: bugReportData.severity as VulnerabilitySeverity,
        attackType,
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
