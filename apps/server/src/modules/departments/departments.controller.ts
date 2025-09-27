import { PERMISSIONS } from '@mono/constants'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { resp, respWithPagination } from '~/common/utils/response.util'
import { DEPARTMENTS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'
import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator'
import { RequirePermissions } from '~/modules/permissions/decorators/require-permissions.decorator'
import { CurrentUserDto } from '~/modules/users/dto/base-user.dto'
import { CreateUserDto } from '~/modules/users/dto/create-user.dto'
import { UserListItemDto, UserResponseDto } from '~/modules/users/dto/user-response.dto'

import { DepartmentsService } from './departments.service'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { CreateUserInDepartmentDto } from './dto/create-user-in-department.dto'
import {
  DepartmentApiResponseDto,
  DepartmentListApiResponseDto,
  DepartmentListItemDto,
  DepartmentMembersApiResponseDto,
  DepartmentResponseDto,
  DepartmentTreeApiResponseDto,
} from './dto/department-response.dto'
import { FindDepartmentsDto } from './dto/find-departments.dto'
import { GetDepartmentMembersDto, GetDepartmentMembersParamsDto } from './dto/get-department-members.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'

@ApiTags('部门管理')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly deptService: DepartmentsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.departments.create)
  @ApiDocs(DEPARTMENTS_API_CONFIG.create)
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentApiResponseDto> {
    const department = await this.deptService.create(createDepartmentDto)

    return resp({
      msg: '部门创建成功',
      data: department,
      dto: DepartmentResponseDto,
    })
  }

  @Get()
  @RequirePermissions(PERMISSIONS.departments.read)
  @ApiDocs(DEPARTMENTS_API_CONFIG.findAllDepartments)
  async findAllDepartments(
    @Query() query: FindDepartmentsDto,
  ): Promise<DepartmentListApiResponseDto> {
    const result = await this.deptService.findAll(query)
    const { departments, total } = result

    return respWithPagination({
      msg: '获取部门列表成功',
      data: departments,
      pageOptions: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
      dto: DepartmentListItemDto,
    })
  }

  @Get('online-stats')
  @RequirePermissions([
    PERMISSIONS.bug_reports.stats,
    PERMISSIONS.bug_reports.client_manage,
  ])
  @ApiDocs(DEPARTMENTS_API_CONFIG.getDepartmentOnlineStats)
  async getDepartmentOnlineStats(
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const stats = await this.deptService.getDepartmentOnlineStats(currentUser.organization.id)

    return resp({
      msg: '获取部门在线人数统计成功',
      data: stats,
    })
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.departments.read)
  @ApiDocs(DEPARTMENTS_API_CONFIG.findDepartment)
  async findDepartment(@Param('id') id: string): Promise<DepartmentApiResponseDto> {
    const department = await this.deptService.findOne(id)

    return resp({
      msg: '获取部门详情成功',
      data: department,
      dto: DepartmentResponseDto,
    })
  }

  @Get('organizations/:orgId/tree')
  @RequirePermissions(PERMISSIONS.departments.read)
  @ApiDocs(DEPARTMENTS_API_CONFIG.getDepartmentTree)
  async getDepartmentTree(@Param('orgId') orgId: string): Promise<DepartmentTreeApiResponseDto> {
    const tree = await this.deptService.getDepartmentTree(orgId)

    return resp({
      msg: '获取部门树成功',
      data: tree,
    })
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.departments.update)
  @ApiDocs(DEPARTMENTS_API_CONFIG.update)
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentApiResponseDto> {
    const department = await this.deptService.update(id, updateDepartmentDto)

    return resp({
      msg: '部门更新成功',
      data: department,
      dto: DepartmentResponseDto,
    })
  }

  @Get(':departmentId/members')
  @RequirePermissions(PERMISSIONS.departments.read)
  @ApiDocs(DEPARTMENTS_API_CONFIG.getDepartmentMembers)
  async getDepartmentMembers(
    @Param() params: GetDepartmentMembersParamsDto,
    @Query() query: GetDepartmentMembersDto,
  ): Promise<DepartmentMembersApiResponseDto> {
    const result = await this.deptService.getDepartmentMembers(params.departmentId, query)
    const { users, total } = result

    return respWithPagination({
      msg: '获取部门成员列表成功',
      data: users,
      pageOptions: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
      dto: UserListItemDto,
    })
  }

  @Post(':departmentId/users')
  @RequirePermissions([PERMISSIONS.departments.update, PERMISSIONS.users.create])
  @ApiDocs(DEPARTMENTS_API_CONFIG.createUserInDepartment)
  async createUserInDepartment(
    @Param() params: GetDepartmentMembersParamsDto,
    @Body() body: CreateUserInDepartmentDto,
  ) {
    const department = await this.deptService.findOne(params.departmentId)

    const merged: CreateUserDto = Object.assign({}, body, {
      orgId: department.organization.id,
      departmentId: department.id,
    })

    const user = await this.deptService.createUserInDepartment(merged)

    return resp({
      msg: '用户创建成功',
      data: user,
      dto: UserResponseDto,
    })
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.departments.delete)
  @ApiDocs(DEPARTMENTS_API_CONFIG.removeDepartment)
  async removeDepartment(@Param('id') id: string): Promise<DepartmentApiResponseDto> {
    const result = await this.deptService.remove(id)

    return resp({
      msg: '部门删除成功',
      data: result,
      dto: DepartmentResponseDto,
    })
  }
}
