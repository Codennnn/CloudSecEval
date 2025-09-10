import { Module } from '@nestjs/common'

import { PermissionsModule } from '~/modules/permissions/permissions.module'
import { PrismaModule } from '~/prisma/prisma.module'

import { RolesController } from './roles.controller'
import { RolesRepository } from './roles.repository'
import { RolesService } from './roles.service'

@Module({
  imports: [PrismaModule, PermissionsModule],
  controllers: [RolesController],
  providers: [
    RolesService,
    RolesRepository,
  ],
  exports: [RolesService],
})
export class RolesModule {}
