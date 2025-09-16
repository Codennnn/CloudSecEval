import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CommonModule } from './common/common.module'
import { DisabledApiGuard } from './common/guards/disabled-api.guard'
import { ConfigModule } from './config/config.module'
import { AuthModule } from './modules/auth/auth.module'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { BugReportsModule } from './modules/bug-reports/bug-reports.module'
import { DepartmentsModule } from './modules/departments/departments.module'
import { LicenseModule } from './modules/license/license.module'
import { OrganizationsModule } from './modules/organizations/organizations.module'
import { PermissionsModule } from './modules/permissions/permissions.module'
import { RolesModule } from './modules/roles/roles.module'
import { StatisticsModule } from './modules/statistics/statistics.module'
import { UploadsModule } from './modules/uploads/uploads.module'
import { UsersModule } from './modules/users/users.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'storage'),
      serveRoot: '/static',
    }),
    ConfigModule,
    PrismaModule,
    CommonModule,
    OrganizationsModule,
    DepartmentsModule,
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    LicenseModule,
    UploadsModule,
    StatisticsModule,
    BugReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 禁用API守卫 - 优先级最高，先检查接口是否被禁用
    {
      provide: APP_GUARD,
      useClass: DisabledApiGuard,
    },
    // JWT认证守卫 - 在接口可用的前提下进行身份验证
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
