import { Injectable } from '@nestjs/common'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

/**
 * HTML 内容消毒服务
 * 用于清理用户输入的富文本内容，防止 XSS 攻击
 */
@Injectable()
export class HtmlSanitizerService {
  private readonly purify

  constructor() {
    // 在 Node.js 环境中创建 DOM 环境
    const window = new JSDOM('').window
    this.purify = DOMPurify(window)
  }

  /**
   * 使用 DOMPurify 默认配置清理 HTML 内容
   */
  sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') {
      return ''
    }

    // 使用 DOMPurify 默认配置进行清理
    return this.purify.sanitize(html)
  }
}
