'use client'

import { useState } from 'react'

import { FileUpIcon, FolderOpenIcon, PlusIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

import { CreateProjectDialog } from './CreateProjectDialog'
import { ImportProjectDialog } from './ImportProjectDialog'
import { SelectTemplateDialog } from './SelectTemplateDialog'

interface QuickActionsProps {
  /** 创建项目成功的回调 */
  onProjectCreated?: () => void
}

/**
 * 快速启动区组件
 * 提供新建评估、从模板创建、导入项目三个快捷操作
 */
export function QuickActions(props: QuickActionsProps) {
  const { onProjectCreated } = props

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  /**
   * 处理创建项目成功
   */
  const handleProjectCreated = () => {
    setCreateDialogOpen(false)
    setTemplateDialogOpen(false)
    setImportDialogOpen(false)
    onProjectCreated?.()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>快速启动</CardTitle>
          <CardDescription>
            选择一种方式开始新的合规评估项目
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {/* 新建评估项目 */}
            <Button
              className="h-auto flex-col gap-2 py-4"
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(true)
              }}
            >
              <PlusIcon className="size-5" />
              <div className="space-y-1 text-center">
                <div className="font-semibold">新建评估项目</div>
                <div className="text-xs text-muted-foreground">
                  从零开始创建
                </div>
              </div>
            </Button>

            {/* 从模板创建 */}
            <Button
              className="h-auto flex-col gap-2 py-4"
              variant="outline"
              onClick={() => {
                setTemplateDialogOpen(true)
              }}
            >
              <FolderOpenIcon className="size-5" />
              <div className="space-y-1 text-center">
                <div className="font-semibold">从模板创建</div>
                <div className="text-xs text-muted-foreground">
                  使用预设模板
                </div>
              </div>
            </Button>

            {/* 导入历史项目 */}
            <Button
              className="h-auto flex-col gap-2 py-4"
              variant="outline"
              onClick={() => {
                setImportDialogOpen(true)
              }}
            >
              <FileUpIcon className="size-5" />
              <div className="space-y-1 text-center">
                <div className="font-semibold">导入历史项目</div>
                <div className="text-xs text-muted-foreground">
                  导入已有数据
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 创建项目对话框 */}
      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false)
        }}
        onSuccess={handleProjectCreated}
      />

      {/* 选择模板对话框 */}
      <SelectTemplateDialog
        open={templateDialogOpen}
        onClose={() => {
          setTemplateDialogOpen(false)
        }}
        onSuccess={handleProjectCreated}
      />

      {/* 导入项目对话框 */}
      <ImportProjectDialog
        open={importDialogOpen}
        onClose={() => {
          setImportDialogOpen(false)
        }}
        onSuccess={handleProjectCreated}
      />
    </>
  )
}

