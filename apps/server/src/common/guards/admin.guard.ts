import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'

import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { isPublicRoute } from '~/common/utils/guard.util'
import type { ExpressRequest } from '~/types/common'

/**
 * 管理员权限守卫
 * 用于验证当前用户是否具有管理员权限
 *
 * 工作原理：
 * - 兼容模式：优先检查传统的管理员邮箱配置
 * - 权限模式：检查用户是否拥有超级管理员权限
 * - 如果两者都不满足，则抛出权限不足异常
 *
 * 使用方式：
 * @UseGuards(AdminGuard)
 *
 * TODO: 后续完全迁移到权限系统后，可以移除邮箱检查逻辑
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * 验证当前用户是否具有管理员权限
   * @param context 执行上下文
   * @returns 是否允许访问
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公共路由
    if (isPublicRoute(this.reflector, context)) {
      return true
    }

    const request = context.switchToHttp().getRequest<ExpressRequest>()
    const user = request.user

    // 检查用户是否已登录
    if (!user) {
      throw BusinessException.unauthorized(
        BUSINESS_CODES.UNAUTHORIZED,
        '请先登录',
      )
    }

    // 兼容模式：检查管理员邮箱配置
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL')

    if (adminEmail && user.email === adminEmail) {
      return true
    }

    // TODO: 权限模式：检查用户是否拥有超级管理员权限
    // 暂时注释掉，等权限系统完全集成后启用
    /*
    try {
      const permissionsService = request.app?.get?.(PermissionsService)
      if (permissionsService) {
        const permissionCheck = await permissionsService.checkUserPermission(
          user.id,
          user.orgId,
          SYSTEM_PERMISSIONS.SUPER_ADMIN
        )

        if (permissionCheck.hasPermission) {
          return true
        }
      }
    } catch (error) {
      // 权限检查失败，继续使用邮箱检查
      console.warn('权限检查失败，回退到邮箱验证:', error)
    }
    */

    throw BusinessException.forbidden(
      BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
      '权限不足，需要管理员权限',
    )
  }
}
