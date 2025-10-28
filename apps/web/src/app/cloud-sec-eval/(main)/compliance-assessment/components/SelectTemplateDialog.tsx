'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { CheckIcon, StarIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'

import { assessmentTemplates, assessmentTypeNames } from '../lib/mock-data'
import type { AssessmentTemplate } from '../types/assessment'

interface SelectTemplateDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 创建成功回调 */
  onSuccess?: () => void
}

/**
 * 选择模板对话框
 */
export function SelectTemplateDialog(props: SelectTemplateDialogProps) {
  const { open, onClose, onSuccess } = props
  const router = useRouter()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    assessmentTemplates[0].id,
  )
  const [projectName, setProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  /**
   * 处理创建项目
   */
  const handleCreate = async () => {
    if (!projectName.trim() || !selectedTemplateId) {
      return
    }

    setIsCreating(true)

    // 模拟创建延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 生成新项目ID
    const newProjectId = `project-${Date.now()}`

    setIsCreating(false)

    // 重置表单
    setProjectName('')
    setSelectedTemplateId(assessmentTemplates[0].id)

    // 调用成功回调
    onSuccess?.()

    // 跳转到项目详情页
    router.push(`/cloud-sec-eval/compliance-assessment/${newProjectId}`)
  }

  /**
   * 处理关闭
   */
  const handleClose = () => {
    if (!isCreating) {
      setProjectName('')
      setSelectedTemplateId(assessmentTemplates[0].id)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>从模板创建项目</DialogTitle>
          <DialogDescription>
            选择一个预设模板快速创建评估项目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 项目名称 */}
          <div className="space-y-2">
            <Label htmlFor="template-project-name">项目名称 *</Label>
            <Input
              id="template-project-name"
              placeholder="例如：2024年度等保三级评估"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
            />
          </div>

          {/* 模板选择 */}
          <div className="space-y-2">
            <Label>选择模板 *</Label>
            <RadioGroup
              className="space-y-3"
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              {assessmentTemplates.map(template => (
                <TemplateOption
                  key={template.id}
                  template={template}
                />
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={isCreating}
            variant="outline"
            onClick={handleClose}
          >
            取消
          </Button>
          <Button
            disabled={!projectName.trim() || isCreating}
            onClick={handleCreate}
          >
            {isCreating ? '创建中...' : '创建项目'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface TemplateOptionProps {
  template: AssessmentTemplate
}

/**
 * 模板选项组件
 */
function TemplateOption(props: TemplateOptionProps) {
  const { template } = props

  return (
    <div className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent">
      <RadioGroupItem
        className="mt-1"
        id={template.id}
        value={template.id}
      />
      <Label
        className="flex-1 cursor-pointer space-y-1"
        htmlFor={template.id}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">{template.name}</span>
          {template.isRecommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <StarIcon className="size-3 fill-current" />
              推荐
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {template.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckIcon className="size-3" />
            {template.reviewItemCount} 项审核要求
          </span>
          <span>
            类型：{assessmentTypeNames[template.type]}
          </span>
        </div>
      </Label>
    </div>
  )
}

