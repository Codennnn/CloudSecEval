import { Injectable } from '@nestjs/common'

import { Prisma } from '#prisma/client'
import { getPaginationParams } from '~/common/utils/pagination.util'
import { PrismaService } from '~/prisma/prisma.service'

import { CreatePermissionDto } from './dto/permission.dto'

/**
 * 权限数据访问层
 *
 * 封装所有与权限相关的数据库操作
 */
@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionDto) {
    const { resource, action, description } = data
    const slug = `${resource}:${action}`

    return this.prisma.permission.create({
      data: { resource, action, description, slug },
    })
  }

  /**
   * 查找所有权限
   */
  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
    })
  }

  async findAllWithPagination(options?: { page?: number, pageSize?: number }) {
    const { skip, take } = getPaginationParams({
      page: options?.page,
      pageSize: options?.pageSize,
    })

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        orderBy: [
          { resource: 'asc' },
          { action: 'asc' },
        ],
        skip,
        take,
      }),
      this.prisma.permission.count(),
    ])

    return { permissions, total }
  }

  /**
   * 按资源分组获取权限
   */
  async findGroupedByResource() {
    const permissions = await this.findAll()

    const grouped = permissions.reduce<Record<string, typeof permissions>>((acc, permission) => {
      const { resource } = permission

      if (!(resource in acc)) {
        acc[resource] = []
      }

      acc[resource].push(permission)

      return acc
    }, {})

    return grouped
  }

  /**
   * 通过ID查找权限
   */
  async findById(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
    })
  }

  /**
   * 通过slug查找权限
   */
  async findBySlug(slug: string) {
    return this.prisma.permission.findUnique({
      where: { slug },
    })
  }

  /**
   * 批量通过ID查找权限
   */
  async findByIds(ids: string[]) {
    return this.prisma.permission.findMany({
      where: {
        id: { in: ids },
      },
    })
  }

  /**
   * 检查权限是否存在
   */
  async existsBySlug(slug: string, excludeId?: string) {
    const where: Prisma.PermissionWhereInput = { slug }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const permission = await this.prisma.permission.findFirst({
      where,
      select: { id: true },
    })

    return Boolean(permission)
  }

  /**
   * 删除权限
   */
  async delete(id: string) {
    return this.prisma.permission.delete({
      where: {
        id,
        system: false, // 不能删除系统权限
      },
    })
  }

  /**
   * 获取用户的有效权限
   * 通过用户的角色关联查询
   */
  async getUserEffectivePermissions(userId: string, orgId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        orgId,
        // 过滤掉已过期的角色
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })

    // 提取所有权限，去重
    const permissions = new Set<string>()
    const roles: { id: string, name: string, slug: string }[] = []

    userRoles.forEach((userRole) => {
      if (userRole.role.isActive) {
        roles.push({
          id: userRole.role.id,
          name: userRole.role.name,
          slug: userRole.role.slug,
        })

        userRole.role.rolePermissions.forEach((rp) => {
          permissions.add(rp.permission.slug)
        })
      }
    })

    return {
      permissions: Array.from(permissions),
      roles,
    }
  }

  /**
   * 检查权限匹配
   * 支持通配符权限（如 users:* 包含 users:read）
   */
  checkPermissionMatch(userPermissions: string[], requiredPermission: string): boolean {
    // 直接匹配
    if (userPermissions.includes(requiredPermission)) {
      return true
    }

    // 通配符匹配
    const [resource] = requiredPermission.split(':')
    const wildcardPermission = `${resource}:*`

    if (userPermissions.includes(wildcardPermission)) {
      return true
    }

    // 超级管理员权限
    if (userPermissions.includes('admin:*')) {
      return true
    }

    return false
  }

  /**
   * 批量检查权限
   */
  checkMultiplePermissions(
    userPermissions: string[],
    requiredPermissions: string[],
    mode: 'any' | 'all' = 'any',
  ): { hasPermission: boolean, matchedPermissions: string[] } {
    const matchedPermissions: string[] = []

    for (const permission of requiredPermissions) {
      if (this.checkPermissionMatch(userPermissions, permission)) {
        matchedPermissions.push(permission)
      }
    }

    const hasPermission = mode === 'any'
      ? matchedPermissions.length > 0
      : matchedPermissions.length === requiredPermissions.length

    return {
      hasPermission,
      matchedPermissions,
    }
  }
}
