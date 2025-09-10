import { Module } from '@nestjs/common'

import { UsersModule } from '~/modules/users/users.module'
import { PrismaModule } from '~/prisma/prisma.module'

import { DepartmentsController } from './departments.controller'
import { DepartmentsRepository } from './departments.repository'
import { DepartmentsService } from './departments.service'

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, DepartmentsRepository],
  exports: [DepartmentsService, DepartmentsRepository],
})
export class DepartmentsModule {}
