import { PERMISSIONS } from '@mono/constants'
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { UuidDto } from '~/common/dto/common.dto'
import { resp, respWithPagination } from '~/common/utils/response.util'
import { PERMISSIONS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'

import { RequirePermissions } from './decorators/require-permissions.decorator'
import { FindPermissionsDto } from './dto/find-permissions.dto'
import { CreatePermissionDto } from './dto/permission.dto'
import { PermissionListApiResponseDto } from './dto/permission-response.dto'
import { PermissionsService } from './permissions.service'

@ApiTags('权限管理')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.permissions.create)
  @ApiDocs(PERMISSIONS_API_CONFIG.createPermission)
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionsService.create(createPermissionDto)

    return resp({
      msg: '权限创建成功',
      data: permission,
    })
  }

  @Get()
  @RequirePermissions(PERMISSIONS.permissions.read)
  @ApiDocs(PERMISSIONS_API_CONFIG.getPermissions)
  async findAll(
    @Query() query: FindPermissionsDto,
  ): Promise<PermissionListApiResponseDto> {
    const result = await this.permissionsService.findWithAdvancedSearch(query)

    return respWithPagination({
      msg: '获取权限列表成功',
      data: result.permissions,
      pageOptions: {
        total: result.total,
        page: query.page,
        pageSize: query.pageSize,
      },
    })
  }

  @Get('groups')
  @RequirePermissions(PERMISSIONS.permissions.read)
  @ApiDocs(PERMISSIONS_API_CONFIG.getPermissionGroups)
  async getPermissionGroups() {
    const groups = await this.permissionsService.getPermissionGroups()

    return resp({
      msg: '获取权限分组成功',
      data: groups,
    })
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.permissions.read)
  @ApiDocs(PERMISSIONS_API_CONFIG.getPermissionById)
  async findOne(@Param() params: UuidDto) {
    const permission = await this.permissionsService.findById(params.id)

    return resp({
      msg: '获取权限详情成功',
      data: permission,
    })
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.permissions.delete)
  @ApiDocs(PERMISSIONS_API_CONFIG.deletePermission)
  async remove(@Param() params: UuidDto) {
    await this.permissionsService.remove(params.id)

    return resp({
      msg: '权限删除成功',
    })
  }
}
