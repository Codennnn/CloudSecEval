import type { AnalysisResult, AnalysisStep, AnalysisStepConfig } from '../types/regulation'

import { getAnalysisResultByTemplate, getAnalysisResultByText } from './mock-data'

/**
 * 解析步骤配置
 */
export const analysisSteps: AnalysisStepConfig[] = [
  {
    step: 'preprocessing',
    title: '文本预处理',
    description: '正在进行文本分词和清洗...',
    duration: 800,
  },
  {
    step: 'semantic-analysis',
    title: '语义分析',
    description: 'BERT模型正在分析法规语义...',
    duration: 1500,
  },
  {
    step: 'graph-building',
    title: '知识图谱构建',
    description: '正在构建四层关系网络...',
    duration: 1200,
  },
  {
    step: 'completed',
    title: '解析完成',
    description: '知识图谱已生成',
    duration: 0,
  },
]

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * 模拟解析过程
 * @param input - 输入内容（文本或模板ID）
 * @param isTemplate - 是否为模板ID
 * @param onStepChange - 步骤变化回调
 * @returns 解析结果
 */
export async function simulateAnalysis(
  input: string,
  isTemplate: boolean,
  onStepChange?: (step: AnalysisStep) => void,
): Promise<AnalysisResult> {
  // 遍历所有步骤
  for (const stepConfig of analysisSteps) {
    if (stepConfig.step === 'completed') {
      continue
    }

    // 更新当前步骤
    onStepChange?.(stepConfig.step)

    // 等待当前步骤完成
    await delay(stepConfig.duration)
  }

  // 标记为完成
  onStepChange?.('completed')

  // 根据输入类型返回结果
  if (isTemplate) {
    return getAnalysisResultByTemplate(input)
  }
  else {
    return getAnalysisResultByText(input)
  }
}

/**
 * 获取步骤配置
 */
export function getStepConfig(step: AnalysisStep): AnalysisStepConfig | undefined {
  return analysisSteps.find((s) => {
    return s.step === step
  })
}

/**
 * 获取步骤索引
 */
export function getStepIndex(step: AnalysisStep): number {
  return analysisSteps.findIndex((s) => {
    return s.step === step
  })
}
