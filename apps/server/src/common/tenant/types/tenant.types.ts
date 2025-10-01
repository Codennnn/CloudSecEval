/**
 * 租户上下文配置
 *
 * 用于初始化租户上下文时传入的配置信息
 */
export interface TenantContextConfig {
  /**
   * 组织 ID
   */
  organizationId: string

  /**
   * 用户 ID
   */
  userId: string

  /**
   * 是否为超级管理员
   */
  isSuperAdmin?: boolean
}

/**
 * 租户审计日志
 *
 * 记录绕过租户隔离的操作，用于审计和追踪
 */
export interface TenantAuditLog {
  /**
   * 操作名称
   */
  action: string

  /**
   * 绕过原因
   */
  reason: string

  /**
   * 操作时间
   */
  timestamp: Date

  /**
   * 操作用户 ID
   */
  userId?: string

  /**
   * 是否为系统级操作
   */
  isSystemOperation?: boolean
}

/**
 * 绕过租户隔离的原因配置
 */
export interface BypassReason {
  /**
   * 操作名称
   */
  action: string

  /**
   * 绕过原因说明
   */
  reason: string

  /**
   * 是否为系统级操作
   */
  isSystemOperation?: boolean
}

/**
 * 租户隔离错误
 *
 * 当违反租户隔离规则时抛出此错误
 */
export class TenantIsolationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TenantIsolationError'
  }
}

/**
 * 租户感知的模型接口
 *
 * 所有需要租户隔离的数据模型都应该包含这个字段
 */
export interface TenantAwareModel {
  orgId: string
}

/**
 * 租户查询选项
 */
export interface TenantQueryOptions {
  include?: unknown
  orderBy?: unknown
  skip?: number
  take?: number
}

/**
 * 租户创建选项
 */
export interface TenantCreateOptions {
  include?: unknown
  autoInjectOrgId?: boolean
}

/**
 * 租户更新选项
 */
export interface TenantUpdateOptions {
  include?: unknown
  verifyOwnership?: boolean
}

/**
 * 租户删除选项
 */
export interface TenantDeleteOptions {
  verifyOwnership?: boolean
}
