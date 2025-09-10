import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import jwtConfig from '~/config/configurations/jwt.config'
import { JwtConfig } from '~/config/schemas/types'

import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
      useFactory: (config: JwtConfig) => ({
        secret: config.secret,
        signOptions: {
          expiresIn: config.expiresIn,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,

    LocalStrategy,
    JwtStrategy,

    LocalAuthGuard,
    JwtAuthGuard,
  ],
  exports: [AuthService, LocalAuthGuard, JwtAuthGuard],
})
export class AuthModule {}
