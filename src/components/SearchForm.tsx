'use client'

import { useState } from 'react'

import dynamic from 'next/dynamic'

import { AnswerPanelSkeleton } from '~/components/answer/AnswerPanelSkeleton'
import { AnswerTrigger } from '~/components/answer/AnswerTrigger'
import { SearchDialog } from '~/components/search/SearchDialog'
import { SearchTrigger } from '~/components/search/SearchTrigger'
import {
  SidebarGroup,
  SidebarGroupContent,
} from '~/components/ui/sidebar'
import { useLazyComponent } from '~/hooks/useLazyComponent'

// 创建预加载函数
const preloadAnswerPanel = () => import('~/components/answer/AnswerPanel')

// 使用 Next.js dynamic 懒加载 AnswerPanel
const AnswerPanel = dynamic(
  () => preloadAnswerPanel().then((mod) => ({ default: mod.AnswerPanel })),
  {
    loading: () => <AnswerPanelSkeleton />,
    ssr: false, // 禁用服务端渲染，因为这是一个交互式组件
  },
)

export function SearchForm() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [answerOpen, setAnswerOpen] = useState(false)

  // 使用懒加载 Hook
  const { preload: handlePreloadAnswerPanel } = useLazyComponent(preloadAnswerPanel, {
    preloadDelay: 100, // 100ms 延迟，避免意外触发
  })

  return (
    <div>
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <div className="space-y-1.5">
            <SearchTrigger
              onTriggerOpen={() => {
                setSearchOpen(true)
              }}
            />

            <AnswerTrigger
              onMouseEnter={() => {
                handlePreloadAnswerPanel()
              }}
              onTriggerOpen={() => {
                setAnswerOpen(true)
              }}
            />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />

      {/* AI 问答面板 */}
      {answerOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg z-50">
          <AnswerPanel
            isVisible={answerOpen}
            onClose={() => { setAnswerOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}
