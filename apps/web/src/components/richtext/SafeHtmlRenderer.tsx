import DOMPurify from 'dompurify'

import { cn } from '~/lib/utils'

interface SafeHtmlRendererProps {
  html: string
  className?: string
}

/**
 * 安全的 HTML 渲染组件
 */
export function SafeHtmlRenderer(props: SafeHtmlRendererProps) {
  const { html, className } = props

  const sanitizedHtml = DOMPurify.sanitize(html)

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      className={cn(className)}
    />
  )
}
