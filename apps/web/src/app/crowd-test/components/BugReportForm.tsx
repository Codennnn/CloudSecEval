'use client'

import { useEffect, useMemo } from 'react'
import { type FieldValues, useFieldArray, useForm } from 'react-hook-form'
import { useEvent } from 'react-use-event-hook'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { z } from 'zod'

import { RichTextEditor } from '~/components/richtext/RichTextEditor'
import { SafeHtmlRenderer } from '~/components/richtext/SafeHtmlRenderer'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { FileUploader } from '~/components/upload/FileUploader'
import { cn } from '~/lib/utils'

import { type CreateBugReportDto } from '~api/types.gen'
import { getVulSeverity, VulnerabilitySeverity } from '~crowd-test/constants'

export type BugReportFormValues = CreateBugReportDto

// 正式提交的表单验证（严格）
const bugFormSchema = z.object({
  title: z.string().min(1, '报告标题不能为空'),
  description: z.string(),
  severity: z.enum(Object.values(VulnerabilitySeverity)),
  discoveredUrls: z.array(z.object({
    url: z.string().optional(),
  })),
  attachmentIds: z.array(z.string()).default([]),
})

// 草稿的表单验证（宽松）
const draftFormSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  severity: z.enum(Object.values(VulnerabilitySeverity)).default(VulnerabilitySeverity.MEDIUM),
  discoveredUrls: z.array(z.object({
    url: z.string().optional(),
  })).default([{ url: '' }]),
  attachmentIds: z.array(z.string()).default([]),
})

type BugFormInput = z.input<typeof draftFormSchema>
type BugFormOutput = z.output<typeof draftFormSchema>

export interface BugReportFormCardProps {
  /** 初始表单值（编辑态可传入 id 与各字段） */
  initialValues?: Partial<BugReportFormValues>
  /** 自定义提交按钮文案 */
  submitText?: string
  /** 自定义保存草稿按钮文案 */
  saveDraftText?: string
  /** 是否只读 */
  readonly?: boolean
  /** 是否显示保存草稿按钮 */
  showSaveDraft?: boolean
  /** 是否为草稿状态 */
  isDraft?: boolean

  /** 提交回调，返回结构化的表单数据 */
  onSubmit?: (values: BugReportFormValues) => void | Promise<void>
  /** 保存草稿回调 */
  onSaveDraft?: (values: BugReportFormValues) => void | Promise<void>
  /** 取消回调，用于关闭外层弹层或重置状态 */
  onCancel?: () => void
}

/**
 * BugReportForm
 * 受控表单组件：支持异步 initialValues 变化时基于 reset 同步展示。
 */
export function BugReportForm(props: BugReportFormCardProps) {
  const {
    initialValues,
    onSubmit,
    onSaveDraft,
    onCancel,
    submitText,
    saveDraftText,
    readonly,
    showSaveDraft = false,
    isDraft = false,
  } = props

  const defaultValues: BugFormInput = useMemo(() => {
    return {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      severity: (initialValues?.severity ?? VulnerabilitySeverity.MEDIUM) as VulnerabilitySeverity,
      discoveredUrls: initialValues?.discoveredUrls?.map((url) => ({ url })) ?? [{ url: '' }],
      attachmentIds: initialValues?.attachmentIds ?? [],
    }
  }, [initialValues])

  const form = useForm<BugFormInput, FieldValues, BugFormOutput>({
    resolver: zodResolver(isDraft ? draftFormSchema : bugFormSchema),
    defaultValues,
    shouldUnregister: false,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'discoveredUrls',
  })

  const submitBtnText = submitText ?? (isDraft ? '提交报告' : (initialValues as { id?: string } | undefined)?.id ? '保存' : '提交')
  const draftBtnText = saveDraftText ?? '保存草稿'

  // 当 initialValues 发生变化（异步加载详情）时，重置表单以反映最新数据
  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const handleSubmit = useEvent((values: BugFormOutput) => {
    const result: BugReportFormValues = {
      title: values.title.trim(),
      description: values.description.trim(),
      severity: values.severity,
      discoveredUrls: values.discoveredUrls.map((item) => item.url?.trim() ?? '').filter((url) => url.length > 0),
      attachmentIds: values.attachmentIds,
    }

    return onSubmit?.(result)
  })

  const handleSaveDraft = useEvent((values: BugFormOutput) => {
    const result: BugReportFormValues = {
      title: values.title.trim(),
      description: values.description.trim(),
      severity: values.severity,
      discoveredUrls: values.discoveredUrls.map((item) => item.url?.trim() ?? '').filter((url) => url.length > 0),
      attachmentIds: values.attachmentIds,
    }

    return onSaveDraft?.(result)
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
                  ? <div className="text-sm break-words">{field.value ?? '-'}</div>
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
          render={({ field }) => {
            const severity = getVulSeverity(field.value)

            return (
              <FormItem>
                <FormLabel>漏洞等级</FormLabel>

                {
                  readonly
                    ? (
                        <div
                          className={cn(
                            'text-sm font-semibold',
                            severity.frontColor,
                          )}
                        >
                          {severity.label}
                        </div>
                      )
                    : (
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={cn(
                                'font-semibold',
                                field.value
                                  ? severity.frontColor
                                  : '',
                              )}
                              id="severity"
                            >
                              <SelectValue placeholder="选择漏洞等级" />
                            </SelectTrigger>

                            <SelectContent>
                              {Object.values(VulnerabilitySeverity).map((s) => {
                                const sev = getVulSeverity(s)

                                return (
                                  <SelectItem
                                    key={s}
                                    className={cn(
                                      'font-semibold',
                                      sev.frontColor,
                                    )}
                                    value={s}
                                  >
                                    {sev.label}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      )
                }

                {!readonly && <FormMessage />}
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>问题描述 / 复现步骤 / 影响</FormLabel>
              {readonly
                ? (
                    <div className="prose max-w-none bg-muted/70 rounded-lg overflow-hidden p-4">
                      <SafeHtmlRenderer html={field.value ?? ''} />
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
                onChange={field.onChange}
              />
              {!readonly && <FormMessage />}
            </FormItem>
          )}
        />

        {!readonly && (
          <div>
            <Separator />

            <div className="flex items-center gap-2 py-4">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => {
                  onCancel?.()
                }}
              >
                取消
              </Button>

              <div className="flex items-center gap-2 ml-auto">
                {showSaveDraft && onSaveDraft && (
                  <Button
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      void form.handleSubmit(handleSaveDraft)()
                    }}
                  >
                    {draftBtnText}
                  </Button>
                )}

                <Button
                  size="sm"
                  type="submit"
                  variant="default"
                >
                  {submitBtnText}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}
