/**
 * 报告类型
 */
export type ReportType = 'compliance' | 'risk' | 'remediation'

/**
 * 报告状态
 */
export type ReportStatus = 'generating' | 'completed' | 'draft'

/**
 * 报告数据结构
 */
export interface Report {
  /** 报告唯一标识 */
  id: string
  /** 报告标题 */
  title: string
  /** 报告类型 */
  type: ReportType
  /** 报告状态 */
  status: ReportStatus
  /** 关联的项目名称 */
  projectName: string
  /** 创建时间戳 */
  createdAt: number
  /** 完成时间戳 */
  completedAt?: number
  /** 生成进度 0-100 */
  progress?: number
  /** 报告内容（Markdown） */
  content?: string
}

/**
 * 报告类型配置
 */
export const reportTypeConfig = {
  compliance: {
    label: '法规对齐报告',
    description: '展示法规条款与实际配置的符合情况',
    icon: '📋',
    color: 'blue',
  },
  risk: {
    label: '风险分析报告',
    description: '展示系统检测到的漏洞、威胁等级',
    icon: '⚠️',
    color: 'red',
  },
  remediation: {
    label: '整改计划报告',
    description: '给出风险修复建议与时间表',
    icon: '🔧',
    color: 'green',
  },
} as const

/**
 * 报告状态配置
 */
export const reportStatusConfig = {
  generating: {
    label: '生成中',
    color: 'blue',
  },
  completed: {
    label: '已完成',
    color: 'green',
  },
  draft: {
    label: '草稿',
    color: 'gray',
  },
} as const

/**
 * Mock 报告列表
 */
export const mockReports: Report[] = [
  {
    id: 'report-001',
    title: '等保 2.0 三级合规评估报告',
    type: 'compliance',
    status: 'completed',
    projectName: '某银行核心系统',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    completedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    progress: 100,
  },
  {
    id: 'report-002',
    title: '云平台风险识别分析报告',
    type: 'risk',
    status: 'completed',
    projectName: '某政务云平台',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    completedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    progress: 100,
  },
  {
    id: 'report-003',
    title: '安全整改计划报告',
    type: 'remediation',
    status: 'completed',
    projectName: '某电商平台',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    completedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    progress: 100,
  },
]

/**
 * Mock 项目列表（用于创建报告时选择）
 */
export const mockProjects = [
  { id: 'project-001', name: '某银行核心系统' },
  { id: 'project-002', name: '某政务云平台' },
  { id: 'project-003', name: '某电商平台' },
  { id: 'project-004', name: '某医疗信息系统' },
  { id: 'project-005', name: '某教育管理平台' },
]

/**
 * 格式化日期时间
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (days === 0) {
    return '今天'
  }

  if (days === 1) {
    return '昨天'
  }

  if (days < 7) {
    return `${days} 天前`
  }

  if (days < 30) {
    return `${Math.floor(days / 7)} 周前`
  }

  if (days < 365) {
    return `${Math.floor(days / 30)} 月前`
  }

  return `${Math.floor(days / 365)} 年前`
}
