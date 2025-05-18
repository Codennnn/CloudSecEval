'use client'

import { useEffect, useState } from 'react'

import { useTheme } from 'next-themes'
import { type CodeToHastOptions, codeToHtml } from 'shiki'

import { cn } from '~/lib/utils'

interface CodeBlockProps {
  code: string
  language: string
  filename?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme()

  const [html, setHtml] = useState<string>('')

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      const highlightCode = async () => {
        try {
          // Shiki options
          const options: CodeToHastOptions = {
            lang: language || 'text',
            theme: resolvedTheme === 'dark' ? 'github-dark' : 'rose-pine-dawn',
          }

          // 只有在需要行号时才添加transformers
          if (showLineNumbers) {
            options.transformers = [
              {
                name: 'line-numbers',
              },
            ]
          }

          const highlightedCode = await codeToHtml(code, options)
          setHtml(highlightedCode)
        }
        catch (error) {
          console.error('代码高亮失败:', error)
        }
        finally {
          setIsLoading(false)
        }
      }

      await highlightCode()
    })()
  }, [code, language, resolvedTheme, showLineNumbers])

  if (isLoading) {
    return (
      <pre className="relative overflow-auto rounded-lg bg-muted p-4">
        <code className="text-sm">{code}</code>
      </pre>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {filename && (
        <div className="absolute left-3 top-0 rounded-b-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          {filename}
        </div>
      )}
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="overflow-hidden rounded-lg not-prose"
      />
    </div>
  )
}
