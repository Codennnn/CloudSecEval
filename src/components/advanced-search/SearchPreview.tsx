/**
 * 搜索预览组件
 *
 * 显示生成的查询参数预览、代码示例和导出功能
 * 支持多种格式的查询参数预览和复制功能
 */

'use client'

import React, { useCallback, useMemo, useState } from 'react'

import { Code, Copy, Download, Eye, EyeOff, FileJson, Link, Settings } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'
import { useToast } from '~/hooks/use-toast'
import { cn } from '~/lib/utils'
import type { SearchConfig } from '~/types/advanced-search'
import { generateQueryString, searchConfigToQueryParams } from '~/utils/advanced-search/search-config'

/**
 * 搜索预览组件属性
 */
interface SearchPreviewProps {
  /** 搜索配置 */
  config: SearchConfig
  /** 是否显示 */
  visible?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 是否紧凑模式 */
  compact?: boolean
}

/**
 * 代码示例类型
 */
type CodeLanguage = 'javascript' | 'typescript' | 'curl' | 'python' | 'json'

/**
 * 搜索预览组件
 */
export function SearchPreview({
  config,
  visible = true,
  className,
  compact = false,
}: SearchPreviewProps) {
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('javascript')

  /**
   * 生成查询参数
   */
  const queryParams = useMemo(() => {
    return searchConfigToQueryParams(config)
  }, [config])

  /**
   * 生成查询字符串
   */
  const queryString = useMemo(() => {
    return generateQueryString(config)
  }, [config])

  /**
   * 生成 JSON 格式的配置
   */
  const configJson = useMemo(() => {
    return JSON.stringify(config, null, 2)
  }, [config])

  /**
   * 生成代码示例
   */
  const generateCodeExample = useCallback((language: CodeLanguage) => {
    const baseUrl = 'https://api.example.com/search'
    const url = `${baseUrl}?${queryString}`

    switch (language) {
      case 'javascript':
        return `// 使用 fetch API
const response = await fetch('${url}')
const data = await response.json()

// 使用查询参数对象
const params = ${JSON.stringify(queryParams, null, 2)}
const searchParams = new URLSearchParams()
Object.entries(params).forEach(([key, value]) => {
  if (Array.isArray(value)) {
    value.forEach(v => searchParams.append(key, String(v)))
  } else if (value !== undefined) {
    searchParams.append(key, String(value))
  }
})

const response2 = await fetch(\`\${baseUrl}?\${searchParams}\`)
const data2 = await response2.json()`

      case 'typescript':
        return `interface SearchParams {
  [key: string]: string | string[] | number | boolean | undefined
}

const params: SearchParams = ${JSON.stringify(queryParams, null, 2)}

async function searchData(): Promise<any> {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, String(v)))
    } else if (value !== undefined) {
      searchParams.append(key, String(value))
    }
  })

  const response = await fetch(\`${baseUrl}?\${searchParams}\`)
  return response.json()
}`

      case 'curl':
        return `curl -X GET "${url}" \\
  -H "Accept: application/json" \\
  -H "Content-Type: application/json"`

      case 'python':
        return `import requests
import urllib.parse

# 方式1：直接使用URL
url = "${url}"
response = requests.get(url)
data = response.json()

# 方式2：使用参数字典
params = ${JSON.stringify(queryParams, null, 2).replace(/"/g, '\'')}
response = requests.get("${baseUrl}", params=params)
data = response.json()`

      case 'json':
        return configJson

      default:
        return ''
    }
  }, [queryString, queryParams, configJson])

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: '复制成功',
        description: `${type}已复制到剪贴板`,
      })
    }
    catch (error) {
      toast({
        title: '复制失败',
        description: '无法访问剪贴板，请手动复制',
        variant: 'destructive',
      })
    }
  }, [toast])

  /**
   * 导出配置
   */
  const exportConfig = useCallback(() => {
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search-config-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: '导出成功',
      description: '搜索配置已导出为 JSON 文件',
    })
  }, [configJson, toast])

  /**
   * 获取条件统计
   */
  const stats = useMemo(() => {
    const enabledConditions = config.conditions.filter((c) => c.enabled !== false)

    return {
      total: config.conditions.length,
      enabled: enabledConditions.length,
      hasGlobalSearch: Boolean(config.globalSearch),
      hasSorting: Boolean(config.sortBy),
    }
  }, [config])

  if (!visible) { return null }

  return (
    <Card className={cn('w-full', className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  查询预览
                  {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </CardTitle>
                <CardDescription>
                  生成的查询参数和代码示例
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {stats.enabled}/{stats.total} 条件
                </Badge>
                {stats.hasGlobalSearch && (
                  <Badge variant="outline">全局搜索</Badge>
                )}
                {stats.hasSorting && (
                  <Badge variant="outline">排序</Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Tabs value={selectedLanguage} onValueChange={(value) => { setSelectedLanguage(value as CodeLanguage) }}>
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateCodeExample(selectedLanguage), '代码示例')}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    复制代码
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportConfig}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    导出配置
                  </Button>
                </div>
              </div>

              <TabsContent className="space-y-4" value={selectedLanguage}>
                <ScrollArea className="h-[300px] w-full rounded-md border">
                  <pre className="p-4 text-sm">
                    <code>{generateCodeExample(selectedLanguage)}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* 查询参数预览 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">查询参数</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(queryString, '查询字符串')}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  复制URL
                </Button>
              </div>

              <div className="rounded-md border p-3 bg-muted/30">
                <code className="text-sm break-all">
                  {queryString || '无查询参数'}
                </code>
              </div>

              {/* 参数详情 */}
              {Object.keys(queryParams).length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">参数详情</h5>
                  <div className="grid gap-2">
                    {Object.entries(queryParams).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <Badge className="font-mono" variant="outline">
                          {key}
                        </Badge>
                        <span className="text-muted-foreground">=</span>
                        <code className="flex-1 rounded bg-muted px-2 py-1">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 配置统计 */}
            {!compact && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h5 className="font-medium">搜索统计</h5>
                    <div className="space-y-1 text-muted-foreground">
                      <div>总条件数: {stats.total}</div>
                      <div>启用条件: {stats.enabled}</div>
                      <div>全局搜索: {stats.hasGlobalSearch ? '是' : '否'}</div>
                      <div>排序设置: {stats.hasSorting ? '是' : '否'}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">分页设置</h5>
                    <div className="space-y-1 text-muted-foreground">
                      <div>当前页: {config.pagination.page}</div>
                      <div>每页条数: {config.pagination.pageSize}</div>
                      <div>逻辑运算: {config.defaultLogicalOperator?.toUpperCase() || 'AND'}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

/**
 * 简化版查询预览组件
 */
interface SimpleSearchPreviewProps {
  config: SearchConfig
  className?: string
}

export function SimpleSearchPreview({ config, className }: SimpleSearchPreviewProps) {
  const queryString = useMemo(() => generateQueryString(config), [config])
  const { toast } = useToast()

  const copyQueryString = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(queryString)
      toast({
        title: '复制成功',
        description: '查询字符串已复制到剪贴板',
      })
    }
    catch (error) {
      toast({
        title: '复制失败',
        description: '无法访问剪贴板，请手动复制',
        variant: 'destructive',
      })
    }
  }, [queryString, toast])

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">查询参数</h4>
        <Button size="sm" variant="ghost" onClick={copyQueryString}>
          <Copy className="h-4 w-4 mr-1" />
          复制
        </Button>
      </div>
      <div className="rounded-md border p-3 bg-muted/30">
        <code className="text-sm break-all">
          {queryString || '无查询参数'}
        </code>
      </div>
    </div>
  )
}
