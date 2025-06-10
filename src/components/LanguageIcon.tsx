import type { SVGProps } from 'react'

import { MaterialIconThemeDocker, MaterialIconThemeGraphql, MaterialIconThemeGroovy, MaterialIconThemeHtml, MaterialIconThemeJavascript, MaterialIconThemeJson, MaterialIconThemePowershell, MaterialIconThemeTypescript, MaterialIconThemeYaml } from '~/components/icon/file-icons'

interface LanguageIconProps {
  lang: string
  className?: string
}

// 定义支持的语言类型
type SupportedLanguage =
  | 'typescript' | 'ts'
  | 'javascript' | 'js'
  | 'html'
  | 'json'
  | 'yaml' | 'yml'
  | 'shell' | 'sh' | 'bash' | 'groovy' | 'graphql'
  | 'docker' | 'dockerfile'

// 图标组件类型
type IconComponent = (props: SVGProps<SVGSVGElement>) => React.ReactElement

const iconMap: Record<SupportedLanguage, IconComponent> = {
  // 编程语言
  typescript: MaterialIconThemeTypescript,
  ts: MaterialIconThemeTypescript,
  javascript: MaterialIconThemeJavascript,
  js: MaterialIconThemeJavascript,
  groovy: MaterialIconThemeGroovy,
  graphql: MaterialIconThemeGraphql,

  // 技术
  html: MaterialIconThemeHtml,
  docker: MaterialIconThemeDocker,
  dockerfile: MaterialIconThemeDocker,

  // 数据格式
  json: MaterialIconThemeJson,
  yaml: MaterialIconThemeYaml,
  yml: MaterialIconThemeYaml,

  // 文档和工具
  shell: MaterialIconThemePowershell,
  sh: MaterialIconThemePowershell,
  bash: MaterialIconThemePowershell,
}

/**
 * 检查语言是否被支持
 */
function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return lang.toLowerCase() in iconMap
}

/**
 * 语言图标组件
 * 根据传入的语言类型显示对应的图标
 */
export function LanguageIcon(props: LanguageIconProps) {
  const { lang, className = 'size-4' } = props

  const normalizedLang = lang.toLowerCase()

  if (!isSupportedLanguage(normalizedLang)) {
    return null
  }

  const IconComponent = iconMap[normalizedLang]

  return <IconComponent className={className} />
}
