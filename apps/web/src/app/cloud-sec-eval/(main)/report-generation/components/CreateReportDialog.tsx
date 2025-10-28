'use client'

import { useState } from 'react'

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

import { mockProjects, reportTypeConfig, type ReportType } from '../lib/mock-reports'

interface CreateReportDialogProps {
  /** 对话框是否打开 */
  open: boolean
  /** 对话框打开状态变化回调 */
  onOpenChange: (open: boolean) => void
  /** 提交回调 */
  onSubmit: (config: {
    title: string
    type: ReportType
    projectName: string
  }) => void
}

/**
 * 创建报告对话框
 * 用于配置新报告的基本信息
 */
export function CreateReportDialog(props: CreateReportDialogProps) {
  const { open, onOpenChange, onSubmit } = props

  const [type, setType] = useState<ReportType>('compliance')
  const [title, setTitle] = useState('')
  const [projectName, setProjectName] = useState('')

  /**
   * 处理提交
   */
  const handleSubmit = () => {
    if (!title || !projectName) {
      return
    }

    onSubmit({ title, type, projectName })

    // 重置表单
    setTitle('')
    setProjectName('')
    setType('compliance')
  }

  /**
   * 处理报告类型变化
   */
  const handleTypeChange = (newType: string) => {
    setType(newType as ReportType)

    // 根据类型自动填充标题建议
    const config = reportTypeConfig[newType as ReportType]
    if (!title) {
      setTitle(`${config.label} - ${new Date().toLocaleDateString('zh-CN')}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>生成新报告</DialogTitle>
          <DialogDescription>
            选择报告类型并配置基本信息，AI 将自动生成报告内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 报告类型选择 */}
          <div className="space-y-3">
            <Label>报告类型</Label>
            <div className="grid gap-3">
              {(Object.entries(reportTypeConfig) as [ReportType, typeof reportTypeConfig[ReportType]][]).map(
                ([key, config]) => {
                  const isSelected = type === key

                  return (
                    <button
                      key={key}
                      className={[
                        'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50',
                      ].join(' ')}
                      type="button"
                      onClick={() => {
                        handleTypeChange(key)
                      }}
                    >
                      <span className="text-2xl">{config.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{config.label}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {config.description}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          ✓
                        </div>
                      )}
                    </button>
                  )
                },
              )}
            </div>
          </div>

          {/* 报告标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">报告标题</Label>
            <Input
              id="title"
              placeholder="例如：某银行核心系统等保评估报告"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
              }}
            />
          </div>

          {/* 关联项目 */}
          <div className="space-y-2">
            <Label htmlFor="project">关联项目</Label>
            <Select value={projectName} onValueChange={setProjectName}>
              <SelectTrigger id="project">
                <SelectValue placeholder="选择已有项目" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map((project) => {
                  return (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              报告将基于所选项目的评估数据生成
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
            }}
          >
            取消
          </Button>
          <Button disabled={!title || !projectName} onClick={handleSubmit}>
            开始生成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

