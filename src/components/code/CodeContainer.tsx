import type { BundledLanguage } from 'shiki'

import { CopyButton } from '~/components/code/CopyButton'
import { LanguageIcon } from '~/components/LanguageIcon'

interface CodeContainerProps {
  /** 代码内容，用于复制功能 */
  code: string
  /** 编程语言，用于显示图标 */
  lang: BundledLanguage
  /** 文件名，可选 */
  filename?: string
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
    isLoading = false,
    children,
    className,
    showHeader = true,
    showCopyButton = true,
    showLanguageIcon = true,
    headerContent,
  } = props

  return (
    <div className={`not-prose not-first:mt-5 border border-border rounded-lg overflow-hidden max-w-full w-full group/code-block ${className || ''}`}>
      {/* 头部工具栏 */}
      {showHeader && (
        <div className="flex items-center gap-2 text-sm border-b border-border px-4 py-2 bg-muted">
          <div className="flex items-center gap-2">
            {showLanguageIcon && (
              <LanguageIcon
                className="size-5.5"
                lang={lang}
              />
            )}

            {filename && <span className="font-medium">{filename}</span>}

            {/* 微妙的加载指示器 */}
            {isLoading && (
              <div className="w-2 h-2 bg-current opacity-50 rounded-full animate-pulse" />
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
    </div>
  )
}
