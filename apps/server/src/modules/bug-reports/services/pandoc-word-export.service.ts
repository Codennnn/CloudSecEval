import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import { JSDOM } from 'jsdom'
import { nanoid } from 'nanoid'
import { basename, dirname, join } from 'path'

import { VulnerabilitySeverity } from '~/common/enums/severity.enum'

import { ExportedBugReportDataDto } from '../dto/export-import-bug-report.dto'

/**
 * 处理后的图片信息接口
 */
interface ProcessedImage {
  /** 图片唯一标识 */
  readonly id: string
  /** 图片文件路径 */
  readonly filePath: string
  /** 图片alt文本 */
  readonly alt?: string
}

/**
 * 图片处理结果接口
 */
interface ImageProcessingResult {
  /** 处理后的HTML内容 */
  readonly processedHtml: string
  /** 处理的图片文件列表 */
  readonly imageFiles: ProcessedImage[]
}

/**
 * 基于 Pandoc 的 Word 导出服务
 * 利用 pandoc 的强大转换能力，处理复杂的 HTML 到 Word 转换
 */
@Injectable()
export class PandocWordExportService {
  private readonly tempDir: string

  constructor(private readonly configService: ConfigService) {
    this.tempDir = join(this.configService.get<string>('app.tempDir') ?? '/tmp/app-temp', 'bug-reports')
  }

  /**
   * 生成漏洞报告Word文档
   */
  async generateBugReportDocument(data: ExportedBugReportDataDto): Promise<Buffer> {
    const taskId = nanoid()
    const tempTaskDir = join(this.tempDir, taskId)

    try {
      // 创建临时目录
      await this.ensureTempDirectory(tempTaskDir)

      // 生成HTML内容
      const htmlContent = this.generateHtmlContent(data)

      // 处理HTML中的base64图片
      const { processedHtml } = await this.processBase64Images(htmlContent, tempTaskDir)

      // 写入HTML文件
      const htmlFilePath = join(tempTaskDir, 'report.html')
      await fs.writeFile(htmlFilePath, processedHtml, 'utf8')

      // 使用pandoc转换为Word
      const outputFilePath = join(tempTaskDir, 'report.docx')
      this.convertHtmlToWord(htmlFilePath, outputFilePath)

      // 读取生成的Word文件
      const wordBuffer = await fs.readFile(outputFilePath)

      return wordBuffer
    }
    finally {
      // 清理临时文件
      await this.cleanupTempDir(tempTaskDir)
    }
  }

