/**
 * 评估类型枚举
 */
export enum AssessmentType {
  /** 等保2.0 */
  DengBao = 'dengbao',
  /** 网络安全法 */
  CyberSecurityLaw = 'cybersecurity-law',
  /** 数据安全法 */
  DataSecurityLaw = 'data-security-law',
  /** 个人信息保护法 */
  PersonalInfoProtectionLaw = 'personal-info-protection-law',
}

/**
 * 流程阶段类型
 */
export type ProcessStage = 'material-upload' | 'auto-review' | 'manual-review' | 'report-generation' | 'completed'

/**
 * 项目状态类型
 */
export type ProjectStatus = 'draft' | 'in-progress' | 'pending-review' | 'completed' | 'archived'

/**
 * 审核项状态类型
 */
export type ReviewItemStatus = 'pending' | 'auto-passed' | 'auto-failed' | 'manual-review' | 'passed' | 'failed'

/**
 * 审核项分类
 */
export enum ReviewCategory {
  /** 网络安全 */
  NetworkSecurity = 'network-security',
  /** 数据保护 */
  DataProtection = 'data-protection',
  /** 访问控制 */
  AccessControl = 'access-control',
  /** 安全审计 */
  SecurityAudit = 'security-audit',
  /** 应急响应 */
  EmergencyResponse = 'emergency-response',
  /** 物理安全 */
  PhysicalSecurity = 'physical-security',
}

/**
 * 上传文件接口
 */
export interface UploadedFile {
  /** 文件唯一标识 */
  id: string
  /** 文件名 */
  name: string
  /** 文件大小（字节） */
  size: number
  /** 文件类型 */
  type: string
  /** 上传时间戳 */
  uploadedAt: number
  /** 校验状态 */
  validationStatus: 'pending' | 'passed' | 'failed'
  /** 校验消息 */
  validationMessage?: string
}

/**
 * 审核项接口
 */
export interface ReviewItem {
  /** 审核项唯一标识 */
  id: string
  /** 审核项编号 */
  code: string
  /** 审核项名称 */
  name: string
  /** 审核项描述 */
  description: string
  /** 审核项分类 */
  category: ReviewCategory
  /** 审核状态 */
  status: ReviewItemStatus
  /** 重要性等级 */
  priority: 'high' | 'medium' | 'low'
  /** 是否需要人工复核 */
  requiresManualReview: boolean
  /** 自动审核结果 */
  autoReviewResult?: {
    /** 是否通过 */
    passed: boolean
    /** 置信度（0-1） */
    confidence: number
    /** 审核意见 */
    comment: string
  }
  /** 人工审核结果 */
  manualReviewResult?: {
    /** 是否通过 */
    passed: boolean
    /** 审核人 */
    reviewer: string
    /** 审核时间 */
    reviewedAt: number
    /** 审核意见 */
    comment: string
  }
}

/**
 * 评估项目接口
 */
export interface AssessmentProject {
  /** 项目唯一标识 */
  id: string
  /** 项目名称 */
  name: string
  /** 评估类型 */
  type: AssessmentType
  /** 项目状态 */
  status: ProjectStatus
  /** 当前流程阶段 */
  currentStage: ProcessStage
  /** 自动化率（0-1） */
  automationRate: number
  /** 创建时间戳 */
  createdAt: number
  /** 更新时间戳 */
  updatedAt: number
  /** 完成时间戳 */
  completedAt?: number
  /** 上传的文件列表 */
  uploadedFiles: UploadedFile[]
  /** 审核项列表 */
  reviewItems: ReviewItem[]
  /** 项目描述 */
  description?: string
  /** 创建人 */
  creator?: string
}

/**
 * 流程阶段配置接口
 */
export interface ProcessStageConfig {
  /** 阶段标识 */
  stage: ProcessStage
  /** 阶段标题 */
  title: string
  /** 阶段描述 */
  description: string
  /** 阶段图标 */
  icon?: string
  /** 自动化率 */
  automationRate: number
}

/**
 * 自动化统计数据接口
 */
export interface AutomationStats {
  /** 总审核项数量 */
  totalItems: number
  /** 自动处理数量 */
  autoProcessedCount: number
  /** 需人工介入数量 */
  manualReviewCount: number
  /** 自动化率（0-1） */
  automationRate: number
  /** 时间节省百分比（0-1） */
  timeSavedPercentage: number
  /** 传统方式预计耗时（小时） */
  traditionalTimeEstimate: number
  /** 自动化方式实际耗时（小时） */
  automatedTimeActual: number
}

/**
 * 关键指标数据接口
 */
export interface KeyMetrics {
  /** 自动化率 */
  automationRate: number
  /** 时间缩短百分比 */
  timeSavedPercentage: number
  /** 人工干预比例 */
  manualInterventionRate: number
  /** 已自动处理项数 */
  autoProcessedCount: number
  /** 总项数 */
  totalCount: number
  /** 需人工介入项数 */
  manualReviewCount: number
}

/**
 * 报告生成进度接口
 */
export interface ReportGenerationProgress {
  /** 当前步骤 */
  currentStep: string
  /** 进度百分比（0-100） */
  progress: number
  /** 预计剩余时间（秒） */
  estimatedTimeRemaining: number
  /** 是否完成 */
  isCompleted: boolean
}

/**
 * 生成的报告接口
 */
export interface GeneratedReport {
  /** 报告唯一标识 */
  id: string
  /** 报告名称 */
  name: string
  /** 报告类型 */
  type: 'pdf' | 'word' | 'excel'
  /** 文件大小（字节） */
  size: number
  /** 生成时间戳 */
  generatedAt: number
  /** 下载链接（模拟） */
  downloadUrl: string
}

/**
 * 评估项目模板接口
 */
export interface AssessmentTemplate {
  /** 模板唯一标识 */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description: string
  /** 评估类型 */
  type: AssessmentType
  /** 预设审核项数量 */
  reviewItemCount: number
  /** 是否为推荐模板 */
  isRecommended: boolean
}

