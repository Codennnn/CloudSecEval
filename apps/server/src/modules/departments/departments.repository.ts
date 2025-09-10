import { Injectable } from '@nestjs/common'

import type { Department, Prisma } from '#prisma/client'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { getPaginationParams } from '~/common/utils/pagination.util'
import { userDetailSelectFields } from '~/modules/users/user.select'
import { PrismaService } from '~/prisma/prisma.service'

import {
  departmentDetailSelectFields,
  departmentListSelectFields,
  departmentTreeSelectFields,
} from './department.select'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { DepartmentTreeNodeDto } from './dto/department-response.dto'
import { FindDepartmentsDto } from './dto/find-departments.dto'
import { GetDepartmentMembersDto } from './dto/get-department-members.dto'
import { AdvancedDepartmentSearchBuilder } from './utils/advanced-department-search-builder.util'

export interface DepartmentUpdateBusinessOpts {
  parentId?: string | null
  name?: string
}

@Injectable()
export class DepartmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建部门
   * - 检查组织是否存在
   * - 检查上级部门是否存在且属于同一组织
   * - 检查同一父级下部门名称的唯一性
   */
  async create(data: CreateDepartmentDto) {
    // 检查组织是否存在
    const organization = await this.prisma.organization.findUnique({
      where: { id: data.orgId },
      select: { id: true },
    })

    if (!organization) {
      throw BusinessException.notFound(
        BUSINESS_CODES.ORGANIZATION_NOT_FOUND,
        `组织 ID ${data.orgId} 不存在`,
      )
    }

    // 如果指定了上级部门，检查上级部门是否存在且属于同一组织
    if (data.parentId) {
      const parentDepartment = await this.prisma.department.findUnique({
        where: { id: data.parentId },
        select: { id: true, orgId: true },
      })

      if (!parentDepartment) {
        throw BusinessException.notFound(
          BUSINESS_CODES.DEPARTMENT_NOT_FOUND,
          `上级部门 ID ${data.parentId} 不存在`,
        )
      }

      if (parentDepartment.orgId !== data.orgId) {
        throw BusinessException.forbidden(
          BUSINESS_CODES.DEPARTMENT_MOVE_TO_DIFFERENT_ORG,
          '上级部门必须属于同一组织',
        )
      }
    }

    // 检查同一父级下部门名称的唯一性
    const existingDepartment = await this.prisma.department.findFirst({
      where: {
        orgId: data.orgId,
        parentId: data.parentId ?? null,
        name: data.name,
      },
      select: { id: true },
    })

    if (existingDepartment) {
      throw BusinessException.conflict(
        BUSINESS_CODES.DEPARTMENT_NAME_EXISTS,
        `部门名称 "${data.name}" 在当前层级下已存在`,
      )
    }

    return this.prisma.department.create({
      data: {
        organization: { connect: { id: data.orgId } },
        parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
        name: data.name,
        remark: data.remark,
        isActive: data.isActive ?? true,
      },
      select: departmentDetailSelectFields,
    })
  }

  async findById(id: Department['id']) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      select: departmentDetailSelectFields,
    })

    if (!department) {
      throw BusinessException.notFound(
        BUSINESS_CODES.DEPARTMENT_NOT_FOUND,
        `部门 ID ${id} 不存在`,
      )
    }

    return department
  }

  /**
   * 更新部门信息
   * - 检查上级部门的有效性和循环引用
   * - 检查同一父级下部门名称的唯一性
   * - 返回更新后的部门详情
   */
  async update(
    id: Department['id'],
    data: Prisma.DepartmentUpdateInput,
    opts?: DepartmentUpdateBusinessOpts,
  ) {
    // 使用单个事务保证“读-校验-写”的原子性
    return this.prisma.$transaction(async (tx) => {
      // 获取当前部门核心字段（使用事务客户端）
      const current = await tx.department.findUnique({
        where: { id },
        select: { id: true, orgId: true, parentId: true },
      })

      if (!current) {
        throw BusinessException.notFound(
          BUSINESS_CODES.DEPARTMENT_NOT_FOUND,
          `部门 ID ${id} 不存在`,
        )
      }

      // 如果更新上级部门，进行相关检查（基于业务参数 parentId）
      if (opts && Object.prototype.hasOwnProperty.call(opts, 'parentId')) {
        await this.validateParentUpdate(tx, id, opts.parentId ?? null, current)
      }

      // 如果更新名称，检查同一父级下的唯一性（基于业务参数 name + parentId）
      if (
        opts
        && Object.prototype.hasOwnProperty.call(opts, 'name')
        && opts.name
      ) {
        const parentIdToCheck = (
          opts.parentId !== undefined ? opts.parentId : current.parentId
        ) ?? null

        await this.validateNameUniqueness(tx, {
          departmentId: id,
          name: opts.name,
          parentId: parentIdToCheck,
          orgId: current.orgId,
        })
      }

      return tx.department.update({
        where: { id },
        data,
        select: departmentDetailSelectFields,
      })
    })
  }

  /**
   * 验证父级部门更新的有效性（在事务内使用）
   */
  private async validateParentUpdate(
    tx: Prisma.TransactionClient,
    departmentId: string,
    newParentId: string | null,
    currentDepartment: { orgId: string, parentId: string | null },
  ) {
    // 检查是否形成循环引用
    if (newParentId && await this.wouldCreateCycle(tx, departmentId, newParentId)) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.DEPARTMENT_CYCLE_DETECTED,
        '部门层级不能形成循环',
      )
    }

    // 如果新的上级部门不为空，检查其是否存在且属于同一组织
    if (newParentId) {
      const parentDepartment = await tx.department.findUnique({
        where: { id: newParentId },
        select: { id: true, orgId: true },
      })

      if (!parentDepartment) {
        throw BusinessException.notFound(
          BUSINESS_CODES.DEPARTMENT_NOT_FOUND,
          `上级部门 ID ${newParentId} 不存在`,
        )
      }

      if (parentDepartment.orgId !== currentDepartment.orgId) {
        throw BusinessException.forbidden(
          BUSINESS_CODES.DEPARTMENT_MOVE_TO_DIFFERENT_ORG,
          '不能将部门移动到其他组织',
        )
      }
    }
  }

  /**
   * 验证部门名称在同一父级下的唯一性（在事务内使用）
   */
  private async validateNameUniqueness(
    tx: Prisma.TransactionClient,
    params: {
      departmentId: string
      name: string
      parentId: string | null
      orgId: string
    },
  ) {
    const existingDepartment = await tx.department.findFirst({
      where: {
        orgId: params.orgId,
        parentId: params.parentId,
        name: params.name,
        id: { not: params.departmentId },
      },
      select: { id: true },
    })

    if (existingDepartment) {
      throw BusinessException.conflict(
        BUSINESS_CODES.DEPARTMENT_NAME_EXISTS,
        `部门名称 "${params.name}" 在当前层级下已存在`,
      )
    }
  }

  async delete(id: Department['id']) {
    // 检查部门下是否有子部门
    const childrenCount = await this.prisma.department.count({
      where: { parentId: id },
    })

    if (childrenCount > 0) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.DEPARTMENT_HAS_CHILDREN,
        `部门下存在 ${childrenCount} 个子部门，无法删除`,
      )
    }

    // 检查部门下是否有用户
    const userCount = await this.prisma.user.count({
      where: { departmentId: id },
    })

    if (userCount > 0) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.DEPARTMENT_HAS_USERS,
        `部门下存在 ${userCount} 个用户，无法删除`,
      )
    }

    return this.prisma.department.delete({
      where: { id },
      select: departmentDetailSelectFields,
    })
  }

  /**
   * 检查是否会形成循环引用
   * - 递归检查指定部门的所有子孙部门
   * - 如果新的上级部门是当前部门的子孙，则会形成循环
   */
  private async wouldCreateCycle(
    tx: Prisma.TransactionClient,
    departmentId: string,
    newParentId: string,
  ): Promise<boolean> {
    if (departmentId === newParentId) {
      return true
    }

    const descendantIds = await this.collectDescendantIdsWithTx(tx, departmentId)

    return descendantIds.includes(newParentId)
  }

  /**
   * 事务内获取某部门及其子孙部门的 ID 列表
   */
  private async collectDescendantIdsWithTx(
    tx: Prisma.TransactionClient,
    rootDeptId: string,
  ): Promise<string[]> {
    const allDepartments = await tx.department.findMany({
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
   * 获取某部门及其子孙部门的ID列表
   * - 使用递归查询构建部门树
   * - 返回包含指定部门及其所有子孙部门的ID数组
   */
  async collectDescendantIds(rootDeptId: string): Promise<string[]> {
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
   * 获取组织的部门树
   * - 构建完整的部门层次结构
   * - 支持递归展示所有层级
   */
  async getDepartmentTree(orgId: string) {
    const departments = await this.prisma.department.findMany({
      where: { orgId, isActive: true },
      select: departmentTreeSelectFields,
      orderBy: { name: 'asc' },
    })

    return this.buildDepartmentTree(departments as unknown as DepartmentTreeNodeDto[])
  }

  /**
   * 构建部门树结构
   * - 递归构建树形结构
   * - 将扁平的部门列表转换为树形结构
   */
  private buildDepartmentTree(
    departments: DepartmentTreeNodeDto[],
    parentId?: CreateDepartmentDto['parentId'],
  ): DepartmentTreeNodeDto[] {
    return departments
      .filter((dept) => dept.parent?.id === parentId)
      .map((dept) => ({
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...dept,
        children: this.buildDepartmentTree(departments, dept.id),
      }))
  }

  /**
   * 搜索部门（支持高级搜索功能）
   * - 返回原始的部门数据和分页信息，不包装响应格式
   * - 支持全文搜索、字段筛选、排序和分页
   * - 支持包含子孙部门的查询
   */
  async findWithAdvancedSearch(searchDto?: FindDepartmentsDto) {
    const searchBuilder = new AdvancedDepartmentSearchBuilder(searchDto ?? {})

    // 构建基础查询条件
    let whereCondition = searchBuilder.buildWhere()
    const orderBy = searchBuilder.buildOrderBy()

    // 如果需要包含子孙部门，先获取所有相关部门ID
    if (searchDto?.includeDescendants && searchDto.parentId) {
      const descendantIds = await this.collectDescendantIds(searchDto.parentId)
      whereCondition = {
        ...whereCondition,
        id: { in: descendantIds },
      }
    }

    const { skip, take } = getPaginationParams({
      page: searchDto?.page,
      pageSize: searchDto?.pageSize,
    })

    try {
      const [departments, total] = await Promise.all([
        this.prisma.department.findMany({
          where: whereCondition,
          orderBy,
          skip,
          take,
          select: departmentListSelectFields,
        }),
        this.prisma.department.count({
          where: whereCondition,
        }),
      ])

      return {
        departments,
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
        '部门搜索失败',
      )
    }
  }

  async getDepartmentMembers(
    departmentId: string,
    query: GetDepartmentMembersDto,
  ) {
    // 验证部门是否存在
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, name: true },
    })

    if (!department) {
      throw BusinessException.notFound(
        BUSINESS_CODES.DEPARTMENT_NOT_FOUND,
        `部门 ID ${departmentId} 不存在`,
      )
    }

    const { includeChildren, isActive, search } = query

    // 确定要查询的部门ID列表
    let departmentIds = [departmentId]

    if (includeChildren) {
      departmentIds = await this.collectDescendantIds(departmentId)
    }

    // 构建查询条件
    const whereCondition: Prisma.UserWhereInput = {
      departmentId: { in: departmentIds },
    }

    // 添加状态筛选
    if (isActive !== undefined) {
      whereCondition.isActive = isActive
    }

    // 添加搜索条件（姓名或邮箱）
    if (search?.trim()) {
      whereCondition.OR = [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ]
    }

    const { skip, take } = getPaginationParams({
      page: query.page,
      pageSize: query.pageSize,
    })

    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: whereCondition,
          orderBy: [
            { isActive: 'desc' }, // 活跃用户优先
            { name: 'asc' }, // 按姓名排序
            { createdAt: 'desc' }, // 最新创建的优先
          ],
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
        department,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
        },
      }
    }
    catch {
      throw BusinessException.internalServerError(
        BUSINESS_CODES.INTERNAL_SERVER_ERROR,
        '获取部门成员失败',
      )
    }
  }
}
