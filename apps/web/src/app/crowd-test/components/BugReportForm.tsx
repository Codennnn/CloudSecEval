'use client'

import { useMemo } from 'react'
import { type FieldValues, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getPlainTextFromHtml, QuillEditor } from '~/components/richtext/QuillEditor'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

import type { BugSeverity } from '../bugs/types'

type BugAttackType = 'web' | 'mobile' | 'other'

interface BugReportFormValues {
  id?: string
  title: string
  description: string
  severity: BugSeverity
  attackType: BugAttackType
}

const bugFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
  attackType: z.enum(['web', 'mobile', 'other']),
  // 将富文本转为纯文本校验空内容
  description: z
    .string()
    .refine((html) => getPlainTextFromHtml(html).trim().length > 0, '描述不能为空'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
})

type BugFormInput = z.input<typeof bugFormSchema>
type BugFormOutput = z.output<typeof bugFormSchema>

export interface BugReportFormCardProps {
  /** 初始表单值（编辑态可传入 id 与各字段） */
  initialValues?: Partial<BugReportFormValues>
  /** 提交回调，返回结构化的表单数据 */
  onSubmit?: (values: BugReportFormValues) => void | Promise<void>
  /** 取消回调，用于关闭外层弹层或重置状态 */
  onCancel?: () => void
  /** 自定义提交按钮文案（默认根据是否有 id 显示“提交/保存”） */
  submitText?: string
}

/**
 * BugReportForm
 * 漏洞上报表单（包含标题、级别、攻击方式、描述等）。
 * 本次编辑：在描述与提交按钮之间新增“附件上传”的静态 UI（仅展示，无交互）。
 */
export function BugReportForm(props: BugReportFormCardProps) {
  const { initialValues, onSubmit, onCancel, submitText } = props

  const defaultValues: BugFormInput = useMemo(() => {
    const severity = (initialValues?.severity ?? 'medium') as BugFormInput['severity']
    const attackType = (initialValues?.attackType ?? 'web') as BugFormInput['attackType']

    return {
      id: initialValues?.id,
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      severity,
      attackType,
    }
  }, [initialValues])

  const form = useForm<BugFormInput, FieldValues, BugFormOutput>({
    resolver: zodResolver(bugFormSchema),
    defaultValues,
  })

  const submitBtnText = submitText ?? (defaultValues.id ? '保存' : '提交')

  function handleSubmit(values: BugFormOutput) {
    const result: BugReportFormValues = {
      id: values.id,
      title: values.title.trim(),
      description: values.description.trim(),
      severity: values.severity as BugSeverity,
      attackType: values.attackType as BugAttackType,
    }

    return onSubmit?.(result)
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault()
          void form.handleSubmit(handleSubmit)(ev)
        }}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input id="title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>严重级别</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-40" id="severity">
                    <SelectValue placeholder="选择级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="critical">严重</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attackType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>攻击方式</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-40" id="attackType">
                    <SelectValue placeholder="选择攻击方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">Web</SelectItem>
                    <SelectItem value="high">Web</SelectItem>
                    <SelectItem value="high">移动端</SelectItem>
                    <SelectItem value="critical">其他</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>问题描述 / 复现步骤 / 影响</FormLabel>
              <FormControl>
                <QuillEditor id="description" placeholder="请详细描述问题、复现步骤与影响范围" value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 附件上传（仅 UI，无交互） */}
        <div className="space-y-2">
          <div className="text-sm font-medium leading-none">附件</div>
          <div className="rounded-md border border-dashed p-4">
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <p>将文件拖拽到此处，或点击下方按钮选择文件</p>
              <p className="text-xs">支持图片、视频、日志、PDF 等（仅展示 UI）</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary">添加附件</Button>
            </div>
            <div className="mt-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between rounded-md border p-2">
                  <span className="truncate">example-screenshot.png</span>
                  <span className="text-muted-foreground">1.2MB</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onCancel?.()
            }}
          >
            取消
          </Button>
          <Button type="submit">{submitBtnText}</Button>
        </div>
      </form>
    </Form>
  )
}
