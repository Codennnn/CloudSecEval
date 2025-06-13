'use client'

import { InfoIcon, KeyboardIcon, MessageCircleIcon, SearchIcon } from 'lucide-react'

export function AnswerHelp() {
  return (
    <div className="p-4 space-y-4 text-sm">
      <div className="flex items-center gap-2 font-medium">
        <InfoIcon className="size-4" />
        如何使用 AI 问答助手
      </div>

      <div className="space-y-3 text-muted-foreground">
        <div className="flex items-start gap-3">
          <MessageCircleIcon className="size-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium text-foreground">智能问答</div>
            <div>直接询问关于 NestJS 的任何问题，AI 会基于官方文档为您提供准确答案</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <SearchIcon className="size-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium text-foreground">文档引用</div>
            <div>每个答案都会提供相关的文档来源，您可以点击查看原始文档</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <KeyboardIcon className="size-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium text-foreground">快捷键</div>
            <div>
              <div>
                •
                <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+K</kbd>
                {' '}
                打开搜索
              </div>
              <div>
                •
                <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+I</kbd>
                {' '}
                打开 AI 问答
              </div>
              <div>
                •
                <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Enter</kbd>
                {' '}
                发送问题
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-accent/50 rounded-lg">
        <div className="font-medium text-sm mb-1">💡 提示</div>
        <div className="text-xs text-muted-foreground">
          尽量使用具体的问题，比如"如何创建控制器"而不是"NestJS 怎么用"，这样能获得更准确的答案。
        </div>
      </div>
    </div>
  )
}
