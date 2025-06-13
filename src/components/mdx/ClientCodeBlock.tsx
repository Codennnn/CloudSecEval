'use client'

import { useEffect, useRef, useState } from 'react'

import { transformerNotationHighlight } from '@shikijs/transformers'
import { type BundledLanguage, type CodeToHastOptions, codeToHtml } from 'shiki'

import { CopyButton } from '~/components/code/CopyButton'
import { LanguageIcon } from '~/components/LanguageIcon'

// 简单的缓存机制
const highlightCache = new Map<string, string>()

interface ClientCodeBlockProps {
  code: string
  lang: BundledLanguage
  filename?: string
  showLineNumbers?: boolean
}

export function ClientCodeBlock(props: ClientCodeBlockProps) {
  const { code, lang, filename, showLineNumbers } = props

  const [htmlOutput, setHtmlOutput] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [showLoadingState, setShowLoadingState] = useState(false)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 生成缓存键
    const cacheKey = `${lang}-${showLineNumbers}-${code}`

    // 检查缓存
    const cachedResult = highlightCache.get(cacheKey)

    if (cachedResult) {
      setHtmlOutput(cachedResult)
      setIsLoading(false)
      setShowLoadingState(false)
    }
    else {
      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // 如果已经有内容，先保持显示旧内容，避免抖动
      const hasExistingContent = htmlOutput !== ''

      // 延迟显示加载状态，避免快速切换时的抖动
      const loadingTimer = setTimeout(() => {
        if (isLoading && !hasExistingContent) {
          setShowLoadingState(true)
        }
      }, 200) // 200ms 延迟

      // 防抖高亮处理
      debounceTimerRef.current = setTimeout(() => {
        void (async () => {
          try {
            setIsLoading(true)

            const transformers: CodeToHastOptions['transformers'] = [transformerNotationHighlight()]

            if (showLineNumbers) {
              transformers.push({ name: 'line-numbers' })
            }

            const out = await codeToHtml(code, {
              lang,
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
              transformers,
            })

            // 缓存结果
            highlightCache.set(cacheKey, out)

            // 限制缓存大小
            if (highlightCache.size > 100) {
              const firstKey = highlightCache.keys().next().value

              if (firstKey) {
                highlightCache.delete(firstKey)
              }
            }

            setHtmlOutput(out)
            setShowLoadingState(false)
          }
          catch (err) {
            console.warn('代码高亮失败:', err)

            // 如果高亮失败，使用纯文本
            setHtmlOutput(`
              <pre>
                <code>${code}</code>
              </pre>
            `)

            setShowLoadingState(false)
          }
          finally {
            setIsLoading(false)
          }
        })()
      }, 100) // 100ms 防抖

      return () => {
        clearTimeout(loadingTimer)

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
      }
    }
  }, [code, lang, showLineNumbers, htmlOutput, isLoading])

  // 只有在没有内容且需要显示加载状态时才显示加载界面
  if (showLoadingState && !htmlOutput) {
    return (
      <div className="not-prose not-first:mt-5 border border-border rounded-lg overflow-hidden max-w-full w-full">
        <div className="flex items-center gap-2 text-sm border-b border-border px-4 py-2 bg-muted">
          <div className="flex items-center gap-2">
            <LanguageIcon
              className="size-5.5"
              lang={lang}
            />
            {filename && <span className="font-medium">{filename}</span>}
          </div>
          <div className="ml-auto">
            <CopyButton text={code} />
          </div>
        </div>
        <div className="p-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            正在高亮代码...
          </div>
        </div>
      </div>
    )
  }

  // 如果没有内容，显示纯文本版本避免空白
  if (!htmlOutput) {
    return (
      <div className="not-prose not-first:mt-5 border border-border rounded-lg overflow-hidden max-w-full w-full group/code-block">
        <div className="flex items-center gap-2 text-sm border-b border-border px-4 py-2 bg-muted">
          <div className="flex items-center gap-2">
            <LanguageIcon
              className="size-5.5"
              lang={lang}
            />
            {filename && <span className="font-medium">{filename}</span>}
          </div>
          <div className="ml-auto">
            <CopyButton text={code} />
          </div>
        </div>
        <div className="p-4">
          <pre className="text-sm">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="not-prose not-first:mt-5 border border-border rounded-lg overflow-hidden max-w-full w-full group/code-block">
      <div
        dangerouslySetInnerHTML={{ __html: htmlOutput }}
      />
    </div>
  )
}
