'use client'

import { useState } from 'react'

import { SparklesIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

import { mockRegulationTemplates } from '../lib/mock-data'

interface RegulationInputProps {
  /** 开始解析的回调 */
  onAnalyze: (input: string, isTemplate: boolean) => void
  /** 是否正在解析 */
  isAnalyzing: boolean
}

/**
 * 法规输入组件
 * 提供文本输入和预设模板选择两种方式
 */
export function RegulationInput(props: RegulationInputProps) {
  const { onAnalyze, isAnalyzing } = props

  const [inputText, setInputText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  /**
   * 处理开始解析
   */
  const handleAnalyze = () => {
    if (selectedTemplate) {
      // 使用模板
      onAnalyze(selectedTemplate, true)
    }
    else if (inputText.trim()) {
      // 使用自定义文本
      onAnalyze(inputText, false)
    }
  }

  /**
   * 处理模板选择
   */
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
    // 清空文本输入
    setInputText('')
  }

  /**
   * 处理文本输入
   */
  const handleTextChange = (value: string) => {
    setInputText(value)
    // 清空模板选择
    setSelectedTemplate('')
  }

  const canAnalyze = (selectedTemplate || inputText.trim()) && !isAnalyzing

  return (
    <Card>
      <CardHeader>
        <CardTitle>法规输入</CardTitle>
        <CardDescription>
          选择预设法规模板或输入自定义法规条文进行智能解析
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 预设模板选择 */}
        <div className="space-y-2">
          <Label htmlFor="template-select">预设法规模板</Label>
          <Select
            disabled={isAnalyzing}
            value={selectedTemplate}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger id="template-select">
              <SelectValue placeholder="选择法规模板..." />
            </SelectTrigger>
            <SelectContent>
              {mockRegulationTemplates.map((template) => {
                return (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <p className="text-sm text-muted-foreground">
              {mockRegulationTemplates.find((t) => {
                return t.id === selectedTemplate
              })?.description}
            </p>
          )}
        </div>

        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">或</span>
          </div>
        </div>

        {/* 自定义文本输入 */}
        <div className="space-y-2">
          <Label htmlFor="regulation-text">自定义法规条文</Label>
          <Textarea
            className="min-h-32 resize-none"
            disabled={isAnalyzing}
            id="regulation-text"
            placeholder="请输入法规条文内容，系统将自动进行语义解析..."
            value={inputText}
            onChange={(e) => {
              handleTextChange(e.target.value)
            }}
          />
        </div>

        {/* 开始解析按钮 */}
        <Button
          className="w-full"
          disabled={!canAnalyze}
          size="lg"
          onClick={handleAnalyze}
        >
          <SparklesIcon className="mr-2 size-4" />
          {isAnalyzing ? '解析中...' : '开始智能解析'}
        </Button>
      </CardContent>
    </Card>
  )
}

