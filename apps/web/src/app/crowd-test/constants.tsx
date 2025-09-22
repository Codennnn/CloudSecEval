import { CheckCircleIcon, CheckIcon, ClockIcon, EyeIcon, FileTextIcon, RefreshCwIcon, SendIcon, Share2Icon, XCircleIcon, XIcon } from 'lucide-react'

import type { BaseEnumConfig, EnumConfig } from '~/types/common'

export const NEW_BUG_ID = 'new'

export enum TimelineEventType {
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_INFO = 'REQUEST_INFO',
  FORWARD = 'FORWARD',
  RESUBMIT = 'RESUBMIT',
  UPDATE = 'UPDATE',
}

interface TimelineEventTypeConfig extends BaseEnumConfig {
  icon?: React.ReactNode
}

const timelineEventTypeConfig = {
  [TimelineEventType.SUBMIT]: {
    label: '提交漏洞报告',
    value: TimelineEventType.SUBMIT,
    icon: <FileTextIcon />,
    bgColor: 'bg-blue-500/10',
    frontColor: 'text-blue-600',
  },
  [TimelineEventType.APPROVE]: {
    label: '审批通过',
    value: TimelineEventType.APPROVE,
    icon: <CheckCircleIcon />,
    bgColor: 'bg-green-500/10',
    frontColor: 'text-green-600',
  },
  [TimelineEventType.REJECT]: {
    label: '审批驳回',
    value: TimelineEventType.REJECT,
    icon: <XCircleIcon />,
    bgColor: 'bg-red-500/10',
    frontColor: 'text-red-600',
  },
  [TimelineEventType.REQUEST_INFO]: {
    label: '要求补充信息',
    value: TimelineEventType.REQUEST_INFO,
    icon: <ClockIcon />,
    bgColor: 'bg-amber-500/10',
    frontColor: 'text-amber-500',
  },
  [TimelineEventType.FORWARD]: {
    label: '转发审批',
    value: TimelineEventType.FORWARD,
    icon: <Share2Icon />,
    bgColor: 'bg-purple-500/10',
    frontColor: 'text-purple-500',
  },
  [TimelineEventType.RESUBMIT]: {
    label: '重新提交',
    value: TimelineEventType.RESUBMIT,
    icon: <SendIcon />,
    bgColor: 'bg-cyan-500/10',
    frontColor: 'text-cyan-500',
  },
  [TimelineEventType.UPDATE]: {
    label: '更新报告',
    value: TimelineEventType.UPDATE,
    icon: <RefreshCwIcon />,
    bgColor: 'bg-indigo-500/10',
    frontColor: 'text-indigo-500',
  },
} satisfies EnumConfig<TimelineEventType, TimelineEventTypeConfig>

export function getTimelineEventType(eventType?: string): TimelineEventTypeConfig {
  if (eventType && eventType in timelineEventTypeConfig) {
    return timelineEventTypeConfig[eventType as TimelineEventType]
  }

  return {
    label: '未知',
    icon: <FileTextIcon />,
  }
}

export enum VulnerabilitySeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface VulSeverityConfig extends BaseEnumConfig {
  value: VulnerabilitySeverity
  borderColor?: string
  frontColorDark?: string
  borderColorDark?: string
  bgColorDark?: string
}

