import type { LicenseCodeTemplateVarsDto } from '../dto/mail-template-vars.dto'

/**
 * 授权码发放邮件模板
 * 用于向用户发送新生成的授权码
 */
export function generateLicenseCodeTemplate(
  vars: LicenseCodeTemplateVarsDto,
): { subject: string, html: string, text: string } {
  const { code, email } = vars

  const subject = '您的付费内容授权码'

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>授权码通知</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎉 授权码发放成功</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">您的付费内容访问权限已激活</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">📧 邮箱地址</h2>
        <p style="margin: 0; font-size: 16px; color: #6c757d; word-break: break-all;">${email}</p>
    </div>
    
    <div style="background: #e8f5e8; padding: 25px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 25px;">
        <h2 style="margin: 0 0 15px 0; color: #155724; font-size: 18px;">🔑 您的授权码</h2>
        <div style="background: white; padding: 15px; border-radius: 6px; text-align: center; border: 2px dashed #28a745;">
            <code style="font-size: 24px; font-weight: bold; color: #155724; letter-spacing: 2px;">${code}</code>
        </div>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #6c757d; text-align: center;">请妥善保管此授权码</p>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">⚠️ 使用提醒</h3>
        <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li>请在访问付费内容时输入此授权码</li>
            <li>授权码与您的邮箱地址绑定，请勿泄露给他人</li>
            <li>如发现异常使用情况，系统将自动发送安全提醒</li>
            <li>如需帮助，请联系客服支持</li>
        </ul>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6;">
        <p style="margin: 0;">此邮件由系统自动发送，请勿回复。</p>
        <p style="margin: 5px 0 0 0;">如有疑问，请联系客服支持。</p>
    </div>
</body>
</html>`

  const text = `
您的付费内容授权码

邮箱地址：${email}
授权码：${code}

使用提醒：
- 请在访问付费内容时输入此授权码
- 授权码与您的邮箱地址绑定，请勿泄露给他人
- 如发现异常使用情况，系统将自动发送安全提醒
- 如需帮助，请联系客服支持

此邮件由系统自动发送，请勿回复。
如有疑问，请联系客服支持。
`

  return { subject, html, text }
}
