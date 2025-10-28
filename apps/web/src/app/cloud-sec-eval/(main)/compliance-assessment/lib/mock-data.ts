import {
  type AssessmentProject,
  type AssessmentTemplate,
  type AssessmentType,
  type KeyMetrics,
  type ProcessStage,
  ReviewCategory, type ReviewItem,
  type ReviewItemStatus } from '../types/assessment'

/**
 * 关键指标数据（固定值，用于顶部卡片展示）
 */
export const keyMetrics: KeyMetrics = {
  automationRate: 0.9, // 90%
  timeSavedPercentage: 0.83, // 83%
  manualInterventionRate: 0.103, // 10.3% (54/526)
  autoProcessedCount: 472,
  totalCount: 526,
  manualReviewCount: 54,
}

/**
 * 评估类型显示名称映射
 */
export const assessmentTypeNames: Record<AssessmentType, string> = {
  dengbao: '等保2.0',
  'cybersecurity-law': '网络安全法',
  'data-security-law': '数据安全法',
  'personal-info-protection-law': '个人信息保护法',
}

/**
 * 项目状态显示名称映射
 */
export const projectStatusNames = {
  draft: '草稿',
  'in-progress': '进行中',
  'pending-review': '待审核',
  completed: '已完成',
  archived: '已归档',
} as const

/**
 * 流程阶段显示名称映射
 */
export const processStageNames: Record<ProcessStage, string> = {
  'material-upload': '材料上传',
  'auto-review': '自动审核',
  'manual-review': '人工复核',
  'report-generation': '报告生成',
  completed: '已完成',
}

/**
 * 审核项分类显示名称映射
 */
export const reviewCategoryNames: Record<ReviewCategory, string> = {
  'network-security': '网络安全',
  'data-protection': '数据保护',
  'access-control': '访问控制',
  'security-audit': '安全审计',
  'emergency-response': '应急响应',
  'physical-security': '物理安全',
}

/**
 * 生成审核项数据（526项）
 * 为了性能考虑，这里只生成部分代表性数据
 */
export function generateReviewItems(count = 526): ReviewItem[] {
  const categories = Object.values(ReviewCategory)
  const items: ReviewItem[] = []

  // 生成指定数量的审核项
  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length]
    const status = getRandomReviewStatus(i)
    const priority = getRandomPriority(i)

    items.push({
      id: `review-item-${i + 1}`,
      code: `RI-${String(i + 1).padStart(4, '0')}`,
      name: `${reviewCategoryNames[category]}审核项 ${i + 1}`,
      description: `针对${reviewCategoryNames[category]}的第${i + 1}项审核要求`,
      category,
      status,
      priority,
      requiresManualReview: status === 'manual-review',
      autoReviewResult: status !== 'pending'
        ? {
            passed: status === 'auto-passed',
            confidence: 0.85 + Math.random() * 0.15,
            comment: status === 'auto-passed' ? '自动审核通过' : '需要人工复核',
          }
        : undefined,
    })
  }

  return items
}

/**
 * 根据索引生成审核状态（确保90%自动通过率）
 */
function getRandomReviewStatus(index: number): ReviewItemStatus {
  // 前472项（90%）自动通过
  if (index < 472) {
    return 'auto-passed'
  }

  // 后54项需要人工复核
  return 'manual-review'
}

/**
 * 根据索引生成优先级
 */
function getRandomPriority(index: number): 'high' | 'medium' | 'low' {
  const mod = index % 10

  if (mod < 2) {
    return 'high'
  }

  if (mod < 7) {
    return 'medium'
  }

  return 'low'
}

/**
 * 评估项目模板数据
 */
export const assessmentTemplates: AssessmentTemplate[] = [
  {
    id: 'template-1',
    name: '等保2.0三级评估',
    description: '适用于等保三级系统的合规评估，包含526项审核要求',
    type: 'dengbao',
    reviewItemCount: 526,
    isRecommended: true,
  },
  {
    id: 'template-2',
    name: '网络安全法合规评估',
    description: '基于《网络安全法》的合规性评估模板',
    type: 'cybersecurity-law',
    reviewItemCount: 328,
    isRecommended: true,
  },
  {
    id: 'template-3',
    name: '数据安全法合规评估',
    description: '基于《数据安全法》的数据安全合规评估',
    type: 'data-security-law',
    reviewItemCount: 245,
    isRecommended: false,
  },
  {
    id: 'template-4',
    name: '个人信息保护法评估',
    description: '针对个人信息处理活动的合规性评估',
    type: 'personal-info-protection-law',
    reviewItemCount: 198,
    isRecommended: false,
  },
]

