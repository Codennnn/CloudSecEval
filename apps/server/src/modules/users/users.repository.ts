import { Injectable } from '@nestjs/common'

import type { Department, Organization, Prisma, User } from '#prisma/client'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { getPaginationParams } from '~/common/utils/pagination.util'
import { PrismaService } from '~/prisma/prisma.service'

import { FindUsersDto } from './dto/find-users.dto'
import { userDetailSelectFields, userWithPasswordSelectFields } from './user.select'
import { AdvancedUserSearchBuilder } from './utils/advanced-user-search-builder.util'

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      select: userDetailSelectFields,
    })
  }

  findByEmail(email: User['email']) {
    return this.prisma.user.findUnique({
      where: { email },
      select: userDetailSelectFields,
    })
  }

  findByEmailWithPassword(email: User['email']) {
    return this.prisma.user.findUnique({
      where: { email },
      select: userWithPasswordSelectFields,
    })
  }

  async findById(id: User['id']) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userDetailSelectFields,
    })

    if (!user) {
      throw BusinessException.notFound(
        BUSINESS_CODES.USER_NOT_FOUND,
        `用户 ID ${id} 不存在`,
      )
    }

    return user
  }

  update(id: User['id'], data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: userDetailSelectFields,
    })
  }

  delete(id: User['id']) {
    return this.prisma.user.delete({
      where: { id },
      select: userDetailSelectFields,
    })
  }

  /**
   * 搜索用户（支持高级搜索功能）
   *
   * @description 返回原始的用户数据和分页信息，不包装响应格式
   * @param searchDto 搜索参数
   * @returns 包含用户列表、总数和分页参数的原始数据
   */
  async findWithAdvancedSearch(searchDto?: FindUsersDto) {
    const searchBuilder = new AdvancedUserSearchBuilder(searchDto ?? {})

    // 构建基础查询条件
    let whereCondition = searchBuilder.buildWhere()
    const orderBy = searchBuilder.buildOrderBy()

    // 如果需要包含子孙部门的用户，先获取所有相关部门 ID
    if (searchDto?.includeDescendants && searchDto.departmentId) {
      const descendantIds = await this.collectDescendantDepartmentIds(searchDto.departmentId)
      whereCondition = {
        ...whereCondition,
        departmentId: { in: descendantIds },
      }
    }

    const { skip, take } = getPaginationParams({
      page: searchDto?.page,
      pageSize: searchDto?.pageSize,
    })

    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: whereCondition,
          orderBy,
          skip,
          take,
          select: userDetailSelectFields,
        }),
        this.prisma.user.count({
          where: whereCondition,
        }),
      ])

      return {
        users,
        total,
        pagination: {
          page: searchDto?.page,
          pageSize: searchDto?.pageSize,
        },
      }
    }
    catch {
      throw BusinessException.internalServerError(
        BUSINESS_CODES.INTERNAL_SERVER_ERROR,
        '用户搜索失败',
      )
    }
  }

  /**
   * 获取某部门及其子孙部门的 ID 列表
   * - 用于支持包含子孙部门的用户查询
   * - 复用部门模块的逻辑
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

  /**
   * 根据组织 ID 查询组织（最小选择集）
   */
  findOrganizationById(id: Organization['id']) {
    return this.prisma.organization.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    })
  }

  /**
   * 根据部门 ID 查询部门（最小选择集）
   */
  findDepartmentById(id: Department['id']) {
    return this.prisma.department.findUnique({
      where: { id },
      select: { id: true, orgId: true, isActive: true },
    })
  }
}
