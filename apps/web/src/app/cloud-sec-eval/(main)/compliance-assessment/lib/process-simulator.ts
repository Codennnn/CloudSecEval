import type {
  ProcessStage,
  ProcessStageConfig,
  ReportGenerationProgress,
  ReviewItem,
  UploadedFile,
} from '../types/assessment'

/**
 * 流程阶段配置
 */
export const processStageConfigs: ProcessStageConfig[] = [
  {
    stage: 'material-upload',
    title: '材料上传',
    description: '上传评估所需的文档材料',
    automationRate: 0.95,
  },
  {
    stage: 'auto-review',
    title: '自动审核',
    description: 'AI智能审核评估项',
    automationRate: 0.9,
  },
  {
    stage: 'manual-review',
    title: '人工复核',
    description: '人工复核需要关注的项目',
    automationRate: 0.1,
  },
  {
    stage: 'report-generation',
    title: '报告生成',
    description: '自动生成评估报告',
    automationRate: 1.0,
  },
  {
    stage: 'completed',
    title: '已完成',
    description: '评估流程已完成',
    automationRate: 1.0,
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
 * 模拟文件上传
 * @param file - 文件对象
 * @param onProgress - 进度回调
 * @returns Promise<上传后的文件信息>
 */
export async function simulateFileUpload(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadedFile> {
  // 模拟上传进度
  const steps = 10
  for (let i = 0; i <= steps; i++) {
    await delay(100)
    if (onProgress) {
      onProgress((i / steps) * 100)
    }
  }

  // 模拟文件校验
  await delay(500)

  return {
    id: `file-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: Date.now(),
    validationStatus: 'passed',
    validationMessage: '文件格式正确，内容完整',
  }
}

/**
 * 模拟自动审核进度
 * @param reviewItems - 审核项列表
 * @param onProgress - 进度回调 (当前处理数量, 总数量, 当前项)
 * @returns Promise<void>
 */
export async function simulateAutoReview(
  reviewItems: ReviewItem[],
  onProgress?: (current: number, total: number, currentItem: ReviewItem) => void,
): Promise<void> {
  const total = reviewItems.length
  const batchSize = 50 // 每批处理50项
  const delayPerBatch = 100 // 每批延迟100ms

  for (let i = 0; i < total; i += batchSize) {
    const endIndex = Math.min(i + batchSize, total)

    // 处理当前批次
    for (let j = i; j < endIndex; j++) {
      if (onProgress) {
        onProgress(j + 1, total, reviewItems[j])
      }
    }

    // 批次间延迟
    if (endIndex < total) {
      await delay(delayPerBatch)
    }
  }

  // 最后稍微延迟一下，让用户看到100%的状态
  await delay(300)
}

/**
 * 模拟报告生成进度
 * @param onProgress - 进度回调
 * @returns Promise<报告下载URL>
 */
export async function simulateReportGeneration(
  onProgress?: (progress: ReportGenerationProgress) => void,
): Promise<string> {
  const steps = [
    { step: '收集评估数据', duration: 500 },
    { step: '分析审核结果', duration: 600 },
    { step: '生成图表统计', duration: 700 },
    { step: '编写评估报告', duration: 800 },
    { step: '格式化文档', duration: 400 },
  ]

  let totalProgress = 0
  const totalSteps = steps.length

  for (let i = 0; i < steps.length; i++) {
    const { step, duration } = steps[i]
    const stepProgress = ((i + 1) / totalSteps) * 100

    if (onProgress) {
      onProgress({
        currentStep: step,
        progress: stepProgress,
        estimatedTimeRemaining: Math.ceil(
          steps.slice(i + 1).reduce((sum, s) => sum + s.duration, 0) / 1000,
        ),
        isCompleted: false,
      })
    }

    await delay(duration)
    totalProgress = stepProgress
  }

  // 完成
  if (onProgress) {
    onProgress({
      currentStep: '报告生成完成',
      progress: 100,
      estimatedTimeRemaining: 0,
      isCompleted: true,
    })
  }

  // 返回模拟的下载URL
  return `/mock-reports/assessment-report-${Date.now()}.pdf`
}

/**
 * 模拟批量审批
 * @param itemIds - 审核项ID列表
 * @param approved - 是否通过
 * @returns Promise<void>
 */
export async function simulateBatchApproval(
  itemIds: string[],
  approved: boolean,
): Promise<void> {
  // 模拟批量处理延迟
  const delayTime = Math.min(itemIds.length * 50, 2000) // 最多2秒
  await delay(delayTime)
}

/**
 * 获取流程阶段配置
 */
export function getStageConfig(stage: ProcessStage): ProcessStageConfig | undefined {
  return processStageConfigs.find(config => config.stage === stage)
}

/**
 * 获取下一个流程阶段
 */
export function getNextStage(currentStage: ProcessStage): ProcessStage | null {
  const stages: ProcessStage[] = [
    'material-upload',
    'auto-review',
    'manual-review',
    'report-generation',
    'completed',
  ]

  const currentIndex = stages.indexOf(currentStage)
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null
  }

  return stages[currentIndex + 1]
}

/**
 * 获取流程阶段索引（用于步骤条显示）
 */
export function getStageIndex(stage: ProcessStage): number {
  const stages: ProcessStage[] = [
    'material-upload',
    'auto-review',
    'manual-review',
    'report-generation',
    'completed',
  ]

  return stages.indexOf(stage)
}

/**
 * 计算自动化统计数据
 */
export function calculateAutomationStats(reviewItems: ReviewItem[]) {
  const totalItems = reviewItems.length
  const autoProcessedCount = reviewItems.filter(
    item => item.status === 'auto-passed' || item.status === 'auto-failed',
  ).length
  const manualReviewCount = reviewItems.filter(
    item => item.requiresManualReview || item.status === 'manual-review',
  ).length

  const automationRate = totalItems > 0 ? autoProcessedCount / totalItems : 0

  // 假设传统方式需要48小时，自动化方式只需8小时
  const traditionalTimeEstimate = 48
  const automatedTimeActual = 8
  const timeSavedPercentage = (traditionalTimeEstimate - automatedTimeActual) / traditionalTimeEstimate

  return {
    totalItems,
    autoProcessedCount,
    manualReviewCount,
    automationRate,
    timeSavedPercentage,
    traditionalTimeEstimate,
    automatedTimeActual,
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B'
  }

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化时间差（相对时间）
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  }
  if (hours > 0) {
    return `${hours}小时前`
  }
  if (minutes > 0) {
    return `${minutes}分钟前`
  }
  return '刚刚'
}

/**
 * 格式化日期时间
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

