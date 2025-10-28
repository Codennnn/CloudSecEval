/**
 * 风险等级枚举
 */
export enum RiskLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * 风险状态枚举
 */
export enum RiskStatus {
  PENDING = 'pending', // 待处理
  PROCESSING = 'processing', // 处理中
  RESOLVED = 'resolved', // 已解决
  IGNORED = 'ignored', // 已忽略
}

/**
 * 风险类型枚举
 */
export enum RiskType {
  WEAK_PASSWORD = 'weak_password', // 弱口令
  SQL_INJECTION = 'sql_injection', // SQL注入
  XSS = 'xss', // 跨站脚本
  CONFIG_ERROR = 'config_error', // 配置错误
  OUTDATED_SOFTWARE = 'outdated_software', // 软件过期
  UNAUTHORIZED_ACCESS = 'unauthorized_access', // 未授权访问
  DATA_LEAK = 'data_leak', // 数据泄露
  PRIVILEGE_ESCALATION = 'privilege_escalation', // 权限提升
}

/**
 * 风险项接口
 */
export interface RiskItem {
  /** 风险唯一标识 */
  id: string
  /** 风险名称 */
  name: string
  /** 风险等级 */
  level: RiskLevel
  /** 风险类型 */
  type: RiskType
  /** 风险状态 */
  status: RiskStatus
  /** 来源（扫描工具/人工发现） */
  source: string
  /** 影响资产列表 */
  affectedAssets: string[]
  /** 风险描述 */
  description: string
  /** 攻击路径（可选） */
  attackPath?: string[]
  /** 修复建议 */
  remediation: string
  /** 发现时间 */
  discoveredAt: string
  /** 更新时间 */
  updatedAt: string
  /** 备注（可选） */
  notes?: string
  /** CVSS 评分（可选） */
  cvssScore?: number
}

/**
 * 风险统计数据接口
 */
export interface RiskStats {
  /** 总风险数 */
  total: number
  /** 高风险数 */
  high: number
  /** 中风险数 */
  medium: number
  /** 低风险数 */
  low: number
  /** 按类型统计 */
  byType: Record<RiskType, number>
  /** 趋势数据（近7天） */
  trend: {
    date: string
    count: number
    high: number
    medium: number
    low: number
  }[]
}

/**
 * 风险等级配置
 */
export const RISK_LEVEL_CONFIG = {
  [RiskLevel.HIGH]: {
    label: '高风险',
    color: 'red',
    bgClass: 'bg-red-50 dark:bg-red-950/20',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-800',
  },
  [RiskLevel.MEDIUM]: {
    label: '中风险',
    color: 'orange',
    bgClass: 'bg-orange-50 dark:bg-orange-950/20',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-200 dark:border-orange-800',
  },
  [RiskLevel.LOW]: {
    label: '低风险',
    color: 'green',
    bgClass: 'bg-green-50 dark:bg-green-950/20',
    textClass: 'text-green-600 dark:text-green-400',
    borderClass: 'border-green-200 dark:border-green-800',
  },
} as const

/**
 * 风险状态配置
 */
export const RISK_STATUS_CONFIG = {
  [RiskStatus.PENDING]: {
    label: '待处理',
    color: 'gray',
    variant: 'secondary' as const,
  },
  [RiskStatus.PROCESSING]: {
    label: '处理中',
    color: 'blue',
    variant: 'default' as const,
  },
  [RiskStatus.RESOLVED]: {
    label: '已解决',
    color: 'green',
    variant: 'default' as const,
  },
  [RiskStatus.IGNORED]: {
    label: '已忽略',
    color: 'gray',
    variant: 'outline' as const,
  },
} as const

/**
 * 风险类型配置
 */
export const RISK_TYPE_CONFIG = {
  [RiskType.WEAK_PASSWORD]: {
    label: '弱口令',
    icon: '🔑',
  },
  [RiskType.SQL_INJECTION]: {
    label: 'SQL注入',
    icon: '💉',
  },
  [RiskType.XSS]: {
    label: '跨站脚本',
    icon: '🔗',
  },
  [RiskType.CONFIG_ERROR]: {
    label: '配置错误',
    icon: '⚙️',
  },
  [RiskType.OUTDATED_SOFTWARE]: {
    label: '软件过期',
    icon: '📦',
  },
  [RiskType.UNAUTHORIZED_ACCESS]: {
    label: '未授权访问',
    icon: '🚫',
  },
  [RiskType.DATA_LEAK]: {
    label: '数据泄露',
    icon: '💧',
  },
  [RiskType.PRIVILEGE_ESCALATION]: {
    label: '权限提升',
    icon: '⬆️',
  },
} as const
