import { VulnerabilitySeverity } from '~api/types.gen'

export const NEW_BUG_ID = 'new'

interface VulSeverityConfig {
  label: string
  color: string
}

const vulSeverityConfig: Record<VulnerabilitySeverity, VulSeverityConfig> = {
  [VulnerabilitySeverity.INFO]: {
    label: '信息',
    color:
    'bg-gray-500/15 text-gray-600 border-gray-500/20',
  },
  [VulnerabilitySeverity.LOW]: {
    label: '低危',
    color: 'bg-green-500/15 text-green-600 border-green-500/20',
  },
  [VulnerabilitySeverity.MEDIUM]: {
    label: '中危',
    color: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  },
  [VulnerabilitySeverity.HIGH]: {
    label: '高危',
    color: 'bg-red-500/15 text-red-600 border-red-500/20',
  },
  [VulnerabilitySeverity.CRITICAL]: {
    label: '严重',
    color: 'bg-purple-500/15 text-purple-600 border-purple-500/20',
  },
}

export function getVulSeverity(severity: string): VulSeverityConfig {
  if (severity in vulSeverityConfig) {
    return vulSeverityConfig[severity as VulnerabilitySeverity]
  }

  return {
    label: '未知',
    color: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
  }
}

export const enum BugReportStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

interface ReportStatusConfig {
  label: string
  color: string
}

const reportStatusConfig: Record<BugReportStatus, ReportStatusConfig> = {
  [BugReportStatus.PENDING]: {
    label: '待审核',
    color: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  },
  [BugReportStatus.IN_REVIEW]: {
    label: '审核中',
    color: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  },
  [BugReportStatus.APPROVED]: {
    label: '已通过',
    color: 'bg-green-500/15 text-green-600 border-green-500/20',
  },
  [BugReportStatus.REJECTED]: {
    label: '已驳回',
    color: 'bg-red-500/15 text-red-600 border-red-500/20',
  },
  [BugReportStatus.RESOLVED]: {
    label: '已解决',
    color: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  },
  [BugReportStatus.CLOSED]: {
    label: '已关闭',
    color: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
  },
}

export function getReportStatus(status: string): ReportStatusConfig {
  if (status in reportStatusConfig) {
    return reportStatusConfig[status as BugReportStatus]
  }

  return {
    label: '未知',
    color: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
  }
}
