'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { bugReportsControllerCreateMutation } from '~/lib/api/generated/@tanstack/react-query.gen'
import type { CreateBugReportDto } from '~/lib/api/generated/types.gen'

import { BugReportForm, type BugReportFormValues } from './BugReportForm'

export function BugReportFormEdit() {
  const createBugReportMutation = useMutation({
    ...bugReportsControllerCreateMutation(),
    onSuccess: () => {
      toast.success('漏洞报告提交成功！')
    },
  })

  /**
   * 处理表单提交
   * 将表单数据转换为 API 所需的格式并提交
   */
  const handleSubmit = async (values: BugReportFormValues) => {
    const createData: CreateBugReportDto = {
      title: values.title,
      severity: values.severity.toUpperCase() as CreateBugReportDto['severity'],
      attackMethod: values.attackType,
      description: values.description,
      discoveredUrls: values.urls.filter((url: string) => url.length > 0),
      // 暂时不处理附件，后续可以扩展
      attachmentIds: [],
    }

    await createBugReportMutation.mutateAsync({
      body: createData,
    })
  }

  return (
    <div>
      <BugReportForm
        submitText={createBugReportMutation.isPending ? '提交中...' : '提交'}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
