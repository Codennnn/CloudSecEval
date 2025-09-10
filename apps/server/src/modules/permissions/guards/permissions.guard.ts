import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { isPublicRoute } from '~/common/utils/guard.util'
import { ExpressRequest } from '~/types/common'

import {
  PermissionMetadata,
  PermissionMode,
  PERMISSIONS_KEY,
  RoleMetadata,
  RoleMode,
  ROLES_KEY,
} from '../decorators/require-permissions.decorator'
import { PermissionsService } from '../permissions.service'

/**
 * 权限守卫
 *
 * 基于角色和权限的访问控制守卫
 * 配合 @RequirePermissions 和 @RequireRoles 装饰器使用
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

    // 获取权限与角色要求（可能为 undefined）
    const permissionMetadata = this.reflector.get<PermissionMetadata | undefined>(
      PERMISSIONS_KEY,
      handler,
    )

    const roleMetadata = this.reflector.get<RoleMetadata | undefined>(
      ROLES_KEY,
      handler,
    )

    const { id: userId, organization } = user

    try {
      // 若两个维度均允许超级管理员，则进行一次全局 admin:* 快速放行
      const allowSuperAdminForPermissions = permissionMetadata
        ? permissionMetadata.options.allowSuperAdmin
        : true
      const allowSuperAdminForRoles = roleMetadata
        ? roleMetadata.options.allowSuperAdmin
        : true
      const allowSuperAdminGlobally = allowSuperAdminForPermissions && allowSuperAdminForRoles

      if (allowSuperAdminGlobally) {
        const superAdminResult = await this.permissionsService.checkUserPermission(
          userId,
          organization.id,
          'admin:*',
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

      // 检查角色要求（若声明了角色要求）
      if (roleMetadata) {
        const hasRole = await this.checkRoles(
          userId,
          organization.id,
          roleMetadata,
        )

        if (!hasRole) {
          throw BusinessException.forbidden(
            BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
            '角色权限不足',
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
        'admin:*',
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

  /**
   * 检查角色要求
   */
  private async checkRoles(
    userId: string,
    orgId: string,
    metadata: RoleMetadata,
  ): Promise<boolean> {
    const { roles, options } = metadata
    const { mode = RoleMode.ANY, allowSuperAdmin = true } = options

    // 检查是否有超级管理员权限（如果允许）
    if (allowSuperAdmin) {
      const superAdminResult = await this.permissionsService.checkUserPermission(
        userId,
        orgId,
        'admin:*',
      )

      if (superAdminResult.hasPermission) {
        return true
      }
    }

    return this.permissionsService.checkUserRoles(
      userId,
      orgId,
      roles,
      mode,
    )
  }
}
