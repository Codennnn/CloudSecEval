import { BUSINESS_CODES, PermissionFlag, PermissionMode } from '@mono/constants'
import { Injectable, NotFoundException } from '@nestjs/common'

import { Organization, User } from '#prisma/client'
import { BusinessException } from '~/common/exceptions/business.exception'

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
    userId: User['id'],
    orgId: Organization['id'],
  ): Promise<UserEffectivePermissions> {
    const { permissions, roles }
      = await this.permissionsRepository.getUserEffectivePermissions(userId, orgId)

    return {
      userId,
      orgId,
      permissions,
      roles,
    }
  }

  /**
   * 检查用户是否具有指定权限
   */
  async checkUserPermission(
    userId: User['id'],
    orgId: Organization['id'],
    requiredPermission: PermissionFlag,
  ): Promise<PermissionCheckResult> {
    const userPermissions = await this.getUserEffectivePermissions(userId, orgId)

    const hasPermission = this.permissionsRepository.checkPermissionMatch(
      userPermissions.permissions,
      requiredPermission,
    )

    return {
      hasPermission,
      matchedPermissions: hasPermission ? [requiredPermission] : [],
      userPermissions: userPermissions.permissions,
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

    const result = this.permissionsRepository.checkMultiplePermissions(
      userPermissions.permissions,
      requiredPermissions,
      mode,
    )

    return {
      ...result,
      userPermissions: userPermissions.permissions,
    }
  }
}
