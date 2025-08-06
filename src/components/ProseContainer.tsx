import type React from 'react'

import { cn } from '~/lib/utils'

interface ProseContainerProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * 渲染的 HTML 标签名
   * @default 'div'
   */
  as?: React.ElementType
  /**
   * 额外的 CSS 类名
   */
  className?: string
}

/**
 * Prose 组件 - 为 MDX 内容提供统一的排版样式
 *
 * @example
 * ```tsx
 * // 使用默认的 div 标签
 * <Prose>
 *   <MDXContent />
 * </Prose>
 *
 * // 使用 article 标签
 * <Prose as="article">
 *   <MDXContent />
 * </Prose>
 *
 * // 使用 section 标签并添加自定义样式
 * <Prose as="section" className="my-custom-class">
 *   <MDXContent />
 * </Prose>
 *
 * // 传递其他 HTML 属性
 * <Prose as="main" id="main-content" role="main">
 *   <MDXContent />
 * </Prose>
 * ```
 */
export function ProseContainer(props: React.PropsWithChildren<ProseContainerProps>) {
  const {
    children,
    as: Component = 'div',
    className,
    ...rest
  } = props

  return (
    <Component
      className={cn(
        // 基础 prose 样式
        'prose prose-strong:font-bold',
        // 引用块样式
        'prose-blockquote:font-normal prose-blockquote:not-italic',
        // 链接样式
        'prose-a:font-normal prose-a:decoration-dotted prose-a:hover:decoration-solid prose-a:underline-offset-4 prose-a:hover:text-theme',
        // 图片样式
        'prose-figure:my-5',
        // 颜色继承
        'text-current prose-headings:text-current prose-strong:text-current prose-a:text-current',
        // 表格样式
        'prose-table:my-1',
        // 最大宽度
        'max-w-none',
        // 用户自定义样式
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