/**
 * 模拟评估项目列表数据
 */
export const mockAssessmentProjects: AssessmentProject[] = [
  {
    id: 'project-1',
    name: '2024年度等保三级评估',
    type: 'dengbao',
    status: 'in-progress',
    currentStage: 'auto-review',
    automationRate: 0.9,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7天前
    updatedAt: Date.now() - 1 * 60 * 60 * 1000, // 1小时前
    uploadedFiles: [
      {
        id: 'file-1',
        name: '系统架构文档.pdf',
        size: 2048576,
        type: 'application/pdf',
        uploadedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
        validationStatus: 'passed',
      },
      {
        id: 'file-2',
        name: '安全策略说明.docx',
        size: 1024000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
        validationStatus: 'passed',
      },
    ],
    reviewItems: generateReviewItems(526),
    description: '公司核心业务系统的等保三级合规评估',
    creator: '张三',
  },
  {
    id: 'project-2',
    name: '数据安全合规检查',
    type: 'data-security-law',
    status: 'completed',
    currentStage: 'completed',
    automationRate: 0.88,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30天前
    updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15天前
    completedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    uploadedFiles: [
      {
        id: 'file-3',
        name: '数据分类分级清单.xlsx',
        size: 512000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedAt: Date.now() - 29 * 24 * 60 * 60 * 1000,
        validationStatus: 'passed',
      },
    ],
    reviewItems: generateReviewItems(245),
    description: '数据安全法实施后的首次合规检查',
    creator: '李四',
  },
  {
    id: 'project-3',
    name: '个人信息保护评估',
    type: 'personal-info-protection-law',
    status: 'pending-review',
    currentStage: 'manual-review',
    automationRate: 0.85,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14天前
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2天前
    uploadedFiles: [
      {
        id: 'file-4',
        name: '个人信息处理清单.pdf',
        size: 1536000,
        type: 'application/pdf',
        uploadedAt: Date.now() - 13 * 24 * 60 * 60 * 1000,
        validationStatus: 'passed',
      },
      {
        id: 'file-5',
        name: '隐私政策文档.pdf',
        size: 768000,
        type: 'application/pdf',
        uploadedAt: Date.now() - 13 * 24 * 60 * 60 * 1000,
        validationStatus: 'passed',
      },
    ],
    reviewItems: generateReviewItems(198),
    description: 'APP个人信息保护合规评估',
    creator: '王五',
  },
  {
    id: 'project-4',
    name: '网络安全法年度审查',
    type: 'cybersecurity-law',
    status: 'completed',
    currentStage: 'completed',
    automationRate: 0.92,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60天前
    updatedAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45天前
    completedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    uploadedFiles: [
      {
        id: 'file-6',
        name: '网络安全管理制度.pdf',
        size: 2560000,
        type: 'application/pdf',
        uploadedAt: Date.now() - 59 * 24 * 60 * 60 * 1000,
        validationStatus: 'passed',
      },
    ],
    reviewItems: generateReviewItems(328),
    description: '年度网络安全法合规审查',
    creator: '赵六',
  },
  {
    id: 'project-5',
    name: '等保二级系统评估',
    type: 'dengbao',
    status: 'draft',
    currentStage: 'material-upload',
    automationRate: 0,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2天前
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    uploadedFiles: [],
    reviewItems: generateReviewItems(526),
    description: '新建项目，待上传材料',
    creator: '孙七',
  },
]

/**
 * 根据项目ID获取项目详情
 */
export function getProjectById(projectId: string): AssessmentProject | undefined {
  return mockAssessmentProjects.find((p) => p.id === projectId)
}

/**
 * 根据模板ID获取模板详情
 */
export function getTemplateById(templateId: string): AssessmentTemplate | undefined {
  return assessmentTemplates.find((t) => t.id === templateId)
}
