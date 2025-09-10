import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { MailService } from './mail.service'

/**
 * 邮件服务模块
 * 提供基于 Resend 的邮件发送功能
 */
@Module({
  imports: [ConfigModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