  /**
   * 确保临时目录存在
   */
  private async ensureTempDirectory(tempDir: string): Promise<void> {
    try {
      await fs.mkdir(tempDir, { recursive: true })
    }
    catch (error) {
      throw new Error(`创建临时目录失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 生成完整的HTML内容
   */
  private generateHtmlContent(data: ExportedBugReportDataDto): string {
    const severityText = this.getSeverityText(data.report.severity)

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif; 
            line-height: 1.8; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 40px; 
            color: #333;
            background-color: #fff;
        }
        
        /* 报告标题样式 */
        .report-title { 
            color: #1a202c; 
            text-align: center;
            font-size: 2.2em;
            font-weight: 700;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #e2e8f0;
        }
        
        /* 章节标题样式 */
        .section-title { 
            color: #2d3748; 
            font-size: 1.4em;
            font-weight: 600;
            margin: 40px 0 20px 0;
            padding: 12px 0 8px 0;
            border-bottom: 2px solid #4299e1;
            position: relative;
        }
        
        .section-title::before {
            content: "";
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 60px;
            height: 2px;
            background-color: #3182ce;
        }
        
        /* 漏洞等级样式 */
        .severity-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1.1em;
            margin: 10px 0;
        }
        
        .severity-critical { 
            background-color: #fed7d7; 
            color: #9b2c2c; 
            border: 2px solid #fc8181;
        }
        .severity-high { 
            background-color: #feebc8; 
            color: #c05621; 
            border: 2px solid #f6ad55;
        }
        .severity-medium { 
            background-color: #fefcbf; 
            color: #b7791f; 
            border: 2px solid #f6e05e;
        }
        .severity-low { 
            background-color: #c6f6d5; 
            color: #276749; 
            border: 2px solid #68d391;
        }
        .severity-info { 
            background-color: #bee3f8; 
            color: #2c5282; 
            border: 2px solid #63b3ed;
        }
        
        /* 内容区域样式 */
        .content-section {
            margin: 50px 0;
            padding: 0;
        }
        
        .content-section:first-child {
            margin-top: 0;
        }
        
        .content-section:last-child {
            margin-bottom: 0;
        }
        
        .description-content { 
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .description-content img { 
            max-width: 100%; 
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin: 16px 0;
        }
        
        .description-content h1,
        .description-content h2,
        .description-content h3,
        .description-content h4,
        .description-content h5,
        .description-content h6 {
            color: #2d3748;
            margin-top: 24px;
            margin-bottom: 12px;
        }
        
        .description-content p {
            margin: 12px 0;
            text-align: justify;
        }
        
        .description-content ul,
        .description-content ol {
            margin: 16px 0;
            padding-left: 24px;
        }
        
        .description-content li {
            margin: 8px 0;
        }
        
        /* 代码样式 */
        .description-content pre {
            background-color: #2d3748;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
            line-height: 1.5;
            margin: 16px 0;
            border: 1px solid #4a5568;
        }
        
        .description-content code {
            background-color: #edf2f7;
            color: #e53e3e;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
        }
        
        .description-content pre code {
            background: none;
            color: inherit;
            padding: 0;
            border-radius: 0;
        }
        
        /* 引用样式 */
        .description-content blockquote {
            margin: 16px 0;
            padding: 16px 20px;
            background-color: #edf2f7;
            border-left: 4px solid #4299e1;
            border-radius: 0 8px 8px 0;
            color: #4a5568;
            font-style: italic;
        }
        
        /* URL列表样式 */
        .url-list {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
        }
        
        .url-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
            margin: 0;
        }
        
        .url-item:last-child {
            border-bottom: none;
        }
        
        .url-number {
            background-color: #4299e1;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8em;
            font-weight: 600;
            margin-right: 12px;
            flex-shrink: 0;
        }
        
        .url-link {
            color: #3182ce;
            text-decoration: none;
            word-break: break-all;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.9em;
        }
        
        .url-link:hover {
            color: #2c5282;
            text-decoration: underline;
        }
        
        /* 空内容样式 */
        .empty-content {
            color: #a0aec0;
            font-style: italic;
            text-align: center;
            padding: 40px 20px;
            background-color: #f7fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 12px;
        }
        
        /* 表格样式 */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        th {
            background-color: #f7fafc;
            font-weight: 600;
            color: #2d3748;
        }
        
    </style>
</head>
<body>
    <!-- 报告标题 -->
    <div class="content-section">
        <h2 class="section-title">报告标题</h2>
        <div class="description-content">
            ${this.escapeHtml(data.report.title)}
        </div>
    </div>
    
    <!-- 漏洞等级 -->
    <div class="content-section">
        <h2 class="section-title">漏洞等级</h2>
        <div class="severity-badge severity-${data.report.severity.toLowerCase()}">
            ${severityText}
        </div>
    </div>
    
    <!-- 问题与复现步骤 -->
    <div class="content-section">
        <h2 class="section-title">问题与复现步骤</h2>
        <div class="description-content">
            ${data.report.description ?? '<div class="empty-content">暂无问题描述</div>'}
        </div>
    </div>
    
    <!-- 复现链接 -->
    ${this.generateUrlSection(data)}
</body>
</html>`
  }

  /**
   * 处理HTML中的base64图片
   */
  private async processBase64Images(
    htmlContent: string,
    tempDir: string,
  ): Promise<ImageProcessingResult> {
    const dom = new JSDOM(htmlContent)
    const document = dom.window.document
    const imageFiles: ProcessedImage[] = []

    const imgElements = document.querySelectorAll('img')

    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i]
      const src = img.getAttribute('src')

      if (src?.startsWith('data:image/')) {
        const base64Match = /^data:image\/([^;]+);base64,(.+)$/.exec(src)

        if (base64Match) {
          const [, format, base64Data] = base64Match
          const imageId = `image_${i + 1}`
          const fileName = `${imageId}.${format}`
          const filePath = join(tempDir, fileName)

          try {
            // 保存图片文件
            const imageBuffer = Buffer.from(base64Data, 'base64')
            await fs.writeFile(filePath, imageBuffer)

            // 更新HTML中的图片引用
            img.setAttribute('src', fileName)

            imageFiles.push({
              id: imageId,
              filePath,
              alt: img.getAttribute('alt') ?? undefined,
            })

            // 成功处理图片（调试信息）
          }
          catch (error) {
            console.warn(`处理图片 ${imageId} 时出错:`, error)
            // 如果图片处理失败，使用占位符
            img.setAttribute('src', '')
            img.setAttribute('alt', `[图片处理失败: ${img.getAttribute('alt') ?? imageId}]`)
          }
        }
      }
    }

    const processedHtml = dom.serialize()
    // 图片处理完成（调试信息）

    return {
      processedHtml,
      imageFiles,
    }
  }

