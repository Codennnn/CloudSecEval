import { Module } from '@nestjs/common'

import { PrismaModule } from '~/prisma/prisma.module'

import { OrganizationsController } from './organizations.controller'
import { OrganizationsRepository } from './organizations.repository'
import { OrganizationsService } from './organizations.service'

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationsRepository],
  exports: [OrganizationsService, OrganizationsRepository],
})
export class OrganizationsModule {}
