import {
  type CallHandler,
  type ExecutionContext,
  Injectable, Logger, type NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Observable } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'

import { IS_PUBLIC_KEY } from '~/modules/auth/decorators/public.decorator'
import type { ExpressRequest } from '~/types/common'

import { TenantContext } from '../services/tenant-context.service'

/**
 * 租户上下文拦截器
 *
 * 职责：
 * 1. 从请求中提取用户和组织信息
 * 2. 自动设置租户上下文
 * 3. 记录租户相关的操作日志
 * 4. 处理公开路由（跳过租户上下文设置）
 *
 * 执行顺序：在 JwtAuthGuard 之后、PermissionsGuard 之前执行
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  public readonly logger = new Logger(TenantContextInterceptor.name)

  constructor(
    private readonly tenantContext: TenantContext,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<ExpressRequest>()
    const { user } = request

    // 检查是否为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // 如果不是公开路由且有用户信息，设置租户上下文
    if (!isPublic && user && this.shouldSetTenantContext(user)) {
      this.tenantContext.setContext({
        organizationId: user.organization.id,
        userId: user.id,
        isSuperAdmin: this.checkIsSuperAdmin(user),
      })

      this.logger.debug(
        `租户上下文已注入: orgId=${user.organization.id}, userId=${user.id}`,
      )
    }

    return next.handle().pipe(
      tap(() => {
        // 请求成功，记录审计日志（如果有的话）
        const auditLogs = this.tenantContext.getAuditLogs()

        if (auditLogs.length > 0) {
          this.logger.log(
            `租户操作审计: ${auditLogs.length} 条记录`,
            JSON.stringify(auditLogs),
          )
        }
      }),
      catchError((error) => {
        // 请求失败，记录错误
        this.logTenantOperationError(error)
        throw error
      }),
    )
  }

  /**
   * 检查是否应该设置租户上下文
   */
  private shouldSetTenantContext(user: ExpressRequest['user']): boolean {
    if (!user) {
      return false
    }

    // 检查必要字段
    if (!user.id) {
      this.logger.warn(`用户对象缺少必要字段: id=${user.id}`)

      return false
    }

    if (!user.organization.id) {
      this.logger.warn('用户对象缺少必要字段: organization 或 organization.id')

      return false
    }

    return true
  }

  /**
   * 检查用户是否为超级管理员
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private checkIsSuperAdmin(user: ExpressRequest['user']): boolean {
    // TODO: 实现超级管理员检查逻辑
    // 可以通过用户角色、权限或其他方式判断
    return false
  }

  /**
   * 记录租户操作错误
   */
  private logTenantOperationError(error: unknown): void {
    const userId = this.tenantContext.tryGetUserId()
    const orgId = this.tenantContext.tryGetOrganizationId()
    const errorMessage = this.extractErrorMessage(error)

    this.logger.error(
      `租户操作失败: userId=${userId}, orgId=${orgId}, error=${errorMessage}`,
    )
  }

  /**
   * 从错误对象中提取错误消息
   */
  public extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }

    if (typeof error === 'string') {
      return error
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }

    return '未知错误'
  }
}