  /**
   * 使用pandoc转换HTML为Word
   */
  private convertHtmlToWord(htmlFilePath: string, outputFilePath: string): void {
    try {
      const workingDir = dirname(htmlFilePath)
      const command = [
        'pandoc',
        `"${basename(htmlFilePath)}"`, // 使用相对路径，因为工作目录已设置
        '-o', `"${basename(outputFilePath)}"`, // 使用相对路径
        '--from=html',
        '--to=docx',
        '--standalone',
      ].join(' ')

      // 执行Pandoc转换（调试信息）
      // 工作目录设置（调试信息）

      execSync(command, {
        cwd: workingDir, // 设置工作目录为HTML文件所在目录
        encoding: 'utf8',
        timeout: 30000, // 30秒超时
        stdio: 'pipe', // 防止输出干扰
      })

      // Pandoc转换成功（调试信息）
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Pandoc转换失败: ${errorMessage}`)
    }
  }

  /**
   * 生成URL部分
   */
  private generateUrlSection(data: ExportedBugReportDataDto): string {
    if (!data.report.discoveredUrls || data.report.discoveredUrls.length === 0) {
      return `
    <div class="content-section">
        <h2 class="section-title">复现链接</h2>
        <div class="empty-content">暂无复现链接</div>
    </div>`
    }

    const urlList = data.report.discoveredUrls
      .map((url, index) => {
        const escapedUrl = this.escapeHtml(url)

        return `
        <div class="url-item">
            <span class="url-number">${index + 1}</span>
            <a class="url-link" href="${url}" target="_blank">${escapedUrl}</a>
        </div>`
      })
      .join('')

    return `
    <div class="content-section">
        <h2 class="section-title">复现链接</h2>
        <div class="url-list">
            ${urlList}
        </div>
    </div>`
  }

  /**
   * 清理临时目录
   */
  private async cleanupTempDir(tempDir: string): Promise<void> {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    }
    catch (error) {
      console.warn(`清理临时目录失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * HTML转义，防止XSS攻击
   */
  private escapeHtml(text: string): string {
    if (typeof text !== 'string') {
      return String(text)
    }

    const div = new JSDOM().window.document.createElement('div')
    div.textContent = text

    return div.innerHTML
  }

  /**
   * 格式化漏洞等级文本
   */
  private getSeverityText(severity: VulnerabilitySeverity): string {
    const severityMap: Record<VulnerabilitySeverity, string> = {
      [VulnerabilitySeverity.CRITICAL]: '严重',
      [VulnerabilitySeverity.HIGH]: '高危',
      [VulnerabilitySeverity.MEDIUM]: '中危',
      [VulnerabilitySeverity.LOW]: '低危',
      [VulnerabilitySeverity.INFO]: '信息',
    }

    return severityMap[severity] || severity
  }
}
