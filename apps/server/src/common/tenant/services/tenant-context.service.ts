import { BUSINESS_CODES } from '@mono/constants'
import { Injectable, Logger, Scope } from '@nestjs/common'

import { BusinessException } from '~/common/exceptions/business.exception'

import {
  type BypassReason,
  type TenantAuditLog,
  type TenantContextConfig } from '../types/tenant.types'

/**
 * 租户上下文服务
 *
 * 职责：
 * 1. 管理请求作用域的租户上下文（组织 ID、用户 ID 等）
 * 2. 提供类型安全的上下文访问方法
 * 3. 支持临时绕过租户隔离（用于系统级操作）
 * 4. 提供审计日志功能
 *
 * @scope REQUEST - 每个请求都有独立的实例，确保租户上下文隔离
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  private readonly logger = new Logger(TenantContext.name)

  /**
   * 当前租户的组织 ID
   */
  private organizationId?: string

  /**
   * 当前用户 ID
   */
  private userId?: string

  /**
   * 是否为超级管理员
   */
  private isSuperAdmin = false

  /**
   * 是否临时绕过租户隔离
   */
  private bypassTenantIsolation = false

  /**
   * 审计日志记录
   */
  private auditLogs: TenantAuditLog[] = []

  /**
   * 设置租户上下文
   *
   * @param config 租户上下文配置
   */
  setContext(config: TenantContextConfig): void {
    this.organizationId = config.organizationId
    this.userId = config.userId
    this.isSuperAdmin = config.isSuperAdmin ?? false

    this.logger.debug(
      `租户上下文已设置: orgId=${this.organizationId}, userId=${this.userId}, isSuperAdmin=${this.isSuperAdmin}`,
    )
  }

  /**
   * 获取组织 ID（必须存在）
   *
   * @throws {BusinessException} 如果组织 ID 未设置
   */
  getOrganizationId(): string {
    if (!this.organizationId) {
      throw new BusinessException(
        BUSINESS_CODES.UNAUTHORIZED,
        '租户上下文未初始化：组织 ID 不存在',
      )
    }

    return this.organizationId
  }

  /**
   * 尝试获取组织 ID（可能不存在）
   *
   * @returns 组织 ID 或 undefined
   */
  tryGetOrganizationId(): string | undefined {
    return this.organizationId
  }

  /**
   * 获取用户 ID（必须存在）
   *
   * @throws {BusinessException} 如果用户 ID 未设置
   */
  getUserId(): string {
    if (!this.userId) {
      throw new BusinessException(
        BUSINESS_CODES.UNAUTHORIZED,
        '租户上下文未初始化：用户 ID 不存在',
      )
    }

    return this.userId
  }

  /**
   * 尝试获取用户 ID（可能不存在）
   *
   * @returns 用户 ID 或 undefined
   */
  tryGetUserId(): string | undefined {
    return this.userId
  }

  /**
   * 检查是否为超级管理员
   */
  isSuperAdminUser(): boolean {
    return this.isSuperAdmin
  }

  /**
   * 检查是否启用了绕过租户隔离
   */
  isBypassEnabled(): boolean {
    return this.bypassTenantIsolation
  }

  /**
   * 临时绕过租户隔离执行操作（异步版本）
   *
   * 使用场景：
   * - 系统级的批量操作
   * - 跨组织的数据统计
   * - 管理员的全局查询
   *
   * @param reason 绕过原因（用于审计）
   * @param callback 需要执行的回调函数
   * @returns 回调函数的返回值
   */
  async runWithoutTenantIsolation<T>(
    reason: BypassReason,
    callback: () => Promise<T>,
  ): Promise<T> {
    const wasEnabled = this.bypassTenantIsolation

    try {
      this.bypassTenantIsolation = true

      // 记录审计日志
      this.addAuditLog({
        action: reason.action,
        reason: reason.reason,
        timestamp: new Date(),
        userId: this.userId,
        isSystemOperation: reason.isSystemOperation,
      })

      this.logger.warn(
        `临时绕过租户隔离: ${reason.action} - ${reason.reason} (userId=${this.userId})`,
      )

      return await callback()
    }
    finally {
      // 恢复之前的状态
      this.bypassTenantIsolation = wasEnabled
    }
  }

  /**
   * 临时绕过租户隔离执行操作（同步版本）
   *
   * @param reason 绕过原因（用于审计）
   * @param callback 需要执行的回调函数
   * @returns 回调函数的返回值
   */
  runWithoutTenantIsolationSync<T>(reason: BypassReason, callback: () => T): T {
    const wasEnabled = this.bypassTenantIsolation

    try {
      this.bypassTenantIsolation = true

      // 记录审计日志
      this.addAuditLog({
        action: reason.action,
        reason: reason.reason,
        timestamp: new Date(),
        userId: this.userId,
        isSystemOperation: reason.isSystemOperation,
      })

      this.logger.warn(
        `临时绕过租户隔离(同步): ${reason.action} - ${reason.reason} (userId=${this.userId})`,
      )

      return callback()
    }
    finally {
      // 恢复之前的状态
      this.bypassTenantIsolation = wasEnabled
    }
  }

  /**
   * 验证资源是否属于当前租户
   *
   * @param resourceOrgId 资源的组织 ID
   * @param resourceType 资源类型（用于错误提示）
   * @throws {BusinessException} 如果资源不属于当前租户
   */
  verifyResourceOwnership(resourceOrgId: string, resourceType = '资源'): void {
    // 如果启用了绕过，则跳过验证
    if (this.bypassTenantIsolation) {
      return
    }

    const currentOrgId = this.getOrganizationId()

    if (resourceOrgId !== currentOrgId) {
      this.logger.error(
        `租户隔离违规: 尝试访问其他组织的${resourceType} (当前orgId=${currentOrgId}, 资源orgId=${resourceOrgId}, userId=${this.userId})`,
      )

      throw new BusinessException(
        BUSINESS_CODES.FORBIDDEN,
        `无权访问该${resourceType}：资源不属于当前组织`,
      )
    }
  }

  /**
   * 添加审计日志
   */
  private addAuditLog(log: TenantAuditLog): void {
    this.auditLogs.push(log)
  }

  /**
   * 获取审计日志
   */
  getAuditLogs(): readonly TenantAuditLog[] {
    return [...this.auditLogs]
  }

  /**
   * 获取当前上下文的快照（用于调试）
   */
  snapshot() {
    return {
      organizationId: this.organizationId,
      userId: this.userId,
      isSuperAdmin: this.isSuperAdmin,
      bypassEnabled: this.bypassTenantIsolation,
      auditLogCount: this.auditLogs.length,
    }
  }
}
