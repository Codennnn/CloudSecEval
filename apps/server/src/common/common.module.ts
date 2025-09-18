import { Module } from '@nestjs/common'

import { AdminGuard } from './guards/admin.guard'
import { DisabledApiGuard } from './guards/disabled-api.guard'
import { ExcelExportService } from './services/excel-export.service'
import { HtmlSanitizerService } from './services/html-sanitizer.service'

/**
 * 通用模块
 *
 * 提供全局通用的服务、守卫、拦截器等组件
 */
@Module({
  providers: [DisabledApiGuard, AdminGuard, ExcelExportService, HtmlSanitizerService],
  exports: [DisabledApiGuard, AdminGuard, ExcelExportService, HtmlSanitizerService],
})
export class CommonModule {}
