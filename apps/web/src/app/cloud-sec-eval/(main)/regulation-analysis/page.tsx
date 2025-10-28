'use client'

import { useState } from 'react'

import type { Metadata } from 'next'

import { AnalysisProgress } from './components/AnalysisProgress'
import { DetailPanel } from './components/DetailPanel'
import { KnowledgeGraph } from './components/KnowledgeGraph'
import { RegulationInput } from './components/RegulationInput'
import { RegulationSyncStatus } from './components/RegulationSyncStatus'
import { simulateAnalysis } from './lib/analysis-simulator'
import type { AnalysisResult, AnalysisStep } from './types/regulation'

import { CloudSecEvalRoutes, generatePageTitle } from '~cloud-sec-eval/lib/cloud-sec-eval-nav'

/**
 * 法规智能解析页面
 * 用户输入法规条文，系统进行智能解析，并以知识图谱形式展示
 */
export default function RegulationAnalysisPage() {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('idle')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  /**
   * 处理开始解析
   */
  const handleAnalyze = async (input: string, isTemplate: boolean) => {
    setIsAnalyzing(true)
    setCurrentStep('preprocessing')
    setAnalysisResult(null)

    try {
      const result = await simulateAnalysis(input, isTemplate, (step) => {
        setCurrentStep(step)
      })

      setAnalysisResult(result)
    }
    catch (error) {
      console.error('解析失败:', error)
    }
    finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 页面标题 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">法规智能解析</h1>
        <p className="text-muted-foreground">
          基于 BERT-LLM 双模型架构，实现法规条款的智能语义解析与知识图谱构建
        </p>
      </div>

      {/* 法规输入区域 */}
      <RegulationInput isAnalyzing={isAnalyzing} onAnalyze={handleAnalyze} />

      {/* 解析进度 */}
      {isAnalyzing && <AnalysisProgress currentStep={currentStep} />}

      {/* 解析结果展示 */}
      {analysisResult && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 知识图谱 */}
          <KnowledgeGraph result={analysisResult} />

          {/* 详情面板 */}
          <DetailPanel result={analysisResult} />
        </div>
      )}

      {/* 法规库状态 */}
      <RegulationSyncStatus />
    </div>
  )
}
