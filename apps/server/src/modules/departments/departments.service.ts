import { Injectable } from '@nestjs/common'

import type { Department, Prisma } from '#prisma/client'
import { CreateUserDto } from '~/modules/users/dto/create-user.dto'
import { UsersService } from '~/modules/users/users.service'

import { DepartmentsRepository, type DepartmentUpdateBusinessOpts } from './departments.repository'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { FindDepartmentsDto } from './dto/find-departments.dto'
import { GetDepartmentMembersDto } from './dto/get-department-members.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly deptRepository: DepartmentsRepository,
    private readonly usersService: UsersService,
  ) {}

  create(createDepartmentDto: CreateDepartmentDto) {
    return this.deptRepository.create(createDepartmentDto)
  }

  findAll(query?: FindDepartmentsDto) {
    return this.deptRepository.findWithAdvancedSearch(query)
  }

  findOne(id: Department['id']) {
    return this.deptRepository.findById(id)
  }

  getDepartmentTree(orgId: Department['orgId']) {
    return this.deptRepository.getDepartmentTree(orgId)
  }

  async update(id: Department['id'], dto: UpdateDepartmentDto) {
    const data: Prisma.DepartmentUpdateInput = {}

    if (dto.name !== undefined) {
      data.name = dto.name
    }

    if (dto.remark !== undefined) {
      data.remark = dto.remark
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId) {
        data.parent = { connect: { id: dto.parentId } }
      }
      else {
        data.parent = { disconnect: true }
      }
    }

    const opts: DepartmentUpdateBusinessOpts = {}

    if (dto.parentId !== undefined) {
      opts.parentId = dto.parentId
    }

    if (dto.name !== undefined) {
      opts.name = dto.name
    }

    return await this.deptRepository.update(id, data, opts)
  }

  remove(id: Department['id']) {
    return this.deptRepository.delete(id)
  }

  getDescendantIds(departmentId: Department['id']) {
    return this.deptRepository.collectDescendantIds(departmentId)
  }

  getDepartmentMembers(departmentId: Department['id'], query: GetDepartmentMembersDto) {
    return this.deptRepository.getDepartmentMembers(departmentId, query)
  }

  /**
   * 在指定部门下创建用户（由部门推导组织）
   */
  async createUserInDepartment(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }
}
