import { Injectable } from '@nestjs/common'

import { Organization, Prisma } from '#prisma/client'
import { getPaginationParams } from '~/common/utils/pagination.util'
import { userDetailSelectFields } from '~/modules/users/user.select'
import { AdvancedUserSearchBuilder } from '~/modules/users/utils/advanced-user-search-builder.util'
import { PrismaService } from '~/prisma/prisma.service'

import { GetRoleMembersDto } from './dto/get-role-members.dto'
import { UpdateRoleDto } from './dto/update-role.dto'

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: Organization['id'], data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({
      data: {
        ...data,
        organization: {
          connect: { id: orgId },
        },
      },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true,
          },
        },
      },
    })
  }

  /**
   * 查找所有角色（按组织）
   */
  async findAll(orgId: string, includeSystem = true) {
    const where: Prisma.RoleWhereInput = {
      OR: [
        { orgId },
        ...includeSystem ? [{ orgId: null, system: true }] : [],
      ],
    }

    return this.prisma.role.findMany({
      where,
      include: {
        organization: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true,
          },
        },
      },
      orderBy: [
        { system: 'desc' }, // 系统角色优先
        { createdAt: 'desc' },
      ],
    })
  }

  /**
   * 通过ID查找角色
   */
  async findById(id: string, orgId?: string) {
    const where: Prisma.RoleWhereInput = { id }

    // 如果提供了 orgId，则限制查询范围
    if (orgId !== undefined) {
      where.OR = [
        { orgId },
        { orgId: null, system: true }, // 允许访问系统角色
      ]
    }

    return this.prisma.role.findFirst({
      where,
      include: {
        organization: {
          select: { id: true, name: true },
        },
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    })
  }

  /**
   * 通过slug查找角色
   */
  async findBySlug(slug: string, orgId?: string) {
    const where: Prisma.RoleWhereInput = { slug }

    if (orgId !== undefined) {
      where.OR = [
        { orgId, slug },
        { orgId: null, system: true, slug }, // 系统角色
      ]
    }

    return this.prisma.role.findFirst({
      where,
      include: {
        organization: {
          select: { id: true, name: true },
        },
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    })
  }

  /**
   * 更新角色
   */
  async update(id: string, orgId: string, data: UpdateRoleDto) {
    return this.prisma.role.update({
      where: {
        id,
        // 确保只能更新属于该组织的角色（不能更新系统角色）
        orgId,
        system: false,
      },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true,
          },
        },
      },
    })
  }

  /**
   * 删除角色
   */
  async delete(id: string, orgId: string) {
    return this.prisma.role.delete({
      where: {
        id,
        orgId,
        system: false, // 不能删除系统角色
      },
    })
  }

  /**
   * 检查角色是否存在（按slug）
   */
  async existsBySlug(slug: string, orgId: string, excludeId?: string) {
    const where: Prisma.RoleWhereInput = {
      slug,
      OR: [
        { orgId },
        { orgId: null, system: true },
      ],
    }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const role = await this.prisma.role.findFirst({
      where,
      select: { id: true },
    })

    return Boolean(role)
  }

  /**
   * 获取角色的权限列表
   */
  async getRolePermissions(roleId: string) {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    })

    return rolePermissions.map((rp) => rp.permission)
  }

  /**
   * 更新角色权限（完全替换）
   */
  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // 删除现有权限关联
      await tx.rolePermission.deleteMany({
        where: { roleId },
      })

      // 添加新的权限关联
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        })
      }

      // 返回更新后的角色信息
      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      })
    })
  }

  /**
   * 获取角色成员列表（按组织隔离）
   */
  async getRoleMembers(
    roleId: string,
    orgId: Organization['id'],
    query: GetRoleMembersDto,
  ) {
    // 基于高级搜索构建基础 where 与 orderBy
    const searchBuilder = new AdvancedUserSearchBuilder(query)
    let whereCondition = searchBuilder.buildWhere()
    const orderBy = searchBuilder.buildOrderBy()

    // 合并角色成员限定条件（同组织 + 未过期）
    whereCondition = {
      ...whereCondition,
      userRoles: {
        some: {
          roleId,
          orgId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      },
    }

    // 处理包含子孙部门的筛选
    if (query.includeDescendants && query.departmentId) {
      const descendantIds = await this.collectDescendantDepartmentIds(query.departmentId)
      whereCondition = {
        ...whereCondition,
        departmentId: { in: descendantIds },
      }
    }

    const { skip, take } = getPaginationParams({
      page: query.page,
      pageSize: query.pageSize,
    })

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereCondition,
        orderBy,
        skip,
        take,
        select: userDetailSelectFields,
      }),
      this.prisma.user.count({ where: whereCondition }),
    ])

    return {
      users,
      total,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
      },
    }
  }

  /**
   * 获取某部门及其子孙部门的 ID 列表
   * - 复用部门层级关系，服务本仓储的包含子孙部门查询
   */
  private async collectDescendantDepartmentIds(rootDeptId: string): Promise<string[]> {
    const allDepartments = await this.prisma.department.findMany({
      select: { id: true, parentId: true },
    })

    const childrenMap = new Map<string, string[]>()

    for (const dept of allDepartments) {
      const parentId = dept.parentId ?? 'root'
      const children = childrenMap.get(parentId) ?? []
      children.push(dept.id)
      childrenMap.set(parentId, children)
    }

    const result: string[] = []
    const stack = [rootDeptId]

    while (stack.length > 0) {
      const currentId = stack.pop()!
      result.push(currentId)
      const children = childrenMap.get(currentId) ?? []

      for (const childId of children) {
        stack.push(childId)
      }
    }

    return result
  }
}
