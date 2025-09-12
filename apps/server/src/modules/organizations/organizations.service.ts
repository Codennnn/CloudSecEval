import { Injectable } from '@nestjs/common'

import type { Organization } from '#prisma/client'
import { FindUsersDto } from '~/modules/users/dto/find-users.dto'
import { UsersService } from '~/modules/users/users.service'

import { CreateOrganizationDto } from './dto/create-organization.dto'
import { FindOrganizationsDto } from './dto/find-organizations.dto'
import { GetOrganizationMembersQueryDto } from './dto/get-organization-members.dto'
import { UpdateOrganizationDto } from './dto/update-organization.dto'
import { OrganizationsRepository } from './organizations.repository'

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly orgRepository: OrganizationsRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const { name, code, remark, isActive } = createOrganizationDto

    const newOrganization = await this.orgRepository.create({
      name,
      code,
      remark,
      isActive,
    })

    return newOrganization
  }

  findAll(query?: FindOrganizationsDto) {
    return this.orgRepository.findWithAdvancedSearch(query)
  }

  findOne(id: Organization['id']) {
    return this.orgRepository.findById(id)
  }

  findByName(name: Organization['name']) {
    return this.orgRepository.findByName(name)
  }

  findByCode(code: Organization['code']) {
    return this.orgRepository.findByCode(code)
  }

  update(id: Organization['id'], updateOrganizationDto: UpdateOrganizationDto) {
    return this.orgRepository.update(id, updateOrganizationDto)
  }

  remove(id: Organization['id']) {
    return this.orgRepository.delete(id)
  }

  /**
   * 获取组织成员列表
   * - 复用 UsersService.findAll 的高级搜索与分页能力
   * - 强制注入 orgId，避免越权
   */
  async getMembers(orgId: string, query: GetOrganizationMembersQueryDto) {
    // 组织存在性校验（与其它接口一致的体验）
    await this.orgRepository.findById(orgId)

    const payload: Record<string, unknown> = { orgId }

    if (query.page !== undefined) {
      payload.page = query.page
    }

    if (query.pageSize !== undefined) {
      payload.pageSize = query.pageSize
    }

    if (query.isActive !== undefined) {
      payload.isActive = query.isActive
    }

    if (query.search?.trim()) {
      payload.search = query.search.trim()
    }

    if (query.departmentId) {
      payload.departmentId = query.departmentId
    }

    if (query.includeDescendants !== undefined) {
      payload.includeDescendants = query.includeDescendants
    }

    const result = await this.usersService.findAll(payload as FindUsersDto)

    return result
  }
}
