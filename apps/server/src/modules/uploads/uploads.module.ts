import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'

import { PermissionsModule } from '~/modules/permissions/permissions.module'

import { multerConfig } from './config/multer.config'
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service'

@Module({

  imports: [
    PermissionsModule,
    MulterModule.register(multerConfig),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
