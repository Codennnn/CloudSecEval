import type { SecurityWarningTemplateVarsDto } from '../dto/mail-template-vars.dto'

/**
 * 安全警告邮件模板
 * 用于向用户发送 IP 变更等安全提醒
 */
export function generateSecurityWarningTemplate(
  vars: SecurityWarningTemplateVarsDto,
): { subject: string, html: string, text: string } {
  const { email, newIP, warningTime } = vars

  const subject = '🔒 安全提醒 - 检测到新设备访问'

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>安全警告</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🔒 安全提醒</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">检测到您的授权码在新设备上使用</p>
    </div>
    
    <div style="background: #fff3cd; padding: 25px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 25px;">
        <h2 style="margin: 0 0 15px 0; color: #856404; font-size: 18px;">⚠️ 安全提醒详情</h2>
        <div style="background: white; padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 10px 0;"><strong>邮箱地址：</strong>${email}</p>
            <p style="margin: 0 0 10px 0;"><strong>新 IP 地址：</strong><code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${newIP}</code></p>
            <p style="margin: 0;"><strong>检测时间：</strong>${warningTime}</p>
        </div>
    </div>
    
    <div style="background: #f8d7da; padding: 25px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #721c24; font-size: 16px;">🛡️ 安全建议</h3>
        <ul style="margin: 0; padding-left: 20px; color: #721c24;">
            <li><strong>如果是您本人操作：</strong>无需担心，这是正常的安全提醒</li>
            <li><strong>如果不是您本人操作：</strong>请立即联系客服，我们将协助您处理</li>
            <li><strong>保护措施：</strong>请勿将授权码分享给他人</li>
            <li><strong>异常检测：</strong>我们会持续监控您的账户安全</li>
        </ul>
    </div>
    
    <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px 0; color: #0c5460; font-size: 16px;">📞 需要帮助？</h3>
        <p style="margin: 0; color: #0c5460;">如果您对此安全提醒有任何疑问，或者需要帮助，请随时联系我们的客服团队。</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 14px; border-top: 1px solid #dee2e6;">
        <p style="margin: 0;">此邮件由系统自动发送，请勿回复。</p>
        <p style="margin: 5px 0 0 0;">如有疑问，请联系客服支持。</p>
    </div>
</body>
</html>`

  const text = `
🔒 安全提醒 - 检测到新设备访问

安全提醒详情：
邮箱地址：${email}
新 IP 地址：${newIP}
检测时间：${warningTime}

安全建议：
- 如果是您本人操作：无需担心，这是正常的安全提醒
- 如果不是您本人操作：请立即联系客服，我们将协助您处理
- 保护措施：请勿将授权码分享给他人
- 异常检测：我们会持续监控您的账户安全

需要帮助？
如果您对此安全提醒有任何疑问，或者需要帮助，请随时联系我们的客服团队。

此邮件由系统自动发送，请勿回复。
如有疑问，请联系客服支持。
`

  return { subject, html, text }
}
