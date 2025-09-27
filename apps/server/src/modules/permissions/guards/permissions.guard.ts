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

    // 根据 permission key 获取权限
    const permissionMetadata = this.reflector.get<PermissionMetadata | undefined>(
      PERMISSIONS_KEY,
      handler,
    )

    const { id: userId, organization } = user

    try {
      if (permissionMetadata) {
        const { permissions, options } = permissionMetadata
        const { mode = PermissionMode.ANY, allowSuperAdmin = true } = options

        const { hasPermission } = await this.permissionsService.checkUserPermissions(
          userId,
          organization.id,
          [
            ...permissions,
            // 如果允许超级管理员，则添加超级管理员权限
            ...allowSuperAdmin
              ? [SYSTEM_PERMISSIONS.SUPER_ADMIN as PermissionFlag]
              : [],
          ],
          mode,
        )

        if (!hasPermission) {
          throw BusinessException.forbidden(
            BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
            '权限不足',
          )
        }
      }
      else {
        // 如果没有权限元数据，默认检查超级管理员权限
        const superAdminResult = await this.permissionsService.checkUserPermission(
          userId,
          organization.id,
          SYSTEM_PERMISSIONS.SUPER_ADMIN as PermissionFlag,
        )

        if (!superAdminResult.hasPermission) {
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
}
