import { Injectable } from '@nestjs/common'

import type { Organization } from '#prisma/client'

import { CreateOrganizationDto } from './dto/create-organization.dto'
import { FindOrganizationsDto } from './dto/find-organizations.dto'
import { UpdateOrganizationDto } from './dto/update-organization.dto'
import { OrganizationsRepository } from './organizations.repository'

@Injectable()
export class OrganizationsService {
  constructor(private readonly orgRepository: OrganizationsRepository) {}

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
}
