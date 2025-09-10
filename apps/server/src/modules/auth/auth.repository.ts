import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

import { PasswordResetToken, RefreshToken, User } from '#prisma/client'
import { PrismaService } from '~/prisma/prisma.service'

import { userDetailSelectFields } from '../users/user.select'

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 刷新令牌相关
  async findRefreshTokenByToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: userDetailSelectFields } },
    })
  }

  async createRefreshToken(userId: User['id'], expiresAt: Date): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex')

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    })

    return token
  }

  async revokeRefreshToken(id: RefreshToken['id']): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    })
  }

  async revokeAllUserRefreshTokens(userId: User['id']): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    })
  }

  // 密码重置相关
  async createPasswordResetToken(userId: User['id'], expiresAt: Date): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex')

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    })

    return token
  }

  async findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })
  }

  async markPasswordResetTokenAsUsed(id: PasswordResetToken['id']): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { used: true },
    })
  }
}
