import type { MDXComponents } from 'mdx/types'

import { CodeBlock } from '@/components/CodeBlock'

interface PreProps {
  children: React.ReactElement<{ className: string, children: React.ReactElement }>
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: ({ children, ...props }: PreProps) => {
      const childProps = children.props

      if (children.type === 'code') {
        const { className = '', children: codeContent = '' } = childProps

        // 解析语言
        const language = className.replace(/language-/, '') || 'text'

        // 解析文件名和行号选项
        let filename
        let showLineNumbers = false

        // 从className中提取文件名
        const filenameMatch = /filename="([^"]+)"/.exec(className)

        if (filenameMatch?.[1]) {
          filename = filenameMatch[1]
        }

        // 检查是否需要显示行号
        if (className.includes('showLineNumbers') || className.includes('line-numbers')) {
          showLineNumbers = true
        }

        if (typeof codeContent === 'string') {
          return (
            <CodeBlock
              code={codeContent}
              filename={filename}
              language={language}
              showLineNumbers={showLineNumbers}
            />
          )
        }
      }

      return <pre {...props}>{children}</pre>
    },
  }
}
