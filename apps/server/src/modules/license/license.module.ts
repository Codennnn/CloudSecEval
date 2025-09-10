import { Module } from '@nestjs/common'

import { MailModule } from '~/modules/mail/mail.module'
import { PrismaModule } from '~/prisma/prisma.module'

import { LicenseController } from './license.controller'
import { LicenseRepository } from './license.repository'
import { LicenseService } from './license.service'

/**
 * 授权码模块
 * 提供付费内容访问控制功能
 */
@Module({
  imports: [PrismaModule, MailModule],
  controllers: [LicenseController],
  providers: [LicenseService, LicenseRepository],
  exports: [LicenseService, LicenseRepository],
})
export class LicenseModule {}
