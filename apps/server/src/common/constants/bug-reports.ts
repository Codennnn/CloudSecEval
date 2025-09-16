/**
 * 漏洞报告状态枚举
 */
export const BUG_REPORT_STATUS = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const

/**
 * 可进行状态流转的规则
 * 定义从某个状态可以流转到哪些状态
 */
export const BUG_REPORT_STATUS_TRANSITIONS = {
  [BUG_REPORT_STATUS.PENDING]: [BUG_REPORT_STATUS.IN_REVIEW, BUG_REPORT_STATUS.REJECTED],
  [BUG_REPORT_STATUS.IN_REVIEW]: [BUG_REPORT_STATUS.APPROVED, BUG_REPORT_STATUS.REJECTED],
  [BUG_REPORT_STATUS.APPROVED]: [BUG_REPORT_STATUS.RESOLVED, BUG_REPORT_STATUS.CLOSED],
  [BUG_REPORT_STATUS.REJECTED]: [BUG_REPORT_STATUS.PENDING], // 可重新提交审核
  [BUG_REPORT_STATUS.RESOLVED]: [BUG_REPORT_STATUS.CLOSED],
  [BUG_REPORT_STATUS.CLOSED]: [], // 终态，无法流转
} as const

/**
 * 附件配置常量
 */
export const BUG_REPORT_ATTACHMENTS = {
  /** 最大附件数量 */
  MAX_COUNT: 10,
  /** 单个附件最大大小（50MB） */
  MAX_SIZE: 50 * 1024 * 1024,
  /** 支持的文件类型 */
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'video/mp4',
    'audio/mpeg',
  ],
} as const

// 类型定义导出
export type BugReportStatus = typeof BUG_REPORT_STATUS[keyof typeof BUG_REPORT_STATUS]
