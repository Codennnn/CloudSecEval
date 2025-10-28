'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

import { assessmentTypeNames } from '../lib/mock-data'
import { AssessmentType } from '../types/assessment'

interface CreateProjectDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 创建成功回调 */
  onSuccess?: () => void
}

/**
 * 创建评估项目对话框
 */
export function CreateProjectDialog(props: CreateProjectDialogProps) {
  const { open, onClose, onSuccess } = props
  const router = useRouter()

  const [name, setName] = useState('')
  const [type, setType] = useState<AssessmentType>(AssessmentType.DengBao)
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  /**
   * 处理创建项目
   */
  const handleCreate = async () => {
    if (!name.trim()) {
      return
    }

    setIsCreating(true)

    // 模拟创建延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 生成新项目ID
    const newProjectId = `project-${Date.now()}`

    setIsCreating(false)

    // 重置表单
    setName('')
    setType(AssessmentType.DengBao)
    setDescription('')

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
      setName('')
      setType(AssessmentType.DengBao)
      setDescription('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新建评估项目</DialogTitle>
          <DialogDescription>
            填写项目基本信息，创建新的合规评估项目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 项目名称 */}
          <div className="space-y-2">
            <Label htmlFor="project-name">项目名称 *</Label>
            <Input
              id="project-name"
              placeholder="例如：2024年度等保三级评估"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* 评估类型 */}
          <div className="space-y-2">
            <Label htmlFor="assessment-type">评估类型 *</Label>
            <Select
              value={type}
              onValueChange={value => setType(value as AssessmentType)}
            >
              <SelectTrigger id="assessment-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(assessmentTypeNames).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 项目描述 */}
          <div className="space-y-2">
            <Label htmlFor="project-description">项目描述</Label>
            <Textarea
              id="project-description"
              placeholder="简要描述评估项目的目的和范围..."
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
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
            disabled={!name.trim() || isCreating}
            onClick={handleCreate}
          >
            {isCreating ? '创建中...' : '创建项目'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

