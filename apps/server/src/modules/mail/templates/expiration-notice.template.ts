import type { ExpirationNoticeTemplateVarsDto } from '../dto/mail-template-vars.dto'

/**
 * 过期通知邮件模板
 * 用于向用户发送授权码已过期的通知
 */
export function generateExpirationNoticeTemplate(
  vars: ExpirationNoticeTemplateVarsDto,
): { subject: string, html: string, text: string } {
  const { code, email, expiredAt } = vars

  const subject = '🚫 授权码已过期通知'

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>授权码过期通知</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #dc3545 0%, #6f42c1 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🚫 授权码已过期</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">您的付费内容访问权限已到期</p>
    </div>
    
    <div style="background: #f8d7da; padding: 25px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 25px;">
        <h2 style="margin: 0 0 15px 0; color: #721c24; font-size: 20px;">⚠️ 授权已过期</h2>
        <p style="margin: 0; font-size: 16px; color: #721c24; font-weight: 500;">
            您的授权码已于 <strong style="color: #dc3545; font-size: 18px;">${expiredAt}</strong> 过期
        </p>
    </div>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">📧 邮箱地址</h3>
        <p style="margin: 0; font-size: 16px; color: #6c757d; word-break: break-all;">${email}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">🔑 已过期授权码</h3>
        <div style="background: white; padding: 15px; border-radius: 6px; text-align: center; border: 2px dashed #dc3545;">
            <code style="font-size: 20px; font-weight: bold; color: #dc3545; letter-spacing: 1px; text-decoration: line-through;">${code}</code>
        </div>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">📄 影响说明</h3>
        <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li>您将无法继续访问付费内容</li>
            <li>已保存的内容仍可正常查看</li>
            <li>新的付费内容需要重新获取有效授权码</li>
        </ul>
    </div>
    
    <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #155724; font-size: 16px;">🔄 续费指引</h3>
        <ul style="margin: 0; padding-left: 20px; color: #155724;">
            <li>联系客服进行续费，恢复访问权限</li>
            <li>续费后您的授权码将重新激活</li>
            <li>我们提供多种续费方案，满足不同需求</li>
            <li>长期用户享有续费优惠政策</li>
        </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:support@example.com" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; margin-right: 10px;">联系客服续费</a>
        <a href="tel:400-000-0000" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">电话咨询</a>
    </div>
    
    <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #495057; font-size: 16px;">💝 感谢您的支持</h3>
        <p style="margin: 0; color: #6c757d; font-size: 14px;">
            感谢您一直以来对我们的支持和信任。我们将继续为您提供优质的内容和服务。
            期待您的续费，让我们继续为您提供更好的体验。
        </p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6;">
        <p style="margin: 0;">此邮件由系统自动发送，请勿回复。</p>
        <p style="margin: 5px 0 0 0;">如有疑问，请联系客服支持。</p>
    </div>
</body>
</html>`

  const text = `
🚫 授权码已过期通知

您的授权码已过期！

邮箱地址：${email}
已过期授权码：${code}
过期时间：${expiredAt}

影响说明：
- 您将无法继续访问付费内容
- 已保存的内容仍可正常查看
- 新的付费内容需要重新获取有效授权码

续费指引：
- 联系客服进行续费，恢复访问权限
- 续费后您的授权码将重新激活
- 我们提供多种续费方案，满足不同需求
- 长期用户享有续费优惠政策

联系方式：
邮箱：support@example.com
电话：400-000-0000

感谢您一直以来对我们的支持和信任。
期待您的续费，让我们继续为您提供更好的体验。

此邮件由系统自动发送，请勿回复。
如有疑问，请联系客服支持。
`

  return { subject, html, text }
}
