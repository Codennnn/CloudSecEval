import type { BundledLanguage } from 'shiki'

import { CodeWrapper } from '~/components/code/CodeWrapper'
import { CopyButton } from '~/components/code/CopyButton'
import { LanguageIcon } from '~/components/LanguageIcon'

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
  } = props

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
              {filename && <span>{filename}</span>}
            </div>

            {/* 微妙的加载指示器 */}
            {isLoading && (
              <div className="size-2 bg-current/60 rounded-full animate-pulse" />
            )}

            {/* 自定义头部内容 */}
            {headerContent}
          </div>

          <div className="ml-auto">
            {showCopyButton && <CopyButton text={code} />}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      {children}
    </CodeWrapper>
  )
}
