import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'

import { Organization } from '#prisma/client'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { PermissionsRepository } from '~/modules/permissions/permissions.repository'
import { PrismaService } from '~/prisma/prisma.service'

import { CreateRoleDto } from './dto/create-role.dto'
import { AddRoleMembersDto, GetRoleMembersDto } from './dto/get-role-members.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { RolesRepository } from './roles.repository'

/**
 * 角色业务逻辑层
 *
 * 处理角色相关的业务逻辑，不直接操作数据库
 */
@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 创建角色
   */
  async create(orgId: Organization['id'], createRoleDto: CreateRoleDto) {
    // 检查角色标识符是否已存在
    const exists = await this.rolesRepository.existsBySlug(createRoleDto.slug, orgId)

    if (exists) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.DUPLICATE_RESOURCE,
        `角色标识符 "${createRoleDto.slug}" 已存在`,
      )
    }

    // 如果提供了权限列表，验证权限是否存在
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionsRepository.findByIds(createRoleDto.permissionIds)

      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.INVALID_PARAMETER,
          '部分权限ID无效',
        )
      }
    }

    // 创建角色
    const role = await this.rolesRepository.create(orgId, createRoleDto)

    // 如果提供了权限列表，设置角色权限
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      await this.rolesRepository.updateRolePermissions(role.id, createRoleDto.permissionIds)
    }

    return this.findById(role.id, orgId)
  }

  /**
   * 获取角色列表
   */
  async findAll(orgId: string, includeSystem = true) {
    return this.rolesRepository.findAll(orgId, includeSystem)
  }

  /**
   * 获取角色详情
   */
  async findById(id: string, orgId?: string) {
    const role = await this.rolesRepository.findById(id, orgId)

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`)
    }

    return role
  }

  /**
   * 更新角色
   */
  async update(id: string, orgId: string, updateRoleDto: UpdateRoleDto) {
    // 检查角色是否存在且属于该组织
    const existingRole = await this.rolesRepository.findById(id, orgId)

    if (!existingRole) {
      throw new NotFoundException(`角色 ID ${id} 不存在`)
    }

    // 检查是否尝试修改系统角色
    if (existingRole.system) {
      throw new ForbiddenException('不能修改系统内置角色')
    }

    // 如果更新了slug，检查是否冲突
    if (updateRoleDto.slug && updateRoleDto.slug !== existingRole.slug) {
      const exists = await this.rolesRepository.existsBySlug(updateRoleDto.slug, orgId, id)

      if (exists) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.DUPLICATE_RESOURCE,
          `角色标识符 "${updateRoleDto.slug}" 已存在`,
        )
      }
    }

    // 如果提供了权限列表，验证权限是否存在
    if (updateRoleDto.permissionIds) {
      if (updateRoleDto.permissionIds.length > 0) {
        const permissions = await this.permissionsRepository.findByIds(updateRoleDto.permissionIds)

        if (permissions.length !== updateRoleDto.permissionIds.length) {
          throw BusinessException.badRequest(
            BUSINESS_CODES.INVALID_PARAMETER,
            '部分权限 ID 无效',
          )
        }
      }

      // 更新权限关联
      await this.rolesRepository.updateRolePermissions(id, updateRoleDto.permissionIds)
    }

    // 更新角色基本信息
    await this.rolesRepository.update(id, orgId, updateRoleDto)

    return this.findById(id, orgId)
  }

  /**
   * 删除角色
   */
  async remove(id: string, orgId: string) {
    const role = await this.rolesRepository.findById(id, orgId)

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`)
    }

    if (role.system) {
      throw new ForbiddenException('不能删除系统内置角色')
    }

    // TODO: 检查是否有用户正在使用该角色，如果有则提示或转移
    if (typeof role._count.userRoles === 'number' && role._count.userRoles > 0) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.VALIDATION_ERROR,
        `角色 "${role.name}" 正在被 ${role._count.userRoles} 个用户使用，无法删除`,
      )
    }

    await this.rolesRepository.delete(id, orgId)
  }

  /**
   * 获取角色权限
   */
  async getRolePermissions(id: string, orgId?: string) {
    const role = await this.rolesRepository.findById(id, orgId)

    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`)
    }

    return this.rolesRepository.getRolePermissions(id)
  }

  /**
   * 获取角色成员列表（按组织隔离）
   */
  async getRoleMembers(roleId: string, orgId: string, query: GetRoleMembersDto) {
    const role = await this.rolesRepository.findById(roleId, orgId)

    if (!role) {
      throw new NotFoundException(`角色 ID ${roleId} 不存在`)
    }

    return this.rolesRepository.getRoleMembers(roleId, orgId, query)
  }

  /**
   * 克隆角色
   * TODO: 后续实现角色克隆功能
   */
  async cloneRole(id: string, orgId: string, newName: string, newSlug: string) {
    const sourceRole = await this.rolesRepository.findById(id, orgId)

    if (!sourceRole) {
      throw new NotFoundException(`源角色 ID ${id} 不存在`)
    }

    // 获取源角色的权限
    const permissions = await this.rolesRepository.getRolePermissions(id)
    const permissionIds = permissions.map((p) => p.id)

    // 创建新角色
    const createDto: CreateRoleDto = {
      name: newName,
      slug: newSlug,
      description: `克隆自角色: ${sourceRole.name}`,
      permissionIds,
    }

    return this.create(orgId, createDto)
  }

  /**
   * 批量添加成员到角色
   * - 校验角色存在与组织隔离
   * - 校验用户均属于同一组织
   * - 支持统一过期时间与备注
   * - 幂等：使用 createMany + skipDuplicates
   */
  async addMembersToRole(
    roleId: string,
    orgId: string,
    params: AddRoleMembersDto,
  ): Promise<{ added: number, totalRequested: number, skipped: number }> {
    const role = await this.rolesRepository.findById(roleId, orgId)

    if (!role) {
      throw new NotFoundException(`角色 ID ${roleId} 不存在`)
    }

    if (!role.isActive) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.VALIDATION_ERROR,
        '不能向已禁用的角色分配成员',
      )
    }

    const { userIds, expiresAt, note } = params

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_PARAMETER,
        'userIds 不能为空',
      )
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_PARAMETER,
        'expiresAt 必须大于当前时间',
      )
    }

    // 校验用户均属于同一组织
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, orgId },
      select: { id: true },
    })

    if (users.length !== userIds.length) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_PARAMETER,
        '包含不属于该组织的用户或用户不存在',
      )
    }

    // 幂等写入
    const data = userIds.map(
      (userId) => ({
        userId,
        roleId,
        orgId,
        expiresAt: expiresAt ?? null,
        note: note ?? null,
      }),
    )

    const result = await this.prisma.userRole.createMany({
      data,
      skipDuplicates: true,
    })

    const added = result.count
    const totalRequested = userIds.length
    const skipped = totalRequested - added

    return { added, totalRequested, skipped }
  }

  /**
   * 批量从角色移除成员
   * - 幂等：deleteMany
   */
  async removeMembersFromRole(
    roleId: string,
    orgId: string,
    userIds: string[],
  ): Promise<{ removed: number }> {
    const role = await this.rolesRepository.findById(roleId, orgId)

    if (!role) {
      throw new NotFoundException(`角色 ID ${roleId} 不存在`)
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_PARAMETER,
        'userIds 不能为空',
      )
    }

    const result = await this.prisma.userRole.deleteMany({
      where: {
        roleId,
        orgId,
        userId: { in: userIds },
      },
    })

    return { removed: result.count }
  }
}
