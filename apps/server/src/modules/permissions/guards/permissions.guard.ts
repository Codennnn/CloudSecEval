import { BUSINESS_CODES, PermissionFlag, PermissionMode, SYSTEM_PERMISSIONS } from '@mono/constants'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { BusinessException } from '~/common/exceptions/business.exception'
import { isPublicRoute } from '~/common/utils/guard.util'
import { ExpressRequest } from '~/types/common'

import {
  PermissionMetadata,
  PERMISSIONS_KEY,
} from '../decorators/require-permissions.decorator'
import { PermissionsService } from '../permissions.service'

/**
 * 权限守卫
 *
 * 基于权限的访问控制守卫
 * 配合 @RequirePermissions 装饰器使用
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isPublicRoute(this.reflector, context)) {
      return true
    }

    const request = context.switchToHttp().getRequest<ExpressRequest>()
    const user = request.user

    if (!user) {
      throw BusinessException.unauthorized(
        BUSINESS_CODES.UNAUTHORIZED,
        '请先登录',
      )
    }

    const handler = context.getHandler()

    // 获取权限要求（可能为 undefined）
    const permissionMetadata = this.reflector.get<PermissionMetadata | undefined>(
      PERMISSIONS_KEY,
      handler,
    )

    const { id: userId, organization } = user

    try {
      // 检查是否有全局超级管理员权限快速放行
      const allowSuperAdmin = permissionMetadata
        ? permissionMetadata.options.allowSuperAdmin
        : true

      if (allowSuperAdmin) {
        const superAdminResult = await this.permissionsService.checkUserPermission(
          userId,
          organization.id,
          SYSTEM_PERMISSIONS.SUPER_ADMIN as PermissionFlag,
        )

        if (superAdminResult.hasPermission) {
          return true
        }
      }

      // 检查权限要求（若声明了权限要求）
      if (permissionMetadata) {
        const hasPermission = await this.checkPermissions(
          userId,
          organization.id,
          permissionMetadata,
        )

        if (!hasPermission) {
          throw BusinessException.forbidden(
            BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
            '权限不足',
          )
        }
      }

      return true
    }
    catch (err) {
      // 如果是业务异常，直接抛出
      if (err instanceof BusinessException) {
        throw err
      }

      // 其他错误，包装为权限不足
      throw BusinessException.forbidden(
        BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
        '权限验证失败',
      )
    }
  }

  /**
   * 检查权限要求
   */
  private async checkPermissions(
    userId: string,
    orgId: string,
    metadata: PermissionMetadata,
  ): Promise<boolean> {
    const { permissions, options } = metadata
    const { mode = PermissionMode.ANY, allowSuperAdmin = true } = options

    // 检查是否有超级管理员权限（如果允许）
    if (allowSuperAdmin) {
      const superAdminResult = await this.permissionsService.checkUserPermission(
        userId,
        orgId,
        SYSTEM_PERMISSIONS.SUPER_ADMIN as PermissionFlag,
      )

      if (superAdminResult.hasPermission) {
        return true
      }
    }

    // 检查具体权限
    const result = await this.permissionsService.checkUserPermissions(
      userId,
      orgId,
      permissions,
      mode,
    )

    return result.hasPermission
  }
}
