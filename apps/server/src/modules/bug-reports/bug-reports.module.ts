import { Module } from '@nestjs/common'

import { CommonModule } from '~/common/common.module'
import { PermissionsModule } from '~/modules/permissions/permissions.module'
import { UploadsModule } from '~/modules/uploads/uploads.module'
import { PrismaModule } from '~/prisma/prisma.module'

import { BugReportsController } from './bug-reports.controller'
import { BugReportsRepository } from './bug-reports.repository'
import { BugReportsService } from './bug-reports.service'

/**
 * 漏洞报告模块
 *
 * 提供漏洞报告的完整功能，包括：
 * - 创建、更新、删除漏洞报告
 * - 查询和统计漏洞报告
 * - 管理员审核工作流
 * - 文件附件处理
 * - 权限控制
 */
@Module({
  imports: [
    CommonModule,
    PrismaModule,
    UploadsModule,
    PermissionsModule,
  ],
  controllers: [BugReportsController],
  providers: [BugReportsService, BugReportsRepository],
  exports: [BugReportsService, BugReportsRepository],
})
export class BugReportsModule {}