export const vulSeverityConfig = {
  [VulnerabilitySeverity.INFO]: {
    value: VulnerabilitySeverity.INFO,
    label: '信息',
    frontColor: '!text-gray-500',
    bgColor: '!bg-gray-500/15',
    borderColor: '!border-gray-500/40',
    frontColorDark: '!text-gray-300',
    bgColorDark: '!bg-gray-500/15',
    borderColorDark: '!border-gray-500/40',
  },
  [VulnerabilitySeverity.LOW]: {
    value: VulnerabilitySeverity.LOW,
    label: '低危',
    frontColor: '!text-amber-500',
    bgColor: '!bg-amber-500/15',
    borderColor: '!border-amber-500/40',
    frontColorDark: '!text-amber-500',
    bgColorDark: '!bg-amber-500/15',
    borderColorDark: '!border-amber-500/40',
  },
  [VulnerabilitySeverity.MEDIUM]: {
    value: VulnerabilitySeverity.MEDIUM,
    label: '中危',
    frontColor: '!text-orange-600',
    bgColor: '!bg-orange-600/15',
    borderColor: '!border-orange-600/40',
    frontColorDark: '!text-orange-600',
    bgColorDark: '!bg-orange-600/15',
    borderColorDark: '!border-orange-600/40',
  },
  [VulnerabilitySeverity.HIGH]: {
    value: VulnerabilitySeverity.HIGH,
    label: '高危',
    frontColor: '!text-red-700',
    bgColor: '!bg-red-700/15',
    borderColor: '!border-red-700/40',
    frontColorDark: '!text-red-700',
    bgColorDark: '!bg-red-700/15',
    borderColorDark: '!border-red-700/40',
  },
  [VulnerabilitySeverity.CRITICAL]: {
    value: VulnerabilitySeverity.CRITICAL,
    label: '严重',
    frontColor: '!text-purple-700',
    bgColor: '!bg-purple-700/15',
    borderColor: '!border-purple-700/40',
    frontColorDark: '!text-purple-700',
    bgColorDark: '!bg-purple-700/15',
    borderColorDark: '!border-purple-700/40',
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
    description: '报告正在编辑中，尚未提交审核',
    hint: '草稿',
  },
  [BugReportStatus.PENDING]: {
    value: BugReportStatus.PENDING,
    label: '待审核',
    icon: <ClockIcon />,
    frontColor: '!text-orange-500',
    bgColor: '!bg-orange-500/15',
    description: '报告已提交，正在等待审核人员处理',
    hint: '等待处理的报告',
  },
  [BugReportStatus.IN_REVIEW]: {
    value: BugReportStatus.IN_REVIEW,
    label: '审核中',
    icon: <EyeIcon />,
    frontColor: '!text-blue-600',
    bgColor: '!bg-blue-500/15',
    description: '报告正在审核中，请耐心等待审核结果',
    hint: '正在审核中的漏洞',
  },
  [BugReportStatus.APPROVED]: {
    value: BugReportStatus.APPROVED,
    label: '已通过',
    icon: <CheckIcon />,
    frontColor: '!text-green-600',
    bgColor: '!bg-green-500/15',
    description: '报告已通过审核，漏洞确认有效',
    hint: '已通过审核的漏洞',
  },
  [BugReportStatus.REJECTED]: {
    value: BugReportStatus.REJECTED,
    label: '已驳回',
    icon: <XIcon />,
    frontColor: '!text-red-600',
    bgColor: '!bg-red-500/15',
    description: '报告被驳回，请根据审核意见修改后重新提交',
    hint: '未通过的报告',
  },
  [BugReportStatus.RESOLVED]: {
    value: BugReportStatus.RESOLVED,
    label: '已解决',
    frontColor: '!text-green-700',
    bgColor: '!bg-green-700/15',
    description: '漏洞已修复完成',
    hint: '已解决的漏洞',
  },
  [BugReportStatus.CLOSED]: {
    value: BugReportStatus.CLOSED,
    label: '已关闭',
    frontColor: '!text-muted-foreground',
    bgColor: '!bg-muted-foreground/15',
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
  CLIENT,
}

export const enum TeamRole {
  红 = '红队',
  蓝 = '蓝队',
}

interface TeamRoleConfig extends BaseEnumConfig {
  alias: string
  colorValue: string
}

export const teamConfig = {
  [TeamRole.红]: {
    value: TeamRole.红,
    label: '攻击队',
    alias: '红队',
    colorValue: '#ef4444',
  },
  [TeamRole.蓝]: {
    value: TeamRole.蓝,
    label: '防守队',
    alias: '蓝队',
    colorValue: '#3b82f6',
  },
} satisfies EnumConfig <TeamRole, TeamRoleConfig>

export function getTeamRoleConfig(role?: string): TeamRoleConfig {
  if (role && role in teamConfig) {
    return teamConfig[role as TeamRole]
  }

  return teamConfig[TeamRole.蓝]
}

export function isRedTeam(text?: string): boolean {
  if (text) {
    if (text.includes(TeamRole.红) || text.includes('攻击')) {
      return true
    }
  }

  return false
}

export function isBlueTeam(text?: string): boolean {
  if (text) {
    if (text.includes(TeamRole.蓝) || text.includes('防守')) {
      return true
    }
  }

  return false
}

export function getTeamRole(text?: string): TeamRole {
  if (text) {
    if (isRedTeam(text)) {
      return TeamRole.红
    }

    if (isBlueTeam(text)) {
      return TeamRole.蓝
    }
  }

  return TeamRole.蓝
}
