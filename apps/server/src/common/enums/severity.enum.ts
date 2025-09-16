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
