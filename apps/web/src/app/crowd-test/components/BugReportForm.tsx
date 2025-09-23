'use client'

import { useEffect, useMemo } from 'react'
import { type FieldValues, useFieldArray, useForm } from 'react-hook-form'
import { useEvent } from 'react-use-event-hook'

import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { z } from 'zod'

import { EmptyContent } from '~/components/EmptyContent'
import { ProseContainer } from '~/components/ProseContainer'
import { RichTextEditor } from '~/components/richtext/RichTextEditor'
import { SafeHtmlRenderer } from '~/components/richtext/SafeHtmlRenderer'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { FileUploader } from '~/components/upload/FileUploader'
import { useAttachmentFiles } from '~/hooks/useAttachmentFiles'
import { useBatchFileUpload } from '~/hooks/useBatchFileUpload'
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

export function BugReportForm(props: BugReportFormCardProps) {
  const {
    initialValues,
    onSubmit,
    onSaveDraft,
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

  // 上传相关逻辑
  const { uploadFiles, isUploading: isUploadingFiles } = useBatchFileUpload()

  // 监听附件ID变化，获取对应的文件信息
  const attachmentIds = form.watch('attachmentIds') ?? []
  const { data: attachmentFiles = [] } = useAttachmentFiles(attachmentIds)

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

  // 处理文件选择和上传
  const handleFilesSelected = useEvent(async (selectedFiles: File[]) => {
    if (readonly) {
      return
    }

    try {
      const uploadedFiles = await uploadFiles(selectedFiles)

      // 获取当前已有的附件ID
      const currentAttachmentIds = form.getValues('attachmentIds') ?? []
      const newAttachmentIds = uploadedFiles.map((file) => file.id)

      // 合并新旧附件ID
      const allAttachmentIds = [...currentAttachmentIds, ...newAttachmentIds]

      // 更新表单数据
      form.setValue('attachmentIds', allAttachmentIds)
    }
    catch (error) {
      console.error('文件上传失败:', error)
      // 这里可以添加 toast 提示，或者通过 props 传入错误处理函数
    }
  })

  // 处理文件删除
  const handleFileRemove = useEvent((file: { id: string }) => {
    if (readonly) {
      return Promise.resolve()
    }

    const currentAttachmentIds = form.getValues('attachmentIds') ?? []
    const updatedIds = currentAttachmentIds.filter((id) => id !== file.id)
    form.setValue('attachmentIds', updatedIds)

    return Promise.resolve()
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
        {/* MARK: 报告标题 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>报告标题</FormLabel>
              {!readonly && (
                <FormDescription>
                  一句话概括问题，便于搜索与筛选
                </FormDescription>
              )}

              {
                readonly
                  ? <div className="text-sm break-words">{field.value ?? <EmptyContent />}</div>
                  : (
                      <FormControl>
                        <Input id="title" placeholder="例如：登录页验证码可被绕过" {...field} />
                      </FormControl>
                    )
              }

              {!readonly && <FormMessage />}
            </FormItem>
          )}
        />

        {/* MARK: 漏洞等级 */}
        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => {
            const severity = getVulSeverity(field.value)

            return (
              <FormItem>
                <FormLabel>漏洞等级</FormLabel>
                {!readonly && (
                  <FormDescription>
                    请选择与你的评估一致的严重程度，后续仍可在审核中调整
                  </FormDescription>
                )}

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
                              <SelectValue placeholder="请选择严重等级" />
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

        {/* MARK: 问题描述与复现步骤 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>问题描述与复现步骤</FormLabel>
              {!readonly && (
                <FormDescription>
                  建议包含：环境信息、操作步骤、预期与实际结果、影响范围/业务风险
                </FormDescription>
              )}
              {readonly
                ? (
                    field.value
                      ? (
                          <ProseContainer className="bg-secondary rounded-lg p-2 w-full max-h-[800px] overflow-auto border border-border">
                            <SafeHtmlRenderer
                              html={field.value}
                            />
                          </ProseContainer>
                        )
                      : <EmptyContent />
                  )
                : (
                    <FormControl>
                      <RichTextEditor
                        placeholder="请按：环境→步骤→结果→影响 的结构详细填写，可粘贴代码与截图"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
              {!readonly && <FormMessage />}
            </FormItem>
          )}
        />

        {/* MARK: 复现链接 */}
        <FormItem>
          <FormLabel>复现链接</FormLabel>
          {!readonly && (
            <div className="flex items-center justify-between gap-2">
              <FormDescription>
                提供可复现问题的页面或接口地址；如有多个，请逐条添加
              </FormDescription>

              <Button
                size="xs"
                type="button"
                variant="outline"
                onClick={() => {
                  append({ url: '' })
                }}
              >
                <Plus />
                添加链接
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {
              readonly
                ? fields.length > 0
                  ? (
                      <ul>
                        {fields.map((field) => {
                          return (
                            <li key={field.id}>
                              <Link
                                className="text-sm truncate"
                                href={field.url ?? ''}
                                target="_blank"
                              >
                                {field.url ?? ''}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )
                  : <EmptyContent />
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
                                    删除链接
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

        {/* MARK: 附件上传 */}
        <FormField
          control={form.control}
          name="attachmentIds"
          render={() => (
            <FormItem>
              <FormLabel>附件</FormLabel>
              {!readonly && (
                <FormDescription>
                  上传截图、视频、POC 或日志等证据材料
                </FormDescription>
              )}
              <FileUploader
                multiple
                accept={undefined}
                loading={isUploadingFiles}
                readonly={readonly}
                value={attachmentFiles}
                onFileRemove={handleFileRemove}
                onFilesSelected={handleFilesSelected}
              />
              {!readonly && <FormMessage />}
            </FormItem>
          )}
        />

        {!readonly && (
          <div>
            <Separator />

            <div className="flex items-center gap-2 py-4">
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
