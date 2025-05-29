// 按需导入具体图标，支持 tree-shaking
import { Icon, type IconifyIcon } from '@iconify/react'
import htmlIcon from '@iconify-icons/vscode-icons/file-type-html'
import javascriptIcon from '@iconify-icons/vscode-icons/file-type-js'
import jsonIcon from '@iconify-icons/vscode-icons/file-type-json'
import shellIcon from '@iconify-icons/vscode-icons/file-type-shell'
import sqlIcon from '@iconify-icons/vscode-icons/file-type-sql'
import typescriptIcon from '@iconify-icons/vscode-icons/file-type-typescript'
import xmlIcon from '@iconify-icons/vscode-icons/file-type-xml'
import yamlIcon from '@iconify-icons/vscode-icons/file-type-yaml'

interface LanguageIconProps {
  lang: string
  className?: string
}

const iconMap: Record<string, IconifyIcon> = {
  // 编程语言
  typescript: typescriptIcon,
  ts: typescriptIcon,
  javascript: javascriptIcon,
  js: javascriptIcon,

  // 前端技术
  html: htmlIcon,

  // 数据格式
  json: jsonIcon,
  yaml: yamlIcon,
  yml: yamlIcon,
  xml: xmlIcon,

  // 文档和工具
  sql: sqlIcon,
  shell: shellIcon,
  sh: shellIcon,
  bash: shellIcon,
}

export function LanguageIcon(props: LanguageIconProps) {
  const { lang, className = 'size-4' } = props

  const iconData = iconMap[lang.toLowerCase()]

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (iconData) {
    return <Icon className={className} icon={iconData} />
  }

  return null
}
