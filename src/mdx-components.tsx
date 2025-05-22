import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'
import type { BundledLanguage } from 'shiki'

import { CodeBlock } from '~/components/CodeBlock'
import { RoutePath } from '~/constants'
import { isExternalLink } from '~/utils/common'

interface PreProps {
  children: React.ReactElement<{ className: string, children: React.ReactElement }>
  filename?: string
  showLineNumbers?: boolean
}

interface AnchorProps {
  href: string
  children: React.ReactElement
}

/**
 * 自定义 MDX 组件渲染函数
 *
 * 该函数用于扩展和重写 MDX 文档中的默认组件渲染行为，在 NestJS 中文文档项目中，此函数确保了文档中的代码示例和链接能够正确且一致地渲染
 *
 * @param components - 基础 MDX 组件集合，会与自定义组件合并
 * @returns 增强后的 MDX 组件集合
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: (props: AnchorProps) => {
      const { href, children } = props

      if (isExternalLink(href)) {
        return (
          <a href={href} rel="noopener noreferrer" target="_blank">
            {children}
          </a>
        )
      }

      return (
        <Link href={href.startsWith('/') ? `${RoutePath.Docs}${href}` : `${RoutePath.Docs}/${href}`}>
          {children}
        </Link>
      )
    },

    pre: ({ children, filename, showLineNumbers = false, ...props }: PreProps) => {
      if (children.type === 'code') {
        const { className = '', children: codeContent = '' } = children.props

        const lang = (className.replace(/language-/, '') || 'text') as BundledLanguage

        if (typeof codeContent === 'string') {
          return (
            <CodeBlock
              code={codeContent}
              filename={filename}
              lang={lang}
              showLineNumbers={showLineNumbers}
            />
          )
        }
      }

      return <pre {...props}>{children}</pre>
    },

    ...components,
  }
}
