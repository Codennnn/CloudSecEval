'use client'

import { useMemo } from 'react'
import { type FieldValues, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

import type { BugSeverity } from '../bugs/types'

interface BugReportFormValues {
  id?: string
  title: string
  description: string
  severity: BugSeverity
  tags: string[]
}

export interface BugReportFormCardProps {
  /** 初始表单值（编辑态可传入 id 与各字段） */
  initialValues?: Partial<BugReportFormValues>
  /** 提交回调，返回结构化的表单数据 */
  onSubmit: (values: BugReportFormValues) => void | Promise<void>
  /** 取消回调，用于关闭外层弹层或重置状态 */
  onCancel: () => void
  /** 自定义提交按钮文案（默认根据是否有 id 显示“提交/保存”） */
  submitText?: string
}

// 表单字段模型（含 tagsText 便于输入）
const bugFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
  description: z.string().min(1, '描述不能为空'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  tagsText: z.string().default(''),
})

type BugFormInput = z.input<typeof bugFormSchema>
type BugFormOutput = z.output<typeof bugFormSchema>

export function BugReportForm(props: BugReportFormCardProps) {
  const { initialValues, onSubmit, onCancel, submitText } = props

  const defaultValues: BugFormInput = useMemo(() => {
    const severity = (initialValues?.severity ?? 'medium') as BugFormInput['severity']
    const tagsText = Array.isArray(initialValues?.tags)
      ? initialValues.tags.join(', ')
      : ''

    return {
      id: initialValues?.id,
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      severity,
      tagsText,
    }
  }, [initialValues])

  const form = useForm<BugFormInput, FieldValues, BugFormOutput>({
    resolver: zodResolver(bugFormSchema),
    defaultValues,
  })

  const submitBtnText = submitText ?? (defaultValues.id ? '保存' : '提交')

  function handleSubmit(values: BugFormOutput) {
    const tags = values.tagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const result: BugReportFormValues = {
      id: values.id,
      title: values.title.trim(),
      description: values.description.trim(),
      severity: values.severity as BugSeverity,
      tags,
    }

    return onSubmit(result)
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>问题描述 / 复现步骤 / 影响</FormLabel>
              <FormControl>
                <Textarea id="description" rows={8} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagsText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标签（逗号分隔）</FormLabel>
              <FormControl>
                <Input id="tags" placeholder="auth, api" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onCancel()
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
