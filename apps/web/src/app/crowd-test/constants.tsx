import type { EnumConfig } from '~/types/common'

export const NEW_BUG_ID = 'new'

export enum VulnerabilitySeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const vulSeverityConfig = {
  [VulnerabilitySeverity.INFO]: {
    value: VulnerabilitySeverity.INFO,
    label: '信息',
  },
  [VulnerabilitySeverity.LOW]: {
    value: VulnerabilitySeverity.LOW,
    label: '低危',
  },
  [VulnerabilitySeverity.MEDIUM]: {
    value: VulnerabilitySeverity.MEDIUM,
    label: '中危',
  },
  [VulnerabilitySeverity.HIGH]: {
    value: VulnerabilitySeverity.HIGH,
    label: '高危',
  },
  [VulnerabilitySeverity.CRITICAL]: {
    value: VulnerabilitySeverity.CRITICAL,
    label: '严重',
  },
} satisfies EnumConfig<VulnerabilitySeverity>

export function getVulSeverity(severity: string) {
  if (severity in vulSeverityConfig) {
    return vulSeverityConfig[severity as VulnerabilitySeverity]
  }

  return {
    label: '未知',
    color: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
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
} satisfies EnumConfig<BugReportStatus>

export function getReportStatus(status: string) {
  if (status in reportStatusConfig) {
    return reportStatusConfig[status as BugReportStatus]
  }

  return {
    label: '未知',
    color: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
  }
}

export const enum BugReportRoleView {
  ADMIN,
  USER,
}
