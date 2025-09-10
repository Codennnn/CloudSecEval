import type { ExpirationReminderTemplateVarsDto } from '../dto/mail-template-vars.dto'

/**
 * 过期提醒邮件模板
 * 用于向用户发送授权码即将过期的提醒
 */
export function generateExpirationReminderTemplate(
  vars: ExpirationReminderTemplateVarsDto,
): { subject: string, html: string, text: string } {
  const { code, email, expiresAt, daysRemaining } = vars

  const subject = `⏰ 授权码即将过期提醒 - 剩余${daysRemaining}天`

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>授权码过期提醒</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #ff9500 0%, #ff6b6b 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">⏰ 授权码即将过期</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">您的付费内容访问权限即将到期</p>
    </div>
    
    <div style="background: #fff3cd; padding: 25px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 25px;">
        <h2 style="margin: 0 0 15px 0; color: #856404; font-size: 20px;">🚨 重要提醒</h2>
        <p style="margin: 0; font-size: 16px; color: #856404; font-weight: 500;">
            您的授权码将在 <strong style="color: #d63384; font-size: 18px;">${daysRemaining} 天</strong> 后过期
        </p>
    </div>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">📧 邮箱地址</h3>
        <p style="margin: 0; font-size: 16px; color: #6c757d; word-break: break-all;">${email}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">🔑 授权码</h3>
        <div style="background: white; padding: 15px; border-radius: 6px; text-align: center; border: 2px dashed #6c757d;">
            <code style="font-size: 20px; font-weight: bold; color: #495057; letter-spacing: 1px;">${code}</code>
        </div>
    </div>
    
    <div style="background: #e8f5e8; padding: 25px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #155724; font-size: 18px;">📅 过期时间</h3>
        <p style="margin: 0; font-size: 18px; color: #155724; font-weight: 600;">${expiresAt}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #6c757d;">过期后将无法继续访问付费内容</p>
    </div>
    
    <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #155724; font-size: 16px;">💡 续费指引</h3>
        <ul style="margin: 0; padding-left: 20px; color: #155724;">
            <li>请及时联系客服进行续费，避免影响您的正常使用</li>
            <li>续费后您的授权码将继续有效，无需重新设置</li>
            <li>如有任何疑问，请随时联系我们的客服团队</li>
        </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:support@example.com" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">联系客服续费</a>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6;">
        <p style="margin: 0;">此邮件由系统自动发送，请勿回复。</p>
        <p style="margin: 5px 0 0 0;">如有疑问，请联系客服支持。</p>
    </div>
</body>
</html>`

  const text = `
⏰ 授权码即将过期提醒

您的授权码将在 ${daysRemaining} 天后过期！

邮箱地址：${email}
授权码：${code}
过期时间：${expiresAt}

续费指引：
- 请及时联系客服进行续费，避免影响您的正常使用
- 续费后您的授权码将继续有效，无需重新设置
- 如有任何疑问，请随时联系我们的客服团队

联系客服：support@example.com

此邮件由系统自动发送，请勿回复。
如有疑问，请联系客服支持。
`

  return { subject, html, text }
}
