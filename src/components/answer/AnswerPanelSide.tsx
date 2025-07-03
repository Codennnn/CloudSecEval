'use client'

import dynamic from 'next/dynamic'

import { AnswerPanelSkeleton } from '~/components/answer/AnswerPanelSkeleton'
import { useAnswerPanel } from '~/hooks/useAnswerPanel'

// 创建预加载函数
export const preloadAnswerPanel = () => import('~/components/answer/AnswerPanel')

// 使用 Next.js dynamic 懒加载 AnswerPanel
const AnswerPanel = dynamic(
  () => preloadAnswerPanel().then((mod) => ({ default: mod.AnswerPanel })),
  {
    loading: () => <AnswerPanelSkeleton />,
    ssr: false, // 禁用服务端渲染，因为这是一个交互式组件
  },
)

export function AnswerPanelSide() {
  const { isOpen, close } = useAnswerPanel()

  if (isOpen) {
    return (
      <div className="sticky top-0 h-full w-96 bg-background z-50 p-4 pl-2">
        <div className="border border-border shadow-lg h-full rounded-md">
          <AnswerPanel
            isVisible={isOpen}
            onClose={close}
          />
        </div>
      </div>
    )
  }

  return null
}
