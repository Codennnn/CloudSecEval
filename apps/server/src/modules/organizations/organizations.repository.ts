import { BUSINESS_CODES } from '@mono/constants'
import { Injectable } from '@nestjs/common'

import type { Organization, Prisma } from '#prisma/client'
import { BusinessException } from '~/common/exceptions/business.exception'
import { getPaginationParams } from '~/common/utils/pagination.util'
import { PrismaService } from '~/prisma/prisma.service'

import { CreateOrganizationDto } from './dto/create-organization.dto'
import { FindOrganizationsDto } from './dto/find-organizations.dto'
import { organizationDetailSelectFields, organizationListSelectFields } from './organization.select'
import { AdvancedOrganizationSearchBuilder } from './utils/advanced-organization-search-builder.util'

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrganizationDto) {
    const existingOrgByName = await this.prisma.organization.findUnique({
      where: { name: data.name },
      select: { id: true },
    })

    if (existingOrgByName) {
      throw BusinessException.conflict(
        BUSINESS_CODES.ORGANIZATION_NAME_EXISTS,
        `组织名称 "${data.name}" 已存在`,
      )
    }

    const existingOrgByCode = await this.prisma.organization.findUnique({
      where: { code: data.code },
      select: { id: true },
    })

    if (existingOrgByCode) {
      throw BusinessException.conflict(
        BUSINESS_CODES.ORGANIZATION_CODE_EXISTS,
        `组织编码 "${data.code}" 已存在`,
      )
    }

    return this.prisma.organization.create({
      data: {
        name: data.name,
        code: data.code,
        remark: data.remark,
        isActive: data.isActive ?? true,
      },
      select: organizationDetailSelectFields,
    })
  }

  async findById(id: Organization['id']) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: organizationDetailSelectFields,
    })

    if (!organization) {
      throw BusinessException.notFound(
        BUSINESS_CODES.ORGANIZATION_NOT_FOUND,
        `组织 ID ${id} 不存在`,
      )
    }

    return organization
  }

  findByName(name: Organization['name']) {
    return this.prisma.organization.findUnique({
      where: { name },
      select: organizationDetailSelectFields,
    })
  }

  findByCode(code: Organization['code']) {
    return this.prisma.organization.findUnique({
      where: { code },
      select: organizationDetailSelectFields,
    })
  }

  async update(id: Organization['id'], data: Prisma.OrganizationUpdateInput) {
    // 如果更新名称，检查是否与其他组织冲突
    if (data.name && typeof data.name === 'string') {
      const existingOrgByName = await this.prisma.organization.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
        select: { id: true },
      })

      if (existingOrgByName) {
        throw BusinessException.conflict(
          BUSINESS_CODES.ORGANIZATION_NAME_EXISTS,
          `组织名称 "${data.name}" 已存在`,
        )
      }
    }

    // 如果更新编码，检查是否与其他组织冲突
    if (data.code && typeof data.code === 'string') {
      const existingOrgByCode = await this.prisma.organization.findFirst({
        where: {
          code: data.code,
          id: { not: id },
        },
        select: { id: true },
      })

      if (existingOrgByCode) {
        throw BusinessException.conflict(
          BUSINESS_CODES.ORGANIZATION_CODE_EXISTS,
          `组织编码 "${data.code}" 已存在`,
        )
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data,
      select: organizationDetailSelectFields,
    })
  }

  /**
   * 删除组织
   * - 检查组织下是否存在部门
   * - 检查组织下是否存在用户
   * - 只有空组织才能被删除
   */
  async delete(id: Organization['id']) {
    // 检查组织下是否有部门
    const departmentCount = await this.prisma.department.count({
      where: { orgId: id },
    })

    if (departmentCount > 0) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.ORGANIZATION_HAS_DEPARTMENTS,
        `组织下存在 ${departmentCount} 个部门，无法删除`,
      )
    }

    // 检查组织下是否有用户
    const userCount = await this.prisma.user.count({
      where: { orgId: id },
    })

    if (userCount > 0) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.ORGANIZATION_HAS_USERS,
        `组织下存在 ${userCount} 个用户，无法删除`,
      )
    }

    return this.prisma.organization.delete({
      where: { id },
      select: organizationDetailSelectFields,
    })
  }

  /**
   * 搜索组织（支持高级搜索功能）
   * - 返回原始的组织数据和分页信息，不包装响应格式
   * - 支持全文搜索、字段筛选、排序和分页
   */
  async findWithAdvancedSearch(searchDto?: FindOrganizationsDto) {
    const searchBuilder = new AdvancedOrganizationSearchBuilder(searchDto ?? {})

    // 构建查询条件
    const whereCondition = searchBuilder.buildWhere()
    const orderBy = searchBuilder.buildOrderBy()

    const { skip, take } = getPaginationParams({
      page: searchDto?.page,
      pageSize: searchDto?.pageSize,
    })

    try {
      const [organizations, total] = await Promise.all([
        this.prisma.organization.findMany({
          where: whereCondition,
          orderBy,
          skip,
          take,
          select: organizationListSelectFields,
        }),
        this.prisma.organization.count({
          where: whereCondition,
        }),
      ])

      return {
        organizations,
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
        '组织搜索失败',
      )
    }
  }
}
