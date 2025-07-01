'use client'

import { useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import type { BundledLanguage } from 'shiki'

import { CodeWrapper } from '~/components/code/CodeWrapper'
import { CopyButton } from '~/components/code/CopyButton'
import { LanguageIcon } from '~/components/LanguageIcon'
import { ScrollGradientContainer } from '~/components/ScrollGradientContainer'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

interface CodeContainerProps {
  /** 代码内容，用于复制功能 */
  code: string
  /** 编程语言，用于显示图标 */
  lang: BundledLanguage
  /** 文件名，可选 */
  filename?: string
  /** 标题，可选 */
  title?: string
  /** 是否显示加载状态 */
  isLoading?: boolean
  /** 容器内容 */
  children: React.ReactNode
  /** 额外的 CSS 类名 */
  className?: string
  /** 是否显示头部工具栏，默认为 true */
  showHeader?: boolean
  /** 是否显示复制按钮，默认为 true */
  showCopyButton?: boolean
  /** 是否显示语言图标，默认为 true */
  showLanguageIcon?: boolean
  /** 自定义头部内容 */
  headerContent?: React.ReactNode
  /** 行数超过此值启用折叠，默认 20 */
  collapseThreshold?: number
  /** 折叠状态下的最大高度类，默认 28rem */
  maxHeightClass?: string
}

export function CodeContainer(props: CodeContainerProps) {
  const {
    code,
    lang,
    filename,
    title,
    isLoading = false,
    children,
    className,
    showHeader = true,
    showCopyButton = true,
    showLanguageIcon = true,
    headerContent,
    collapseThreshold = 20,
    maxHeightClass = 'max-h-[24rem]',
  } = props

  // 折叠/展开相关逻辑
  const lineCount = code.split('\n').length
  const isCollapsible = lineCount > collapseThreshold
  const [isExpanded, setIsExpanded] = useState(false)
  const label = isExpanded ? '折叠代码' : '展开代码'

  return (
    <CodeWrapper className={className}>
      {/* 头部工具栏 */}
      {showHeader && (
        <div className="flex items-center gap-2 text-sm border-b border-border px-4 py-2 bg-muted">
          <div className="inline-flex items-center gap-2 flex-1">
            {showLanguageIcon && (
              <LanguageIcon
                className="size-5.5"
                lang={lang}
              />
            )}

            <div className="flex items-center gap-2 font-medium">
              {title && <span className="opacity-70">{title}</span>}
              {filename && <span className="font-mono">{filename}</span>}
            </div>

            {/* 微妙的加载指示器 */}
            {isLoading && (
              <div className="size-2 bg-current/60 rounded-full animate-pulse" />
            )}

            {/* 自定义头部内容 */}
            {headerContent}
          </div>

          <div className="ml-auto flex items-center gap-1">
            {showCopyButton && <CopyButton text={code} />}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex flex-col flex-1">
        {isCollapsible && !isExpanded
          ? (
              <div className="flex-1">
                <ScrollGradientContainer
                  enableFlex
                  rootClassName={cn(maxHeightClass)}
                >
                  {children}
                </ScrollGradientContainer>
              </div>
            )
          : children}

        {isCollapsible && (
          <Button
            className="h-7 rounded-none text-xs text-muted-foreground hover:bg-secondary/50 border-t border-dashed border-transparent hover:border-border"
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => {
              setIsExpanded((prev) => !prev)
            }}
          >
            {isExpanded
              ? <ChevronUpIcon className="size-3.5" />
              : <ChevronDownIcon className="size-3.5" />}
            {label}
          </Button>
        )}
      </div>
    </CodeWrapper>
  )
}
