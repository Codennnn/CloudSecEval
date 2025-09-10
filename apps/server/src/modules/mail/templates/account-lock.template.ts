import type { AccountLockTemplateVarsDto } from '../dto/mail-template-vars.dto'

/**
 * 账户锁定邮件模板
 * 用于向用户发送账户被锁定的通知
 */
export function generateAccountLockTemplate(
  vars: AccountLockTemplateVarsDto,
): { subject: string, html: string, text: string } {
  const { email, lockTime, reason } = vars

  const subject = '🚨 账户安全锁定通知'

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>账户锁定通知</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #dc3545 0%, #6f1319 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🚨 账户安全锁定</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">您的授权码已被安全锁定</p>
    </div>
    
    <div style="background: #f8d7da; padding: 25px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 25px;">
        <h2 style="margin: 0 0 15px 0; color: #721c24; font-size: 18px;">🔒 锁定详情</h2>
        <div style="background: white; padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 10px 0;"><strong>邮箱地址：</strong>${email}</p>
            <p style="margin: 0 0 10px 0;"><strong>锁定时间：</strong>${lockTime}</p>
            <p style="margin: 0;"><strong>锁定原因：</strong>${reason}</p>
        </div>
    </div>
    
    <div style="background: #fff3cd; padding: 25px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 16px;">⚠️ 重要说明</h3>
        <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li>您的授权码因安全原因已被锁定</li>
            <li>这通常是由于检测到异常访问行为导致的</li>
            <li>锁定期间您将无法访问付费内容</li>
            <li>如果您认为这是误操作，请联系客服</li>
        </ul>
    </div>
    
    <div style="background: #d4edda; padding: 25px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #155724; font-size: 16px;">🔓 解锁流程</h3>
        <div style="background: white; padding: 20px; border-radius: 6px;">
            <ol style="margin: 0; padding-left: 20px; color: #155724;">
                <li>联系客服团队说明情况</li>
                <li>提供您的邮箱地址进行身份验证</li>
                <li>客服将协助您解锁账户</li>
                <li>解锁后您可以正常使用授权码</li>
            </ol>
        </div>
    </div>
    
    <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #0c5460; font-size: 16px;">📞 联系客服</h3>
        <p style="margin: 0; color: #0c5460;">如需解锁或了解更多详情，请联系我们的客服团队。我们将尽快为您处理此问题。</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6;">
        <p style="margin: 0;">此邮件由系统自动发送，请勿回复。</p>
        <p style="margin: 5px 0 0 0;">如有疑问，请联系客服支持。</p>
    </div>
</body>
</html>`

  const text = `
🚨 账户安全锁定通知

锁定详情：
邮箱地址：${email}
锁定时间：${lockTime}
锁定原因：${reason}

重要说明：
- 您的授权码因安全原因已被锁定
- 这通常是由于检测到异常访问行为导致的
- 锁定期间您将无法访问付费内容
- 如果您认为这是误操作，请联系客服

解锁流程：
1. 联系客服团队说明情况
2. 提供您的邮箱地址进行身份验证
3. 客服将协助您解锁账户
4. 解锁后您可以正常使用授权码

联系客服：
如需解锁或了解更多详情，请联系我们的客服团队。我们将尽快为您处理此问题。

此邮件由系统自动发送，请勿回复。
如有疑问，请联系客服支持。
`

  return { subject, html, text }
}
