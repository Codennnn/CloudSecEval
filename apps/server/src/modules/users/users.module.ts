import { Module } from '@nestjs/common'

import { CommonModule } from '~/common/common.module'
import { PermissionsModule } from '~/modules/permissions/permissions.module'
import { UploadsModule } from '~/modules/uploads/uploads.module'
import { PrismaModule } from '~/prisma/prisma.module'

import { UsersController } from './users.controller'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

@Module({
  imports: [
    PrismaModule,
    PermissionsModule,
    UploadsModule,
    CommonModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
