import { Injectable } from '@nestjs/common'
import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { nanoid } from 'nanoid'
import { join } from 'path'

import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'

interface TempFileInfo {
  id: string
  /**  原始文件名 */
  originalName: string
  /** 文件名 */
  fileName: string
  /** 文件类型 */
  mimeType: string
  /** 文件大小 */
  size: number
  /** 文件缓冲区 */
  buffer: Buffer
  /** 文件哈希 */
  hash: string
  /** 上传时间 */
  uploadedAt: Date
}

@Injectable()
export class UploadsService {
  private readonly tempFiles = new Map<string, TempFileInfo>()

  /**
   * 处理上传的文件，生成临时文件信息
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async handleUploadedFile(file: Express.Multer.File): Promise<TempFileInfo> {
    const uploadedAt = new Date()
    const hash = this.generateFileHash(file.buffer)
    const id = nanoid()

    const tempFileInfo: TempFileInfo = {
      id,
      originalName: file.originalname,
      fileName: file.filename || `${id}.${this.getFileExtension(file.originalname)}`,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
      hash,
      uploadedAt,
    }

    // 保存临时文件信息
    this.tempFiles.set(id, tempFileInfo)

    const oneMinute = 60 * 1000

    // 设置 1 分钟自动清理
    setTimeout(() => {
      this.cleanupTempFile(id)
    }, oneMinute)

    return tempFileInfo
  }

  /**
   * 处理多文件上传
   */
  async handleUploadedFiles(files: Express.Multer.File[]): Promise<TempFileInfo[]> {
    const results = []

    for (const file of files) {
      const tempFileInfo = await this.handleUploadedFile(file)
      results.push(tempFileInfo)
    }

    return results
  }

  /**
   * 获取临时文件信息
   */
  getTempFile(id: string): TempFileInfo | undefined {
    return this.tempFiles.get(id)
  }

  /**
   * 获取临时文件列表
   */
  getTempFiles(ids: string[]): TempFileInfo[] {
    return ids.map((id) => this.tempFiles.get(id)).filter(Boolean) as TempFileInfo[]
  }

  /**
   * 清理临时文件
   */
  cleanupTempFile(id: string): void {
    const tempFile = this.tempFiles.get(id)

    if (tempFile) {
      this.tempFiles.delete(id)
    }
  }

  /**
   * 清理多个临时文件
   */
  cleanupTempFiles(ids: string[]): void {
    ids.forEach((id) => {
      this.cleanupTempFile(id)
    })
  }

  /**
   * 保存临时文件到指定目录
   */
  async saveTempFile(id: string, targetDir: string): Promise<string> {
    const tempFile = this.tempFiles.get(id)

    if (!tempFile) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.FILE_NOT_FOUND,
        '临时文件不存在',
      )
    }

    const targetPath = join(targetDir, tempFile.fileName)
    await fs.writeFile(targetPath, tempFile.buffer)

    return targetPath
  }

  /**
   * 验证文件类型
   */
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype)
  }

  /**
   * 验证文件大小
   */
  validateFileSize(file: Express.Multer.File, maxSize: number): boolean {
    return file.size <= maxSize
  }

  /**
   * 获取文件扩展名
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop() ?? ''
  }

  /**
   * 生成文件哈希
   */
  generateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex')
  }
}
