'use client'

import { useMemo, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import dynamic from 'next/dynamic'
import { MessageSquarePlusIcon, PanelLeftIcon, XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { useChatSessions } from '~/hooks/useChatSessions'
import type { ChatSession } from '~/types/chat'

import { AnswerPanel } from './AnswerPanel'
import { ChatHistoryPanelSkeleton } from './ChatHistoryPanelSkeleton'

// 懒加载 ChatHistoryPanel
const ChatHistoryPanel = dynamic(() => import('./ChatHistoryPanel').then((module) => ({ default: module.ChatHistoryPanel })), {
  loading: () => <ChatHistoryPanelSkeleton />,
  ssr: false,
})

interface AnswerPanelWithHistoryProps {
  isVisible?: boolean
  onClose?: () => void
}

export function AnswerPanelWithHistory(props: AnswerPanelWithHistoryProps) {
  const { isVisible = true, onClose } = props

  const [showHistory, setShowHistory] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const { getSession } = useChatSessions()

  const sessionTitle = useMemo(() => {
    if (currentSessionId) {
      return getSession(currentSessionId)?.title
    }
  }, [currentSessionId, getSession])

  const handleSessionSelect = useEvent((session: ChatSession) => {
    setCurrentSessionId(session.id)
    setShowHistory(false) // 选择会话后关闭历史面板
  })

  const handleNewChat = useEvent(() => {
    setCurrentSessionId(null)
    setShowHistory(false)
  })

  const handleSessionChange = useEvent((newSessionId: string) => {
    setCurrentSessionId(newSessionId)
  })

  const handleToggleHistory = useEvent(() => {
    setShowHistory(!showHistory)
  })

  if (!isVisible) {
    return null
  }

  return (
    <div className="size-full relative">
      {/* 聊天历史面板 */}
      {showHistory && (
        <div className="absolute inset-0 overflow-auto bg-background z-10">
          <ChatHistoryPanel
            currentSessionId={currentSessionId}
            isVisible={showHistory}
            onClose={() => { setShowHistory(false) }}
            onSessionSelect={handleSessionSelect}
          />
        </div>
      )}

      {/* 主答案面板 */}
      <div className="size-full flex flex-col">
        {/* 增强的头部 */}
        <div className="flex items-center justify-between p-panel pr-panel-sm border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">AI 助手</span>

            {sessionTitle && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {sessionTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-7"
                  size="icon"
                  variant="ghost"
                  onClick={handleToggleHistory}
                >
                  <PanelLeftIcon className="size-[1em]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showHistory
                  ? '隐藏历史'
                  : '显示历史'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-7"
                  size="icon"
                  variant="ghost"
                  onClick={handleNewChat}
                >
                  <MessageSquarePlusIcon className="size-[1em]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                新建对话
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="size-7"
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                >
                  <XIcon className="size-[1em]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                关闭
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 答案面板内容 */}
        <div className="flex-1 overflow-hidden">
          <AnswerPanel
            sessionId={currentSessionId}
            onSessionChange={handleSessionChange}
          />
        </div>
      </div>
    </div>
  )
}
