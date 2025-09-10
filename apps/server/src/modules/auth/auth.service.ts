import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcrypt'
import { plainToInstance } from 'class-transformer'

import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { CreateUserDto } from '~/modules/users/dto/create-user.dto'
import { UsersService } from '~/modules/users/users.service'

import { SafeUserDto } from '../users/dto/base-user.dto'
import { AuthRepository } from './auth.repository'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { JwtPayloadData } from './types/auth.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
  ) {}

  async validateUser(email: CreateUserDto['email'], password: CreateUserDto['password']) {
    const user = await this.usersService.findByEmailWithPassword(email)

    if (!user) {
      throw BusinessException.unauthorized(
        BUSINESS_CODES.INVALID_CREDENTIALS,
        '用户不存在',
      )
    }

    if (!user.isActive) {
      throw BusinessException.unauthorized(
        BUSINESS_CODES.ACCOUNT_DISABLED,
        '用户已禁用',
      )
    }

    // 验证密码是否正确
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash)

    if (!isPasswordValid) {
      throw BusinessException.unauthorized(
        BUSINESS_CODES.INVALID_CREDENTIALS,
        '邮箱或密码错误',
      )
    }

    return plainToInstance(SafeUserDto, user, { excludeExtraneousValues: true })
  }

  async login(user: SafeUserDto) {
    const payload: JwtPayloadData = { sub: user.id, email: user.email }

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = await this.generateRefreshToken(user.id)

    return {
      user,
      accessToken,
      refreshToken,
    }
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword)
  }

  private async generateRefreshToken(userId: SafeUserDto['id']): Promise<string> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30天有效期

    return this.authRepository.createRefreshToken(userId, expiresAt)
  }

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 包含新的访问令牌和刷新令牌的原始数据
   */
  async refreshToken(refreshToken: string) {
    const token = await this.authRepository.findRefreshTokenByToken(refreshToken)

    if (!token || token.revoked || new Date() > token.expiresAt) {
      throw BusinessException.unauthorized(
        BUSINESS_CODES.INVALID_TOKEN,
        '无效的刷新令牌',
      )
    }

    const user = token.user
    const payload: JwtPayloadData = { sub: user.id, email: user.email }

    const accessToken = this.jwtService.sign(payload)
    const newRefreshToken = await this.generateRefreshToken(user.id)

    // 撤销旧的刷新令牌
    await this.authRepository.revokeRefreshToken(token.id)

    return {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  // 请求密码重置
  async requestPasswordReset(email: CreateUserDto['email']) {
    // 查找用户
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw BusinessException.notFound(
        BUSINESS_CODES.USER_NOT_FOUND,
        '用户不存在',
      )
    }

    // 生成密码重置令牌
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1小时有效期
    const token = await this.authRepository.createPasswordResetToken(user.id, expiresAt)

    // 在实际项目中，这里应该发送邮件到用户邮箱
    // 这里仅返回令牌，用于演示
    return { token }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto

    // 检查两次密码是否一致
    if (password !== confirmPassword) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.VALIDATION_ERROR,
        '两次输入的密码不一致',
      )
    }

    // 查找有效的令牌
    const resetToken = await this.authRepository.findPasswordResetToken(token)

    if (!resetToken) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_TOKEN,
        '无效或已过期的密码重置链接',
      )
    }

    // 更新用户密码
    await this.usersService.setPassword(resetToken.userId, password)

    // 标记令牌为已使用
    await this.authRepository.markPasswordResetTokenAsUsed(resetToken.id)

    // 撤销所有刷新令牌
    await this.authRepository.revokeAllUserRefreshTokens(resetToken.userId)

    return null
  }

  async updateProfile(userId: SafeUserDto['id'], updateProfileDto: UpdateProfileDto) {
    const { email, ...profileData } = updateProfileDto

    // 如果要更新邮箱，需要检查邮箱是否已存在
    if (email) {
      const existingUser = await this.usersService.findByEmail(email)

      if (existingUser && existingUser.id !== userId) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.EMAIL_ALREADY_EXISTS,
          '邮箱已被其他用户使用',
        )
      }
    }

    const updateData = {
      ...profileData,
      ...email && { email },
    }

    return await this.usersService.update(userId, updateData, userId)
  }
}
