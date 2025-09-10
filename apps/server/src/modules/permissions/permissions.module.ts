import { Module } from '@nestjs/common'

import { PrismaModule } from '~/prisma/prisma.module'

import { PermissionsGuard } from './guards/permissions.guard'
import { PermissionsController } from './permissions.controller'
import { PermissionsRepository } from './permissions.repository'
import { PermissionsService } from './permissions.service'

@Module({
  imports: [PrismaModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository, PermissionsGuard],
  exports: [PermissionsService, PermissionsRepository, PermissionsGuard],
})
export class PermissionsModule {}
