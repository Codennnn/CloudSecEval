'use client'

import { useEffect, useMemo } from 'react'
import { type FieldValues, useFieldArray, useForm } from 'react-hook-form'
import { useEvent } from 'react-use-event-hook'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { z } from 'zod'

import { FileUploader } from '~/components/FileUploader'
import { RichTextEditor } from '~/components/richtext/RichTextEditor'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { type CreateBugReportDto, VulnerabilitySeverity } from '~api/types.gen'
import { getVulSeverity } from '~crowd-test/constants'

type BugAttackType = 'web' | 'mobile' | 'other'

export interface BugReportFormValues extends CreateBugReportDto {
  /** 编辑态可带上后端返回的ID，仅用于UI逻辑 */
  id?: string
  attackType: BugAttackType
}

const bugFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, '报告标题不能为空'),
  attackType: z.enum(['web', 'mobile', 'other']),
  description: z.string(),
  severity: z.enum(Object.values(VulnerabilitySeverity)),
  discoveredUrls: z.array(z.object({
    url: z.string().optional(),
  })),
  attachmentIds: z.array(z.string()).default([]),
})

type BugFormInput = z.input<typeof bugFormSchema>
type BugFormOutput = z.output<typeof bugFormSchema>

export interface BugReportFormCardProps {
  /** 初始表单值（编辑态可传入 id 与各字段） */
  initialValues?: Partial<BugReportFormValues>
  /** 自定义提交按钮文案 */
  submitText?: string
  /** 是否只读 */
  readonly?: boolean

  /** 提交回调，返回结构化的表单数据 */
  onSubmit?: (values: BugReportFormValues) => void | Promise<void>
  /** 取消回调，用于关闭外层弹层或重置状态 */
  onCancel?: () => void
}

/**
 * BugReportForm
 * 受控表单组件：支持异步 initialValues 变化时基于 reset 同步展示。
 */
export function BugReportForm(props: BugReportFormCardProps) {
  const { initialValues, onSubmit, onCancel, submitText, readonly } = props

  const attackTypeTextMap: Record<string, string> = {
    web: 'Web',
    mobile: '移动端',
    other: '其他',
  }

  const defaultValues: BugFormInput = useMemo(() => {
    const candidateAttackType = initialValues?.attackType as string | undefined
    const normalizedAttackType: BugFormInput['attackType'] = (candidateAttackType === 'web' || candidateAttackType === 'mobile' || candidateAttackType === 'other')
      ? candidateAttackType
      : 'web'

    return {
      id: initialValues?.id,
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      severity: initialValues?.severity ?? VulnerabilitySeverity.MEDIUM,
      attackType: normalizedAttackType,
      discoveredUrls: initialValues?.discoveredUrls?.map((url) => ({ url })) ?? [{ url: '' }],
      attachmentIds: initialValues?.attachmentIds ?? [],
    }
  }, [initialValues])

  const form = useForm<BugFormInput, FieldValues, BugFormOutput>({
    resolver: zodResolver(bugFormSchema),
    defaultValues,
    shouldUnregister: false,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'discoveredUrls',
  })

  const submitBtnText = submitText ?? ((initialValues as { id?: string } | undefined)?.id ? '保存' : '提交')

  // 当 initialValues 发生变化（异步加载详情）时，重置表单以反映最新数据
  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const handleSubmit = useEvent((values: BugFormOutput) => {
    const result: BugReportFormValues = {
      title: values.title.trim(),
      description: values.description.trim(),
      severity: values.severity,
      attackType: values.attackType as BugAttackType,
      discoveredUrls: values.discoveredUrls.map((item) => item.url?.trim() ?? '').filter((url) => url.length > 0),
      attachmentIds: values.attachmentIds ?? [],
    }

    return onSubmit?.(result)
  })

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-form-item"
        onSubmit={(ev) => {
          ev.preventDefault()

          if (!readonly) {
            void form.handleSubmit(handleSubmit)(ev)
          }
        }}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>报告标题</FormLabel>

              {
                readonly
                  ? <div className="text-sm break-words">{field.value || '-'}</div>
                  : (
                      <FormControl>
                        <Input id="title" {...field} />
                      </FormControl>
                    )
              }

              {!readonly && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>漏洞等级</FormLabel>

              {
                readonly
                  ? (
                      <div className="text-sm">
                        {getVulSeverity(field.value).label}
                      </div>
                    )
                  : (
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="severity">
                            <SelectValue placeholder="选择漏洞等级" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(VulnerabilitySeverity).map((s) => (
                              <SelectItem key={s} value={s}>{getVulSeverity(s).label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    )
              }

              {!readonly && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attackType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>攻击方式</FormLabel>
              {readonly
                ? (
                    <div className="text-sm">{attackTypeTextMap[field.value] ?? field.value}</div>
                  )
                : (
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-40" id="attackType">
                          <SelectValue placeholder="选择攻击方式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web">Web</SelectItem>
                          <SelectItem value="mobile">移动端</SelectItem>
                          <SelectItem value="other">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  )}
              {!readonly && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>问题描述 / 复现步骤 / 影响</FormLabel>
              {readonly
                ? (
                    <div className="prose max-w-none break-words">
                      {field.value || '-'}
                    </div>
                  )
                : (
                    <FormControl>
                      <RichTextEditor
                        placeholder="请详细描述问题、复现步骤与影响范围"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
              {!readonly && <FormMessage />}
            </FormItem>
          )}
        />

        {/* 漏洞 URL 字段 */}
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>漏洞 URL</FormLabel>
            {!readonly && (
              <Button
                size="xs"
                type="button"
                variant="outline"
                onClick={() => {
                  append({ url: '' })
                }}
              >
                <Plus />
                添加 URL
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {
              readonly
                ? fields.length > 0
                  ? (
                      <ul>
                        {fields.map((field) => {
                          return (
                            <li key={field.id}>
                              <div className="text-sm truncate">
                                {field.url}
                              </div>
                              <div className="text-sm truncate">
                                {field.url}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )
                  : '-'
                : fields.map((field, index) => {
                    return (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`discoveredUrls.${index}.url`}
                        render={({ field: urlField }) => (
                          <FormItem>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  {...urlField}
                                  className="flex-1"
                                  placeholder="填写漏洞 URL"
                                  type="url"
                                />
                              </FormControl>

                              {fields.length > 1 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="size-9 p-0"
                                      size="sm"
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        remove(index)
                                      }}
                                    >
                                      <X />
                                    </Button>
                                  </TooltipTrigger>

                                  <TooltipContent>
                                    删除 URL
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  })
            }
          </div>
        </FormItem>

        {/* 附件上传 */}
        <FormField
          control={form.control}
          name="attachmentIds"
          render={({ field }) => (
            <FormItem>
              <FileUploader
                multiple
                accept={undefined}
                readonly={readonly}
                value={field.value ?? []}
                onChange={field.onChange}
              />
              {!readonly && <FormMessage />}
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          {!readonly && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onCancel?.()
                }}
              >
                取消
              </Button>

              <Button
                type="submit"
                variant="default"
              >
                {submitBtnText}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
