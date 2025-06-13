'use client'

import { useEffect, useMemo, useState } from 'react'
import * as runtime from 'react/jsx-runtime'

import { compile, type CompileOptions, run, type RunOptions } from '@mdx-js/mdx'
import rehypeMdxCodeProps from 'rehype-mdx-code-props'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import type { BundledLanguage } from 'shiki'

import { MermaidWrapper } from '~/components/doc/MermaidWrapper'
import { useMDXComponents } from '~/mdx-components'

import { ClientCodeBlock } from './ClientCodeBlock'

interface PreProps {
  children: React.ReactElement<{ className: string, children: React.ReactElement | string }>
  filename?: string
  showLineNumbers?: boolean
  hideInDoc?: boolean
}

export interface DynamicMDXRendererProps {
  /** MDX content string */
  content: string
  /** Custom MDX components (will be merged with default components) */
  components?: Record<string, React.ComponentType<unknown>>
  /** Show loading state while compiling */
  showLoading?: boolean
}

interface CompileResult {
  Component: React.ComponentType<{ components?: any }>
  error?: Error
}

/**
 * 动态 MDX 渲染组件
 *
 * 支持运行时编译和渲染 MDX 内容，适用于流式内容和动态内容场景
 * 复用项目中定义的自定义组件
 */
export function DynamicMDXRenderer({
  content,
  components = {},
  showLoading = true,
}: DynamicMDXRendererProps) {
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)

  // 获取默认的 MDX 组件配置
  const defaultComponents = useMDXComponents({})

  // 合并组件
  const mergedComponents = useMemo(() => ({
    ...defaultComponents,
    // 覆盖 pre 组件使用客户端版本
    pre: (props: PreProps) => {
      const {
        children,
        filename,
        showLineNumbers = false,
        hideInDoc = false,
        ...restProps
      } = props

      if (children.type === 'code') {
        if (hideInDoc) {
          return null
        }

        const { className = '', children: codeContent = '' } = children.props
        const lang = (className.replace(/language-/, '') || 'text')

        if (typeof codeContent === 'string') {
          if (lang === 'mermaid') {
            return <MermaidWrapper chart={codeContent} />
          }

          return (
            <ClientCodeBlock
              code={codeContent}
              filename={filename}
              lang={lang as BundledLanguage}
              showLineNumbers={showLineNumbers}
            />
          )
        }
      }

      return <pre {...restProps}>{children}</pre>
    },
    ...components,
  }), [defaultComponents, components])

  // MDX 编译配置
  const compileOptions: CompileOptions = useMemo(() => ({
    outputFormat: 'function-body',
    development: false, // 强制使用生产模式，避免 _jsxDEV 问题
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeMdxCodeProps,
      rehypeSlug,
    ],
  }), [])

  // 运行时配置
  const runOptions = useMemo<RunOptions>(() => ({
    Fragment: runtime.Fragment,
    jsx: runtime.jsx,
    jsxs: runtime.jsxs,
  }), [])

  // 安全的 MDX 内容预处理
  const preprocessContent = (rawContent: string): string => {
    if (!rawContent.trim()) {
      return ''
    }

    // 确保代码块完整性
    const lines = rawContent.split('\n')
    const processedLines: string[] = []
    let inCodeBlock = false

    for (const line of lines) {
      // 检测代码块开始
      if (/^```[\w]*$/.exec(line)) {
        if (!inCodeBlock) {
          inCodeBlock = true
          processedLines.push(line)
        }
        else {
          // 结束代码块
          inCodeBlock = false
          processedLines.push(line)
        }

        continue
      }

      processedLines.push(line)
    }

    // 如果内容在代码块中未完成，自动补全
    if (inCodeBlock) {
      processedLines.push('```')
    }

    return processedLines.join('\n')
  }

  // 编译 MDX 内容
  useEffect(() => {
    if (!content) {
      setCompileResult(null)

      return
    }

    let isCancelled = false

    const compileContent = async () => {
      try {
        setIsCompiling(true)

        // 预处理内容以确保 MDX 完整性
        const processedContent = preprocessContent(content)

        if (!processedContent.trim()) {
          setCompileResult(null)

          return
        }

        // 编译 MDX
        const compiledResult = await compile(processedContent, compileOptions)

        if (isCancelled) {
          return
        }

        // 运行编译后的代码
        const { default: MDXContent } = await run(compiledResult, runOptions)

        setCompileResult({
          Component: MDXContent as React.ComponentType,
        })
      }
      catch (error) {
        if (isCancelled) {
          return
        }

        console.warn('MDX 编译失败:', error)
        setCompileResult({
          Component: () => null,
          error: error instanceof Error ? error : new Error('Unknown error'),
        })
      }
      finally {
        if (!isCancelled) {
          setIsCompiling(false)
        }
      }
    }

    void compileContent()

    return () => {
      isCancelled = true
    }
  }, [content, compileOptions, runOptions])

  // 渲染加载状态
  if (isCompiling && showLoading) {
    // if (LoadingComponent) {
    //   return <LoadingComponent />
    // }

    // return (
    //   <div className="flex items-center gap-2 p-4 text-muted-foreground">
    //     <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    //     正在渲染内容...
    //   </div>
    // )
  }

  // 处理错误状态
  if (compileResult?.error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
        <p className="text-destructive font-medium">MDX 渲染错误</p>
        <p className="text-sm text-muted-foreground mt-1">
          {compileResult.error.message}
        </p>
      </div>
    )
  }

  // 渲染 MDX 内容
  if (compileResult?.Component) {
    const { Component } = compileResult

    return (
      <div className="mdx-content">
        <Component
          components={mergedComponents}
        />
      </div>
    )
  }

  // 空内容状态
  return null
}
