import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

import type { MailConfig } from '~/config/configurations/mail.config'

import type {
  AccountLockTemplateVarsDto,
  ExpirationNoticeTemplateVarsDto,
  ExpirationReminderTemplateVarsDto,
  LicenseCodeTemplateVarsDto,
  SecurityWarningTemplateVarsDto,
} from './dto/mail-template-vars.dto'
import type { SendMailOptionsDto } from './dto/send-mail-options.dto'
import type { SendMailResultDto } from './dto/send-mail-result.dto'
import { generateAccountLockTemplate } from './templates/account-lock.template'
import { generateExpirationNoticeTemplate } from './templates/expiration-notice.template'
import { generateExpirationReminderTemplate } from './templates/expiration-reminder.template'
import { generateLicenseCodeTemplate } from './templates/license-code.template'
import { generateSecurityWarningTemplate } from './templates/security-warning.template'

/**
 * 邮件服务
 * 使用 Resend 提供邮件发送功能
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private readonly resend: Resend
  private readonly mailConfig: MailConfig

  constructor(private readonly configService: ConfigService) {
    this.mailConfig = this.configService.get<MailConfig>('mail')!
    this.resend = new Resend(this.mailConfig.apiKey)
  }

  /**
   * 发送邮件
   * @param options 邮件发送选项
   * @returns 发送结果
   */
  async sendMail(options: SendMailOptionsDto): Promise<SendMailResultDto> {
    try {
      const { to, subject, html, text } = options

      const from = `${this.mailConfig.fromName} <${this.mailConfig.fromAddress}>`

      const result = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
      })

      if (result.error) {
        this.logger.error('邮件发送失败', {
          from,
          to,
          subject,
          error: result.error.message,
          errorCode: result.error.name,
          operation: 'sendMail',
        })

        return {
          success: false,
          error: result.error.message,
        }
      }

      this.logger.log('邮件发送成功', {
        to,
        subject,
        messageId: result.data.id,
        operation: 'sendMail',
      })

      return {
        success: true,
        messageId: result.data.id,
      }
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)

      this.logger.error('邮件发送异常', {
        to: options.to,
        subject: options.subject,
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        operation: 'sendMail',
      })

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * 发送授权码邮件
   * @param email 收件人邮箱
   * @param code 授权码
   * @returns 发送结果
   */
  async sendLicenseCode(email: string, code: string): Promise<SendMailResultDto> {
    const templateVars: LicenseCodeTemplateVarsDto = { email, code }
    const { subject, html, text } = generateLicenseCodeTemplate(templateVars)

    return this.sendMail({
      to: email,
      subject,
      html,
      text,
    })
  }

  /**
   * 发送安全警告邮件
   * @param email 收件人邮箱
   * @param newIP 新的 IP 地址
   * @returns 发送结果
   */
  async sendSecurityWarning(email: string, newIP: string): Promise<SendMailResultDto> {
    const templateVars: SecurityWarningTemplateVarsDto = {
      email,
      newIP,
      warningTime: new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }
    const { subject, html, text } = generateSecurityWarningTemplate(templateVars)

    return this.sendMail({
      to: email,
      subject,
      html,
      text,
    })
  }

  /**
   * 发送账户锁定邮件
   * @param email 收件人邮箱
   * @param reason 锁定原因
   * @returns 发送结果
   */
  async sendAccountLock(email: string, reason = '检测到异常访问行为'): Promise<SendMailResultDto> {
    const templateVars: AccountLockTemplateVarsDto = {
      email,
      reason,
      lockTime: new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }
    const { subject, html, text } = generateAccountLockTemplate(templateVars)

    return this.sendMail({
      to: email,
      subject,
      html,
      text,
    })
  }

  /**
   * 发送过期提醒邮件
   * @param email 收件人邮箱
   * @param code 授权码
   * @param expiresAt 过期时间
   * @param daysRemaining 剩余天数
   * @returns 发送结果
   */
  async sendExpirationReminder(
    email: string,
    code: string,
    expiresAt: Date,
    daysRemaining: number,
  ): Promise<SendMailResultDto> {
    const templateVars: ExpirationReminderTemplateVarsDto = {
      email,
      code,
      expiresAt: expiresAt.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      daysRemaining,
    }
    const { subject, html, text } = generateExpirationReminderTemplate(templateVars)

    return this.sendMail({
      to: email,
      subject,
      html,
      text,
    })
  }

  /**
   * 发送过期通知邮件
   * @param email 收件人邮箱
   * @param code 授权码
   * @param expiredAt 过期时间
   * @returns 发送结果
   */
  async sendExpirationNotice(
    email: string,
    code: string,
    expiredAt: Date,
  ): Promise<SendMailResultDto> {
    const templateVars: ExpirationNoticeTemplateVarsDto = {
      email,
      code,
      expiredAt: expiredAt.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }
    const { subject, html, text } = generateExpirationNoticeTemplate(templateVars)

    return this.sendMail({
      to: email,
      subject,
      html,
      text,
    })
  }
}
