import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'

import { DisabledApi } from '~/common/decorators/disabled-api.decorator'
import { ExcelExportService, type ExportColumn } from '~/common/services/excel-export.service'
import { encodeRFC5987Filename, resp, respWithPagination } from '~/common/utils/response.util'
import { USERS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'
import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator'
import { PERMISSIONS, RequirePermissions } from '~/modules/permissions/decorators/require-permissions.decorator'
import { PermissionsGuard } from '~/modules/permissions/guards/permissions.guard'
import { AvatarValidationPipe } from '~/modules/uploads/pipes/file-validation.pipe'

import { CreateUserDto } from './dto/create-user.dto'
import { FindUsersDto } from './dto/find-users.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserApiResponseDto, UserListApiResponseDto } from './dto/user-response.dto'
import { UsersService } from './users.service'

@ApiTags('用户管理')
@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly excelExportService: ExcelExportService,
  ) {}

  @Post()
  @RequirePermissions(PERMISSIONS.users.create)
  @ApiDocs(USERS_API_CONFIG.create)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserApiResponseDto> {
    const user = await this.usersService.create(createUserDto)

    return resp({
      msg: '用户创建成功',
      data: user,
    })
  }

  @Get()
  @RequirePermissions(PERMISSIONS.users.read)
  @ApiDocs(USERS_API_CONFIG.findAllUsers)
  async findAllUsers(@Query() query: FindUsersDto): Promise<UserListApiResponseDto> {
    const result = await this.usersService.findAll(query)
    const { users, total } = result

    return respWithPagination({
      msg: '获取用户列表成功',
      data: users,
      pageOptions: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
    })
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.users.read)
  @ApiDocs(USERS_API_CONFIG.findUser)
  async findUser(@Param('id') id: string): Promise<UserApiResponseDto> {
    const user = await this.usersService.findOneDetail(id)

    return resp({
      msg: '获取用户详情成功',
      data: user,
    })
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.users.update)
  @ApiDocs(USERS_API_CONFIG.update)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<UserApiResponseDto> {
    const user = await this.usersService.update(id, updateUserDto, currentUserId)

    return resp({
      msg: '用户更新成功',
      data: user,
    })
  }

  @DisabledApi('用户删除功能暂时禁用，等待安全审核')
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.users.delete)
  @ApiDocs(USERS_API_CONFIG.removeUser)
  async removeUser(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<UserApiResponseDto> {
    const result = await this.usersService.remove(id, currentUserId)

    return resp({
      msg: '用户删除成功',
      data: result,
    })
  }

  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @RequirePermissions(PERMISSIONS.users.update)
  @ApiDocs(USERS_API_CONFIG.updateAvatar)
  async updateAvatar(
    @Param('id') id: string,
    @UploadedFile(AvatarValidationPipe) file: Express.Multer.File,
  ): Promise<UserApiResponseDto> {
    const user = await this.usersService.updateAvatarFromFile(id, file)

    return resp({
      msg: '头像更新成功',
      data: user,
    })
  }

  @Get('export')
  @RequirePermissions(PERMISSIONS.users.export)
  @ApiOperation({ summary: '导出用户列表（Excel）' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportUsers(
    @Query() query: FindUsersDto,
    @Res() res: Response,
  ): Promise<void> {
    // 文件名（RFC5987 编码）
    const fileName = `users-${new Date().toISOString().slice(0, 10)}.xlsx`
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeRFC5987Filename(fileName)}`)

    // 列定义，可提取为常量或支持前端 columns 覆盖
    const columns: readonly ExportColumn[] = [
      { key: 'id', header: '用户 ID', width: 26 },
      { key: 'email', header: '邮箱', width: 28 },
      { key: 'name', header: '姓名', width: 16 },
      { key: 'role.name', header: '角色', width: 14 },
      {
        key: 'createdAt',
        header: '创建时间',
        width: 20,
        transform: (row: unknown) => {
          const value = (row as { createdAt?: string | Date }).createdAt
          const date = typeof value === 'string' ? new Date(value) : value

          return date instanceof Date && !Number.isNaN(date.getTime())
            ? date.toISOString().replace('T', ' ').substring(0, 19)
            : ''
        },
      },
    ]

    // 简单版：中等规模数据，分页分批流式写入，避免一次性占用内存
    const MAX_ROWS = 50000
    const BATCH_SIZE = 2000

    const usersService = this.usersService
    const baseQuery = query

    async function* batchIterator(): AsyncIterable<readonly unknown[]> {
      let fetched = 0

      while (fetched < MAX_ROWS) {
        const page = Math.floor(fetched / BATCH_SIZE) + 1
        const pagingQuery = new FindUsersDto()
        Object.assign(pagingQuery, baseQuery, { page, pageSize: BATCH_SIZE })

        const { users } = await usersService.findAll(pagingQuery)

        if (users.length === 0) {
          break
        }

        yield users
        fetched += users.length

        if (users.length < BATCH_SIZE) {
          break
        }
      }
    }

    await this.excelExportService.exportStream(
      batchIterator(),
      res,
      {
        fileName,
        sheetName: 'Users',
        columns,
        streaming: true,
      },
    )

    res.end()
  }
}
