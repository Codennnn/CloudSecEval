'use client'

import { Textarea } from '~/components/ui/textarea'

import { ComplianceChart } from './charts/ComplianceChart'
import { RiskDistributionChart } from './charts/RiskDistributionChart'

interface ReportPreviewProps {
  /** 报告内容（Markdown） */
  content: string
  /** 是否处于编辑模式 */
  isEditing: boolean
  /** 内容变化回调 */
  onContentChange: (content: string) => void
}

/**
 * 报告预览组件
 * 支持预览和编辑两种模式
 */
export function ReportPreview(props: ReportPreviewProps) {
  const { content, isEditing, onContentChange } = props

  if (isEditing) {
    return (
      <div className="p-6">
        <Textarea
          className="min-h-[800px] font-mono text-sm"
          value={content}
          onChange={(e) => {
            onContentChange(e.target.value)
          }}
        />
      </div>
    )
  }

  return (
    <div className="prose prose-slate max-w-none p-8">
      {/* 简单的 Markdown 渲染（演示用） */}
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />

      {/* 嵌入图表 */}
      <div className="not-prose my-8 space-y-8">
        <RiskDistributionChart />
        <ComplianceChart />
      </div>
    </div>
  )
}

/**
 * 简单的 Markdown 渲染（演示用）
 * 仅支持基本的 Markdown 语法
 */
function renderMarkdown(md: string): string {
  let html = md
    // 标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 代码块
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // 行内代码
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // 链接
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // 列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // 表格（简单处理）
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match
        .split('|')
        .filter((cell) => cell.trim())
        .map((cell) => `<td>${cell.trim()}</td>`)
        .join('')

      return `<tr>${cells}</tr>`
    })
    .replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>')
    // 段落
    .replace(/\n\n/g, '</p><p>')

  // 包裹段落标签
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`
  }

  return html
}
