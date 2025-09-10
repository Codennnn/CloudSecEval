import { registerAs } from '@nestjs/config'

/**
 * 邮件服务配置
 * 用于配置 Resend 邮件服务相关参数
 */
export interface MailConfig {
  /** Resend API 密钥 */
  apiKey: string
  /** 发件人邮箱地址 */
  fromAddress: string
  /** 发件人名称 */
  fromName: string
}

export default registerAs('mail', (): MailConfig => ({
  apiKey: process.env.RESEND_API_KEY ?? '',
  fromAddress: process.env.MAIL_FROM_ADDRESS ?? '',
  fromName: process.env.MAIL_FROM_NAME ?? '',
}))
