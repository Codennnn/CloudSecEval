import { BugReportStatus } from '#prisma/client'

// 重新导出 Prisma 生成的枚举
export { BugReportStatus }

/**
 * 可进行状态流转的规则
 * 定义从某个状态可以流转到哪些状态
 */
export const BUG_REPORT_STATUS_TRANSITIONS = {
  [BugReportStatus.DRAFT]: [BugReportStatus.PENDING], // 草稿只能提交为待审核
  [BugReportStatus.PENDING]: [BugReportStatus.IN_REVIEW, BugReportStatus.REJECTED],
  [BugReportStatus.IN_REVIEW]: [BugReportStatus.APPROVED, BugReportStatus.REJECTED],
  [BugReportStatus.APPROVED]: [BugReportStatus.RESOLVED, BugReportStatus.CLOSED],
  [BugReportStatus.REJECTED]: [BugReportStatus.PENDING], // 可重新提交审核
  [BugReportStatus.RESOLVED]: [BugReportStatus.CLOSED],
  [BugReportStatus.CLOSED]: [], // 终态，无法流转
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
