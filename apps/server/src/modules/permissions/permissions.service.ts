import { Injectable, NotFoundException } from '@nestjs/common'

import { Organization, User } from '#prisma/client'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'

import { PermissionFlag, PermissionMode, RoleMode } from './decorators/require-permissions.decorator'
import { FindPermissionsDto } from './dto/find-permissions.dto'
import { BasePermissionDto, CreatePermissionDto, PermissionGroupDto } from './dto/permission.dto'
import { PermissionsRepository } from './permissions.repository'
import { PermissionCheckResult, UserEffectivePermissions } from './types/role.type'

/**
 * 权限业务逻辑层
 *
 * 处理权限相关的业务逻辑和权限检查
 */
@Injectable()
export class PermissionsService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const slug = `${createPermissionDto.resource}:${createPermissionDto.action}`

    // 检查权限是否已存在
    const exists = await this.permissionsRepository.existsBySlug(slug)

    if (exists) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.DUPLICATE_RESOURCE,
        `权限 "${slug}" 已存在`,
      )
    }

    return this.permissionsRepository.create(createPermissionDto)
  }

  async findWithAdvancedSearch(searchDto?: FindPermissionsDto) {
    return this.permissionsRepository.findWithAdvancedSearch(searchDto)
  }

  /**
   * 获取权限详情
   */
  async findById(id: string) {
    const permission = await this.permissionsRepository.findById(id)

    if (!permission) {
      throw new NotFoundException(`权限 ID ${id} 不存在`)
    }

    return permission
  }

  /**
   * 按资源分组获取权限目录
   */
  async getPermissionGroups(): Promise<PermissionGroupDto[]> {
    const grouped = await this.permissionsRepository.findGroupedByResource()

    // 资源名称映射
    const resourceNames: Record<string, string> = {
      users: '用户管理',
      departments: '部门管理',
      organizations: '组织管理',
      roles: '角色管理',
      permissions: '权限管理',
      statistics: '统计分析',
      licenses: '授权码管理',
      admin: '系统管理',
    }

    return Object.entries(grouped).map(([resource, permissions]) => ({
      resource,
      resourceName: resourceNames[resource] || resource,
      permissions: permissions as BasePermissionDto[],
    }))
  }

  /**
   * 删除权限
   */
  async remove(id: string) {
    const permission = await this.permissionsRepository.findById(id)

    if (!permission) {
      throw new NotFoundException(`权限 ID ${id} 不存在`)
    }

    if (permission.system) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
        '不能删除系统内置权限',
      )
    }

    await this.permissionsRepository.delete(id)
  }

  /**
   * 获取用户有效权限
   */
  async getUserEffectivePermissions(
    userId: string,
    orgId: string,
  ): Promise<UserEffectivePermissions> {
    const result = await this.permissionsRepository.getUserEffectivePermissions(userId, orgId)

    return {
      userId,
      orgId,
      permissions: new Set(result.permissions),
      roles: result.roles,
      cachedAt: new Date(),
    }
  }

  /**
   * 检查用户是否具有指定权限
   */
  async checkUserPermission(
    userId: User['id'],
    orgId: Organization['id'],
    /** 需要检查的权限标识符 */
    requiredPermission: PermissionFlag,
  ): Promise<PermissionCheckResult> {
    const userPermissions = await this.getUserEffectivePermissions(userId, orgId)
    const userPermissionArray = Array.from(userPermissions.permissions)

    const hasPermission = this.permissionsRepository.checkPermissionMatch(
      userPermissionArray,
      requiredPermission,
    )

    return {
      hasPermission,
      matchedPermissions: hasPermission ? [requiredPermission] : [],
      userPermissions: userPermissionArray,
    }
  }

  /**
   * 检查用户是否具有多个权限中的任一个或全部
   */
  async checkUserPermissions(
    userId: User['id'],
    orgId: Organization['id'],
    requiredPermissions: PermissionFlag[],
    mode: PermissionMode = PermissionMode.ANY,
  ): Promise<PermissionCheckResult> {
    const userPermissions = await this.getUserEffectivePermissions(userId, orgId)
    const userPermissionArray = Array.from(userPermissions.permissions)

    const result = this.permissionsRepository.checkMultiplePermissions(
      userPermissionArray,
      requiredPermissions,
      mode,
    )

    return {
      ...result,
      userPermissions: userPermissionArray,
    }
  }

  /**
   * 检查用户是否具有指定角色
   */
  async checkUserRoles(
    userId: User['id'],
    orgId: Organization['id'],
    requiredRoles: string[],
    mode: RoleMode = RoleMode.ANY,
  ): Promise<boolean> {
    const userPermissions = await this.getUserEffectivePermissions(userId, orgId)
    const userRoles = userPermissions.roles.map((role) => role.slug)

    if (mode === RoleMode.ANY) {
      return requiredRoles.some((role) => userRoles.includes(role))
    }
    else {
      return requiredRoles.every((role) => userRoles.includes(role))
    }
  }

  /**
   * 刷新用户权限缓存
   * TODO: 集成Redis缓存时实现
   */
  async refreshUserPermissionsCache(userId: string, orgId: string): Promise<void> {
    // 暂时不实现缓存，直接重新查询
    await this.getUserEffectivePermissions(userId, orgId)
  }

  /**
   * 批量刷新权限缓存
   * TODO: 角色权限变更时调用
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async invalidatePermissionsCache(userIds?: string[], orgId?: string): Promise<void> {
    // TODO: 实现缓存失效逻辑
    // 当角色权限发生变更时，需要使相关用户的权限缓存失效

    // 临时实现：什么都不做
    if (userIds || orgId) {
      // 占位符，避免eslint警告
    }
  }
}
