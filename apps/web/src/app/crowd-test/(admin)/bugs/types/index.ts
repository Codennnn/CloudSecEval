/** 漏洞状态枚举 */
export type BugStatus = 'pending' | 'triaged' | 'accepted' | 'rejected' | 'fixed'

/** 漏洞严重级别枚举 */
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical'

/** 漏洞列表项 */
export interface BugItem {
  id: string
  title: string
  authorId: string
  authorName: string
  status: BugStatus
  createdAt: string
  /** 严重级别（用于统计卡片） */
  severity: BugSeverity
  /** 首次响应时间（用于统计卡片：SLA、平均响应） */
  firstRespondedAt?: string
}

/** 颜色映射（Badge） */
export const STATUS_TO_VARIANT: Record<BugStatus, string> = {
  pending: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  triaged: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  accepted: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-rose-500/15 text-rose-600 border-rose-500/20',
  fixed: 'bg-purple-500/15 text-purple-600 border-purple-500/20',
}

/** 状态中文标签映射 */
export const STATUS_TO_LABEL: Record<BugStatus, string> = {
  pending: '待审核',
  triaged: '已分级',
  accepted: '已接收',
  rejected: '已拒绝',
  fixed: '已修复',
}

export const NEW_BUG_ID = 'new'
