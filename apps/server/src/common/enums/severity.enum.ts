/**
 * 严重性等级枚举定义
 *
 * 用于统一管理漏洞等级、风险等级等相关枚举值
 * 提供类型安全的枚举定义，避免在各个模块中重复声明
 */

/**
 * 漏洞严重性等级枚举
 * 用于漏洞报告、安全扫描等场景
 */
export enum VulnerabilitySeverity {
  /** 信息级别 */
  INFO = 'INFO',
  /** 低危 */
  LOW = 'LOW',
  /** 中危 */
  MEDIUM = 'MEDIUM',
  /** 高危 */
  HIGH = 'HIGH',
  /** 严重 */
  CRITICAL = 'CRITICAL',
}

/**
 * 风险等级枚举
 * 用于许可证管理、资产评估等场景
 */
export enum RiskLevel {
  /** 安全 */
  SAFE = 'SAFE',
  /** 低风险 */
  LOW = 'LOW',
  /** 中等风险 */
  MEDIUM = 'MEDIUM',
  /** 高风险 */
  HIGH = 'HIGH',
}

/**
 * 漏洞严重性等级显示标签
 */
export const VULNERABILITY_SEVERITY_LABELS = {
  [VulnerabilitySeverity.INFO]: '信息',
  [VulnerabilitySeverity.LOW]: '低危',
  [VulnerabilitySeverity.MEDIUM]: '中危',
  [VulnerabilitySeverity.HIGH]: '高危',
  [VulnerabilitySeverity.CRITICAL]: '严重',
} as const

/**
 * 风险等级显示标签
 */
export const RISK_LEVEL_LABELS = {
  [RiskLevel.SAFE]: '安全',
  [RiskLevel.LOW]: '低风险',
  [RiskLevel.MEDIUM]: '中等风险',
  [RiskLevel.HIGH]: '高风险',
} as const

/**
 * 风险等级权重（用于排序和统计）
 */
export const RISK_LEVEL_WEIGHTS = {
  [RiskLevel.SAFE]: 0,
  [RiskLevel.LOW]: 1,
  [RiskLevel.MEDIUM]: 2,
  [RiskLevel.HIGH]: 3,
} as const

/**
 * 风险等级颜色配置（用于前端显示）
 */
export const RISK_LEVEL_COLORS = {
  [RiskLevel.SAFE]: '#10B981', // 绿色
  [RiskLevel.LOW]: '#F59E0B', // 黄色
  [RiskLevel.MEDIUM]: '#EF4444', // 红色
  [RiskLevel.HIGH]: '#7C2D12', // 深红色
} as const

/**
 * 获取所有漏洞严重性等级值的数组
 */
export const VULNERABILITY_SEVERITY_VALUES = Object.values(VulnerabilitySeverity)

/**
 * 获取所有风险等级值的数组
 */
export const RISK_LEVEL_VALUES = Object.values(RiskLevel)

/**
 * 类型定义
 */
export type VulnerabilitySeverityType = `${VulnerabilitySeverity}`
export type RiskLevelType = `${RiskLevel}`
