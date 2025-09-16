/**
 * 漏洞报告相关常量定义
 *
 * 用于统一管理漏洞等级、报告状态等枚举值和相关配置
 */

import {
  VULNERABILITY_SEVERITY_LABELS,
  VulnerabilitySeverity,
} from '~/common/enums/severity.enum'

/**
 * 漏洞等级枚举（已迁移到统一枚举文件）
 * @deprecated 请使用 ~/common/enums/severity.enum 中的 VulnerabilitySeverity
 */
export const BUG_SEVERITY = VulnerabilitySeverity

/**
 * 漏洞等级显示名称映射（已迁移到统一枚举文件）
 * @deprecated 请使用 ~/common/enums/severity.enum 中的 VULNERABILITY_SEVERITY_LABELS
 */
export const BUG_SEVERITY_LABELS = VULNERABILITY_SEVERITY_LABELS

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
 * 漏洞报告状态显示名称映射
 */
export const BUG_REPORT_STATUS_LABELS = {
  [BUG_REPORT_STATUS.PENDING]: '待审核',
  [BUG_REPORT_STATUS.IN_REVIEW]: '审核中',
  [BUG_REPORT_STATUS.APPROVED]: '已通过',
  [BUG_REPORT_STATUS.REJECTED]: '已驳回',
  [BUG_REPORT_STATUS.RESOLVED]: '已解决',
  [BUG_REPORT_STATUS.CLOSED]: '已关闭',
} as const

/**
 * 漏洞报告状态颜色配置
 */
export const BUG_REPORT_STATUS_COLORS = {
  [BUG_REPORT_STATUS.PENDING]: '#6B7280', // 灰色
  [BUG_REPORT_STATUS.IN_REVIEW]: '#3B82F6', // 蓝色
  [BUG_REPORT_STATUS.APPROVED]: '#10B981', // 绿色
  [BUG_REPORT_STATUS.REJECTED]: '#EF4444', // 红色
  [BUG_REPORT_STATUS.RESOLVED]: '#8B5CF6', // 紫色
  [BUG_REPORT_STATUS.CLOSED]: '#374151', // 深灰色
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
