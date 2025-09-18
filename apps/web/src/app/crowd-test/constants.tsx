import { CheckIcon, ClockIcon, EyeIcon, FileTextIcon, XIcon } from 'lucide-react'

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

export function getVulSeverity(severity?: string): VulSeverityConfig {
  if (severity && severity in vulSeverityConfig) {
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
  icon?: React.ReactNode
  description?: string
  hint?: string
}

export const reportStatusConfig = {
  [BugReportStatus.DRAFT]: {
    value: BugReportStatus.DRAFT,
    label: '草稿',
    icon: <FileTextIcon />,
    frontColor: '!text-muted-foreground',
    description: '报告正在编辑中，尚未提交审核',
    hint: '草稿',
  },
  [BugReportStatus.PENDING]: {
    value: BugReportStatus.PENDING,
    label: '待审核',
    icon: <ClockIcon />,
    frontColor: '!text-yellow-600',
    description: '报告已提交，正在等待审核人员处理',
    hint: '等待处理的报告',
  },
  [BugReportStatus.IN_REVIEW]: {
    value: BugReportStatus.IN_REVIEW,
    label: '审核中',
    icon: <EyeIcon />,
    frontColor: '!text-blue-600',
    description: '报告正在审核中，请耐心等待审核结果',
    hint: '正在审核中的漏洞',
  },
  [BugReportStatus.APPROVED]: {
    value: BugReportStatus.APPROVED,
    label: '已通过',
    icon: <CheckIcon />,
    frontColor: '!text-green-600',
    description: '报告已通过审核，漏洞确认有效',
    hint: '已通过审核的漏洞',
  },
  [BugReportStatus.REJECTED]: {
    value: BugReportStatus.REJECTED,
    label: '已驳回',
    icon: <XIcon />,
    frontColor: '!text-red-600',
    description: '报告被驳回，请根据审核意见修改后重新提交',
    hint: '未通过的报告',
  },
  [BugReportStatus.RESOLVED]: {
    value: BugReportStatus.RESOLVED,
    label: '已解决',
    frontColor: '!text-green-700',
    description: '漏洞已修复完成',
    hint: '已解决的漏洞',
  },
  [BugReportStatus.CLOSED]: {
    value: BugReportStatus.CLOSED,
    label: '已关闭',
    frontColor: '!text-muted-foreground',
    description: '报告已关闭，处理流程结束',
    hint: '已关闭的报告',
  },
} satisfies EnumConfig<BugReportStatus, ReportStatusConfig>

export function getReportStatus(status?: string): ReportStatusConfig {
  if (status && status in reportStatusConfig) {
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
