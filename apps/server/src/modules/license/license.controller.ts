import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { resp, respWithPagination } from '~/common/utils/response.util'
import { LICENSE_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'
import { Public } from '~/modules/auth/decorators/public.decorator'

import { CheckLicenseDto, CheckUserLicenseDto } from './dto/check-license.dto'
import { CreateLicenseDto } from './dto/create-license.dto'
import { FindLicensesDto } from './dto/find-licenses.dto'
import {
  AdminCheckLicenseApiResponseDto,
  AdminCheckLicenseResponseDataDto,
  CheckLicenseApiResponseDto,
  CheckLicenseResponseDataDto,
  CreateLicenseApiResponseDto,
  CreateLicenseResponseDataDto,
  DeleteLicenseApiResponseDto,
  DeleteLicenseResponseDataDto,
  LicenseDetailApiResponseDto,
  LicenseDetailWithStatsDto,
  LicenseListApiResponseDto,
  LicenseListItemDto,
  LogAccessApiResponseDto,
  LogAccessResponseDataDto,
  SendRemindersApiResponseDto,
  SendRemindersResponseDataDto,
  ToggleLockApiResponseDto,
  ToggleLockResponseDataDto,
  UpdateLicenseApiResponseDto,
  UpdateLicenseResponseDataDto,
} from './dto/license-response.dto'
import { LogAccessDto } from './dto/log-access.dto'
import { ToggleLockLicenseDto } from './dto/toggle-lock-license.dto'
import { UpdateLicenseDto } from './dto/update-license.dto'
import { LicenseService } from './license.service'

@ApiTags('授权码管理')
@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post()
  @ApiDocs(LICENSE_API_CONFIG.createLicense)
  async createLicense(
    @Body() createLicenseDto: CreateLicenseDto,
  ): Promise<CreateLicenseApiResponseDto> {
    const result = await this.licenseService.createLicense(createLicenseDto)

    return resp({
      data: result,
      dto: CreateLicenseResponseDataDto,
      msg: '授权码发放成功，邮件已发送',
    })
  }

  @Get(':id')
  @ApiDocs(LICENSE_API_CONFIG.getLicenseById)
  async getLicenseById(@Param('id') id: string): Promise<LicenseDetailApiResponseDto> {
    const result = await this.licenseService.getLicenseById(id)

    return resp({
      data: result,
      dto: LicenseDetailWithStatsDto,
      msg: '获取授权码详情成功',
    })
  }

  @Patch(':id')
  @ApiDocs(LICENSE_API_CONFIG.updateLicense)
  async updateLicense(@Param('id') id: string, @Body() updateLicenseDto: UpdateLicenseDto): Promise<UpdateLicenseApiResponseDto> {
    const result = await this.licenseService.updateLicense(id, updateLicenseDto)

    return resp({
      data: result,
      dto: UpdateLicenseResponseDataDto,
      msg: '授权码更新成功',
    })
  }

  @Delete(':id')
  @ApiDocs(LICENSE_API_CONFIG.deleteLicense)
  async deleteLicense(@Param('id') id: string): Promise<DeleteLicenseApiResponseDto> {
    const result = await this.licenseService.deleteLicenseById(id)

    return resp({
      data: result,
      dto: DeleteLicenseResponseDataDto,
      msg: '授权码删除成功',
    })
  }

  @Get()
  @ApiDocs(LICENSE_API_CONFIG.getLicenseList)
  async getLicenseList(@Query() query: FindLicensesDto): Promise<LicenseListApiResponseDto> {
    const { licenses, total } = await this.licenseService.getLicenseList(query)

    return respWithPagination({
      data: licenses,
      dto: LicenseListItemDto,
      pageOptions: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
      msg: '获取授权码列表成功',
    })
  }

  @Post('check-license')
  @Public()
  @ApiDocs(LICENSE_API_CONFIG.checkLicense)
  async checkLicense(
    @Body() checkLicenseDto: CheckUserLicenseDto,
    @Req() req: Request,
  ): Promise<CheckLicenseApiResponseDto> {
    // 普通用户验证必须提供邮箱和授权码
    if (!checkLicenseDto.email || !checkLicenseDto.code) {
      return resp({
        data: {
          authorized: false,
          isRisky: false,
        },
        dto: CheckLicenseResponseDataDto,
        msg: '请提供邮箱和授权码',
      })
    }

    const ip = this.getClientIP(req)

    const result = await this.licenseService.checkLicense({
      email: checkLicenseDto.email,
      code: checkLicenseDto.code,
      ip,
    })

    return resp({
      data: {
        authorized: result.authorized,
        isRisky: result.isRisky,
        warning: result.warning ?? null,
      },
      dto: CheckLicenseResponseDataDto,
      msg: result.message,
    })
  }

  @Post('log-access')
  @Public()
  @ApiDocs(LICENSE_API_CONFIG.logAccess)
  async logAccess(
    @Body() logAccessDto: LogAccessDto,
    @Req() req: Request,
  ): Promise<LogAccessApiResponseDto> {
    const ip = this.getClientIP(req)

    const result = await this.licenseService.logAccess(
      logAccessDto.email,
      logAccessDto.code,
      ip,
      logAccessDto.pagePath,
    )

    return resp({
      data: { success: result.success },
      dto: LogAccessResponseDataDto,
      msg: result.message,
    })
  }

  @Post('admin-check-license')
  @ApiDocs(LICENSE_API_CONFIG.adminCheckLicense)
  async adminCheckLicense(
    @Body() checkLicenseDto: CheckLicenseDto,
  ): Promise<AdminCheckLicenseApiResponseDto> {
    const result = await this.licenseService.adminCheckLicense({
      id: checkLicenseDto.id,
      email: checkLicenseDto.email,
      code: checkLicenseDto.code,
    })

    return resp({
      data: result,
      dto: AdminCheckLicenseResponseDataDto,
      msg: '管理员授权码测试完成',
    })
  }

  @Post('toggle-lock')
  @ApiDocs(LICENSE_API_CONFIG.toggleLockLicense)
  async toggleLockLicense(
    @Body() toggleLockLicenseDto: ToggleLockLicenseDto,
  ): Promise<ToggleLockApiResponseDto> {
    const result = await this.licenseService.toggleLockLicense(toggleLockLicenseDto)
    const statusText = result.locked ? '锁定' : '解锁'

    return resp({
      data: result,
      dto: ToggleLockResponseDataDto,
      msg: `已${statusText}授权码`,
    })
  }

  @Post('send-expiration-reminders')
  @ApiDocs(LICENSE_API_CONFIG.sendExpirationReminders)
  async sendExpirationReminders(@Query('days') days?: number): Promise<SendRemindersApiResponseDto> {
    const result = await this.licenseService.sendExpirationReminders(days)

    return resp({
      data: result,
      dto: SendRemindersResponseDataDto,
      msg: `过期提醒发送完成，成功发送 ${result.sent} 个`,
    })
  }

  /**
   * 获取客户端真实 IP 地址
   * 优先从代理头信息中获取，否则使用连接 IP
   * @param req Express 请求对象
   * @returns IP 地址字符串
   */
  private getClientIP(req: Request): string {
    // 优先级顺序：X-Forwarded-For > X-Real-IP > X-Client-IP > connection.remoteAddress
    const forwarded = req.headers['x-forwarded-for'] as string

    if (forwarded) {
      // X-Forwarded-For 可能包含多个 IP，取第一个
      return forwarded.split(',')[0].trim()
    }

    const realIP = req.headers['x-real-ip'] as string

    if (realIP) {
      return realIP
    }

    const clientIP = req.headers['x-client-ip'] as string

    if (clientIP) {
      return clientIP
    }

    // 兜底使用连接 IP
    return req.socket.remoteAddress ?? 'unknown'
  }
}
