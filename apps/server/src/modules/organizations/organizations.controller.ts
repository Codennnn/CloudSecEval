import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { resp, respWithPagination } from '~/common/utils/response.util'
import { ORGANIZATIONS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'
import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator'
import { PERMISSIONS, RequirePermissions } from '~/modules/permissions/decorators/require-permissions.decorator'
import { UserListApiResponseDto, UserListItemDto } from '~/modules/users/dto/user-response.dto'

import { CreateOrganizationDto } from './dto/create-organization.dto'
import { FindOrganizationsDto } from './dto/find-organizations.dto'
import { GetOrganizationMembersQueryDto } from './dto/get-organization-members.dto'
import {
  OrganizationApiResponseDto,
  OrganizationListApiResponseDto,
  OrganizationListItemDto,
  OrganizationResponseDto,
} from './dto/organization-response.dto'
import { UpdateOrganizationDto } from './dto/update-organization.dto'
import { OrganizationsService } from './organizations.service'

@ApiTags('组织管理')
@Controller('orgs')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.organizations.create)
  @ApiDocs(ORGANIZATIONS_API_CONFIG.create)
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationApiResponseDto> {
    const organization = await this.orgService.create(createOrganizationDto)

    return resp({
      msg: '组织创建成功',
      data: organization,
      dto: OrganizationResponseDto,
    })
  }

  @Get()
  @RequirePermissions(PERMISSIONS.organizations.read)
  @ApiDocs(ORGANIZATIONS_API_CONFIG.findAllOrganizations)
  async findAllOrganizations(
    @Query() query: FindOrganizationsDto,
  ): Promise<OrganizationListApiResponseDto> {
    const result = await this.orgService.findAll(query)
    const { organizations, total } = result

    return respWithPagination({
      msg: '获取组织列表成功',
      data: organizations,
      pageOptions: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
      dto: OrganizationListItemDto,
    })
  }

  @Get('members')
  @RequirePermissions(PERMISSIONS.organizations.read)
  @ApiDocs(ORGANIZATIONS_API_CONFIG.getOrganizationMembers)
  async getOrganizationMembers(
    @CurrentUser() user: unknown,
    @Query() query: GetOrganizationMembersQueryDto,
  ): Promise<UserListApiResponseDto> {
    const u = user as { organization?: { id?: string }, orgId?: string }
    const orgId = u.organization?.id ?? u.orgId ?? ''

    const { users, total } = await this.orgService.getMembers(orgId, query)

    return respWithPagination({
      msg: '获取组织成员列表成功',
      data: users,
      pageOptions: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
      dto: UserListItemDto,
    })
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.organizations.read)
  @ApiDocs(ORGANIZATIONS_API_CONFIG.findOrganization)
  async findOrganization(@Param('id') id: string): Promise<OrganizationApiResponseDto> {
    const organization = await this.orgService.findOne(id)

    return resp({
      msg: '获取组织详情成功',
      data: organization,
      dto: OrganizationResponseDto,
    })
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.organizations.update)
  @ApiDocs(ORGANIZATIONS_API_CONFIG.update)
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationApiResponseDto> {
    const organization = await this.orgService.update(id, updateOrganizationDto)

    return resp({
      msg: '组织更新成功',
      data: organization,
      dto: OrganizationResponseDto,
    })
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.organizations.delete)
  @ApiDocs(ORGANIZATIONS_API_CONFIG.removeOrganization)
  async removeOrganization(@Param('id') id: string): Promise<OrganizationApiResponseDto> {
    const result = await this.orgService.remove(id)

    return resp({
      msg: '组织删除成功',
      data: result,
      dto: OrganizationResponseDto,
    })
  }
}
