import type { BaseEnumConfig, EnumConfig } from '~/types/common'

export const NEW_BUG_ID = 'new'

export enum VulnerabilitySeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface VulSeverityConfig extends BaseEnumConfig {
  value: VulnerabilitySeverity
}

export const vulSeverityConfig = {
  [VulnerabilitySeverity.INFO]: {
    value: VulnerabilitySeverity.INFO,
    label: '信息',
  },
  [VulnerabilitySeverity.LOW]: {
    value: VulnerabilitySeverity.LOW,
    label: '低危',
    frontColor: '!text-amber-500',
  },
  [VulnerabilitySeverity.MEDIUM]: {
    value: VulnerabilitySeverity.MEDIUM,
    label: '中危',
    frontColor: '!text-orange-600',
  },
  [VulnerabilitySeverity.HIGH]: {
    value: VulnerabilitySeverity.HIGH,
    label: '高危',
    frontColor: '!text-red-700',
  },
  [VulnerabilitySeverity.CRITICAL]: {
    value: VulnerabilitySeverity.CRITICAL,
    label: '严重',
    frontColor: '!text-purple-700',
  },
} satisfies EnumConfig<VulnerabilitySeverity, VulSeverityConfig>

export function getVulSeverity(severity: string): VulSeverityConfig {
  if (severity in vulSeverityConfig) {
    return vulSeverityConfig[severity as VulnerabilitySeverity]
  }

  return {
    label: '未知',
    value: severity as VulnerabilitySeverity,
  }
}

export const enum BugReportStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

interface ReportStatusConfig extends BaseEnumConfig {
  value: BugReportStatus
}

export const reportStatusConfig = {
  [BugReportStatus.DRAFT]: {
    value: BugReportStatus.DRAFT,
    label: '草稿',
  },
  [BugReportStatus.PENDING]: {
    value: BugReportStatus.PENDING,
    label: '待审核',
  },
  [BugReportStatus.IN_REVIEW]: {
    value: BugReportStatus.IN_REVIEW,
    label: '审核中',
  },
  [BugReportStatus.APPROVED]: {
    value: BugReportStatus.APPROVED,
    label: '已通过',
  },
  [BugReportStatus.REJECTED]: {
    value: BugReportStatus.REJECTED,
    label: '已驳回',
  },
  [BugReportStatus.RESOLVED]: {
    value: BugReportStatus.RESOLVED,
    label: '已解决',
  },
  [BugReportStatus.CLOSED]: {
    value: BugReportStatus.CLOSED,
    label: '已关闭',
  },
} satisfies EnumConfig<BugReportStatus, ReportStatusConfig>

export function getReportStatus(status: string): ReportStatusConfig {
  if (status in reportStatusConfig) {
    return reportStatusConfig[status as BugReportStatus]
  }

  return {
    label: '未知',
    value: status as BugReportStatus,
  }
}

export const enum BugReportRoleView {
  ADMIN,
  USER,
}
