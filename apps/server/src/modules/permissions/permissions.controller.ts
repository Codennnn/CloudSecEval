import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { UuidDto } from '~/common/dto/common.dto'
import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import { resp, respWithPagination } from '~/common/utils/response.util'
import { PERMISSIONS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'

import { RequirePermissions } from './decorators/require-permissions.decorator'
import { CreatePermissionDto } from './dto/permission.dto'
import { PermissionListApiResponseDto } from './dto/permission-response.dto'
import { PermissionsGuard } from './guards/permissions.guard'
import { PermissionsService } from './permissions.service'

@ApiTags('权限管理')
@Controller('permissions')
@UseGuards(PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('permissions:create')
  @ApiDocs(PERMISSIONS_API_CONFIG.createPermission)
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionsService.create(createPermissionDto)

    return resp({
      msg: '权限创建成功',
      data: permission,
    })
  }

  @Get()
  @RequirePermissions('permissions:read')
  @ApiDocs(PERMISSIONS_API_CONFIG.getPermissions)
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PermissionListApiResponseDto> {
    const { permissions, total } = await this.permissionsService.findAllWithPagination({
      page: query.page,
      pageSize: query.pageSize,
    })

    return respWithPagination({
      msg: '获取权限列表成功',
      data: permissions,
      pageOptions: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
    })
  }

  @Get('groups')
  @RequirePermissions('permissions:read')
  @ApiDocs(PERMISSIONS_API_CONFIG.getPermissionGroups)
  async getPermissionGroups() {
    const groups = await this.permissionsService.getPermissionGroups()

    return resp({
      msg: '获取权限分组成功',
      data: groups,
    })
  }

  @Get(':id')
  @RequirePermissions('permissions:read')
  @ApiDocs(PERMISSIONS_API_CONFIG.getPermissionById)
  async findOne(@Param() params: UuidDto) {
    const permission = await this.permissionsService.findById(params.id)

    return resp({
      msg: '获取权限详情成功',
      data: permission,
    })
  }

  @Delete(':id')
  @RequirePermissions('permissions:delete')
  @ApiDocs(PERMISSIONS_API_CONFIG.deletePermission)
  async remove(@Param() params: UuidDto) {
    await this.permissionsService.remove(params.id)

    return resp({
      msg: '权限删除成功',
    })
  }
}
