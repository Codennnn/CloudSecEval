import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AdminGuard } from '~/common/guards/admin.guard'
import { resp, respWithPagination } from '~/common/utils/response.util'
import { ORGANIZATIONS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'

import { CreateOrganizationDto } from './dto/create-organization.dto'
import { FindOrganizationsDto } from './dto/find-organizations.dto'
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
@UseGuards(AdminGuard)
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
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

  @Get(':id')
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
