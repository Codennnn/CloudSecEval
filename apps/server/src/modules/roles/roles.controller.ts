import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { UuidDto } from '~/common/dto/common.dto'
import { resp, respWithPagination } from '~/common/utils/response.util'
import { ROLES_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'
import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator'
import { PERMISSIONS, RequirePermissions } from '~/modules/permissions/decorators/require-permissions.decorator'
import { PermissionsGuard } from '~/modules/permissions/guards/permissions.guard'
import { SafeUserDto } from '~/modules/users/dto/base-user.dto'

import { CreateRoleDto } from './dto/create-role.dto'
import { AddRoleMembersDto, GetRoleMembersDto, RemoveRoleMembersDto } from './dto/get-role-members.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { RolesService } from './roles.service'

@ApiTags('角色管理')
@Controller('roles')
@UseGuards(PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.roles.create)
  @ApiDocs(ROLES_API_CONFIG.createRole)
  async create(
    @CurrentUser() user: SafeUserDto,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    const role = await this.rolesService.create(user.organization.id, createRoleDto)

    return resp({
      msg: '角色创建成功',
      data: role,
    })
  }

  @Get()
  @RequirePermissions(PERMISSIONS.roles.read)
  @ApiDocs(ROLES_API_CONFIG.getRoles)
  async findAll(
    @CurrentUser() user: SafeUserDto,
    @Query('includeSystem') includeSystem?: string,
  ) {
    const include = includeSystem === 'true' || includeSystem === '1'
    const roles = await this.rolesService.findAll(user.organization.id, include)

    return resp({
      msg: '获取角色列表成功',
      data: roles,
    })
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.roles.read)
  @ApiDocs(ROLES_API_CONFIG.getRoleById)
  async findOne(
    @CurrentUser() user: SafeUserDto,
    @Param() params: UuidDto,
  ) {
    const role = await this.rolesService.findById(params.id, user.organization.id)

    return resp({
      msg: '获取角色详情成功',
      data: role,
    })
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.roles.update)
  @ApiDocs(ROLES_API_CONFIG.updateRole)
  async update(
    @CurrentUser() user: SafeUserDto,
    @Param() params: UuidDto,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(params.id, user.organization.id, updateRoleDto)

    return resp({
      msg: '角色更新成功',
      data: role,
    })
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.roles.delete)
  @ApiDocs(ROLES_API_CONFIG.deleteRole)
  async remove(
    @CurrentUser() user: SafeUserDto,
    @Param() params: UuidDto,
  ) {
    await this.rolesService.remove(params.id, user.organization.id)

    return resp({
      msg: '角色删除成功',
    })
  }

  @Get(':id/permissions')
  @RequirePermissions(PERMISSIONS.roles.read)
  @ApiDocs(ROLES_API_CONFIG.getRolePermissions)
  async getRolePermissions(
    @CurrentUser() user: SafeUserDto,
    @Param() params: UuidDto,
  ) {
    const permissions = await this.rolesService.getRolePermissions(params.id, user.organization.id)

    return resp({
      msg: '获取角色权限成功',
      data: permissions,
    })
  }

  @Get(':id/members')
  @RequirePermissions(PERMISSIONS.roles.read)
  @ApiDocs(ROLES_API_CONFIG.getRoleMembers)
  async getRoleMembers(
    @CurrentUser() user: SafeUserDto,
    @Param() params: UuidDto,
    @Query() query: GetRoleMembersDto,
  ) {
    const result = await this.rolesService.getRoleMembers(
      params.id,
      user.organization.id,
      query,
    )
    const { users, total } = result

    return respWithPagination({
      msg: '获取角色成员列表成功',
      data: users,
      pageOptions: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
    })
  }

  @Post(':id/members')
  @RequirePermissions(PERMISSIONS.roles.update)
  @ApiDocs(ROLES_API_CONFIG.addRoleMembers)
  async addRoleMembers(
    @CurrentUser() user: SafeUserDto,
    @Param() params: UuidDto,
    @Body() body: AddRoleMembersDto,
  ) {
    return resp({
      msg: '添加角色成员成功',
      data: await this.rolesService.addMembersToRole(
        params.id,
        user.organization.id,
        { userIds: body.userIds, expiresAt: body.expiresAt, note: body.note },
      ),
    })
  }

  @Delete(':id/members')
  @RequirePermissions(PERMISSIONS.roles.update)
  @ApiDocs(ROLES_API_CONFIG.removeRoleMembers)
  async removeRoleMembers(
    @CurrentUser() user: SafeUserDto,
    @Param() params: UuidDto,
    @Body() body: RemoveRoleMembersDto,
  ) {
    return resp({
      msg: '移除角色成员成功',
      data: await this.rolesService.removeMembersFromRole(
        params.id,
        user.organization.id,
        body.userIds,
      ),
    })
  }
}
