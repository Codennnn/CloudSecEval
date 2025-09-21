import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Patch, Post, Request, Response, UseGuards } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import type { Response as ExpressResponse } from 'express'

import { DisabledApi } from '~/common/decorators/disabled-api.decorator'
import { resp } from '~/common/utils/response.util'
import jwtConfig from '~/config/configurations/jwt.config'
import { AUTH_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'
import { CreateUserDto } from '~/modules/users/dto/create-user.dto'
import { UsersService } from '~/modules/users/users.service'
import { ExpressRequest } from '~/types/common'

import { SafeUserDto } from '../users/dto/base-user.dto'
import { AuthService } from './auth.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { Public } from './decorators/public.decorator'
import {
  ChangePasswordApiResponseDto,
  LoginApiResponseDto,
  LogoutApiResponseDto,
  PasswordResetRequestApiResponseDto,
  PasswordResetSuccessApiResponseDto,
  ProfileApiResponseDto,
  RefreshTokenApiResponseDto,
  RegisterApiResponseDto,
  TokenVerifyApiResponseDto,
  UpdateProfileApiResponseDto,
} from './dto/auth-response.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/reset-password.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    @Inject(jwtConfig.KEY) private readonly jwtConfigService: ConfigType<typeof jwtConfig>,
  ) {}

  @DisabledApi('用户注册功能暂时禁用，系统维护中')
  @Public()
  @Post('register')
  @ApiDocs(AUTH_API_CONFIG.register)
  async register(@Body() createUserDto: CreateUserDto): Promise<RegisterApiResponseDto> {
    const user = await this.usersService.create(createUserDto)

    return resp({
      msg: '用户注册成功',
      data: { user },
    })
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiDocs(AUTH_API_CONFIG.login)
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: ExpressRequest,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<LoginApiResponseDto> {
    if (req.user) {
      const loginData = await this.authService.login(req.user)

      // 如果启用了 Cookie，则设置 HttpOnly Cookie
      if (this.jwtConfigService.cookie.enabled) {
        this.setCookie(res, loginData.accessToken)
      }

      return resp({
        msg: '登录成功',
        data: loginData,
      })
    }

    throw new Error('登录失败')
  }

  @Public()
  @Post('refresh-token')
  @ApiDocs(AUTH_API_CONFIG.refreshToken)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<RefreshTokenApiResponseDto> {
    const refreshData = await this.authService.refreshToken(refreshTokenDto.refreshToken)

    // 如果启用了 Cookie，则更新 Cookie 中的 accessToken
    if (this.jwtConfigService.cookie.enabled) {
      this.setCookie(res, refreshData.accessToken)
    }

    return resp({
      msg: '令牌刷新成功',
      data: refreshData,
    })
  }

  @Public()
  @Post('request-password-reset')
  @ApiDocs(AUTH_API_CONFIG.requestPasswordReset)
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<PasswordResetRequestApiResponseDto> {
    const resetData = await this.authService.requestPasswordReset(requestPasswordResetDto.email)

    return resp({
      msg: '密码重置链接已发送到您的邮箱',
      data: resetData,
    })
  }

  @Public()
  @Post('reset-password')
  @ApiDocs(AUTH_API_CONFIG.resetPassword)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<PasswordResetSuccessApiResponseDto> {
    await this.authService.resetPassword(resetPasswordDto)

    return resp({
      msg: '密码重置成功，请使用新密码登录',
    })
  }

  @Get('profile')
  @ApiDocs(AUTH_API_CONFIG.getProfile)
  async getProfile(@CurrentUser() user: SafeUserDto): Promise<ProfileApiResponseDto> {
    const userRes = await this.usersService.findOneDetail(user.id)

    return resp({
      msg: '获取用户资料成功',
      data: userRes,
    })
  }

  @Patch('profile')
  @ApiDocs(AUTH_API_CONFIG.updateProfile)
  async updateProfile(
    @CurrentUser() user: SafeUserDto,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UpdateProfileApiResponseDto> {
    const updatedUser = await this.authService.updateProfile(user.id, updateProfileDto)

    return resp({
      msg: '用户资料更新成功',
      data: updatedUser,
    })
  }

  @Patch('change-password')
  @ApiDocs(AUTH_API_CONFIG.changePassword)
  async changePassword(
    @CurrentUser() user: SafeUserDto,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordApiResponseDto> {
    await this.authService.changePassword(user.id, changePasswordDto)

    return resp({
      msg: '密码修改成功，请重新登录',
    })
  }

  @Post('verify-token')
  @ApiDocs(AUTH_API_CONFIG.verifyToken)
  verifyToken(@CurrentUser() user: SafeUserDto): TokenVerifyApiResponseDto {
    return resp({
      msg: '令牌验证成功',
      data: { user },
    })
  }

  @Post('logout')
  @ApiDocs(AUTH_API_CONFIG.logout)
  logout(@Response({ passthrough: true }) res: ExpressResponse): LogoutApiResponseDto {
    // 清除 Cookie
    if (this.jwtConfigService.cookie.enabled) {
      this.clearCookie(res)
    }

    return resp({
      msg: '登出成功',
    })
  }

  /**
   * 设置 JWT Cookie
   */
  private setCookie(res: ExpressResponse, token: string): void {
    const { cookie } = this.jwtConfigService
    const expiresIn = this.parseDuration(this.jwtConfigService.expiresIn)

    res.cookie(cookie.name, token, {
      httpOnly: true,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      domain: cookie.domain === 'localhost' ? undefined : cookie.domain,
      maxAge: expiresIn,
    })
  }

  /**
   * 清除 JWT Cookie
   */
  private clearCookie(res: ExpressResponse): void {
    const { cookie } = this.jwtConfigService

    res.clearCookie(cookie.name, {
      httpOnly: true,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      domain: cookie.domain === 'localhost' ? undefined : cookie.domain,
    })
  }

  /**
   * 解析时间字符串为毫秒
   * @param duration 时间字符串 (如: '1d', '7d', '1w')
   * @returns 毫秒数
   */
  private parseDuration(duration: string): number {
    const match = /^(\d+)([a-zA-Z])$/.exec(duration)

    if (!match) {
      return 24 * 60 * 60 * 1000 // 默认 1 天
    }

    const [, value, unit] = match
    const numValue = parseInt(value, 10)

    switch (unit) {
      case 's': return numValue * 1000

      case 'm': return numValue * 60 * 1000

      case 'h': return numValue * 60 * 60 * 1000

      case 'd': return numValue * 24 * 60 * 60 * 1000

      case 'w': return numValue * 7 * 24 * 60 * 60 * 1000

      default: return 24 * 60 * 60 * 1000 // 默认 1 天
    }
  }
}
