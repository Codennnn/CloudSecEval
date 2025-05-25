import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'
import type { BundledLanguage } from 'shiki'

import { CodeBlock } from '~/components/CodeBlock'
import { CalloutInfo } from '~/components/doc/CalloutInfo'
import { DocImage } from '~/components/doc/DocImage'
import { FileTree } from '~/components/doc/FileTree'
import { RoutePath } from '~/constants'
import { isExternalLink, isHashLink, isInternalLink } from '~/utils/common'

interface PreProps {
  children: React.ReactElement<{ className: string, children: React.ReactElement }>
  filename?: string
  showLineNumbers?: boolean
  hideInDoc?: boolean
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
        <Link href={isInternalLink(href) ? isHashLink(href) ? href : `${RoutePath.Docs}${href}` : `${RoutePath.Docs}/${href}`}>
          {children}
        </Link>
      )
    },

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

      return <pre {...restProps}>{children}</pre>
    },

    FileTree,
    CalloutInfo,
    DocImage,

    ...components,
  }
}
