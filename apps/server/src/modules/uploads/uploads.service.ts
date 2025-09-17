import { Injectable } from '@nestjs/common'
import { consola } from 'consola'
import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { nanoid } from 'nanoid'
import { join } from 'path'

interface StoredFileInfo {
  /** 文件唯一标识 */
  id: string
  /** 原始文件名 */
  originalName: string
  /** 存储的文件名（哈希值） */
  fileName: string
  /** 文件类型 */
  mimeType: string
  /** 文件大小 */
  size: number
  /** 文件哈希 */
  hash: string
  /** 本地存储路径 */
  localPath: string
  /** 公共访问URL */
  publicUrl: string
  /** 存储时间 */
  storedAt: Date
}

interface FileStorageResult {
  /** 存储的本地路径 */
  localPath: string
  /** 公共访问URL */
  publicUrl: string
  /** 存储的文件名 */
  fileName: string
}

interface FileStorageOptions {
  /** 文件哈希 */
  hash: string
  /** 文件扩展名 */
  extension: string
  /** 文件分类 */
  category: string
  /** 文件缓冲区 */
  buffer: Buffer
}

@Injectable()
export class UploadsService {
  private readonly storedFiles = new Map<string, StoredFileInfo>()

  /**
   * 处理上传的文件，直接存储到本地文件系统
   */
  async handleUploadedFile(file: Express.Multer.File): Promise<StoredFileInfo> {
    const id = nanoid()
    const hash = this.generateFileHash(file.buffer)
    const storedAt = new Date()

    // 检查是否已存在相同文件（基于哈希去重）
    const existingFile = this.findFileByHash(hash)

    if (existingFile) {
      // 返回已存在文件的信息，避免重复存储
      return {
        ...existingFile,
        id, // 生成新的ID但复用已存储的文件
        originalName: file.originalname, // 保留当前上传的原始文件名
        storedAt,
      }
    }

    const category = this.getFileCategory(file.mimetype)
    const extension = this.getFileExtension(file.originalname)

    try {
      const storageResult = await this.storeFileToLocal({
        hash,
        extension,
        category,
        buffer: file.buffer,
      })

      const fileInfo: StoredFileInfo = {
        id,
        originalName: file.originalname,
        fileName: storageResult.fileName,
        mimeType: file.mimetype,
        size: file.size,
        hash,
        localPath: storageResult.localPath,
        publicUrl: storageResult.publicUrl,
        storedAt,
      }

      // 保存文件信息到内存映射
      this.storedFiles.set(id, fileInfo)

      return fileInfo
    }
    catch (error) {
      consola.error('文件存储失败:', error)
      throw error
    }
  }

  /**
   * 处理多文件上传
   */
  async handleUploadedFiles(files: Express.Multer.File[]): Promise<StoredFileInfo[]> {
    const results = []

    for (const file of files) {
      const storedFileInfo = await this.handleUploadedFile(file)
      results.push(storedFileInfo)
    }

    return results
  }

  /**
   * 根据 MIME 类型确定文件分类
   */
  private getFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'images'
    }

    if (mimeType.startsWith('video/')) {
      return 'videos'
    }

    if (mimeType.startsWith('audio/')) {
      return 'audios'
    }

    if (mimeType.includes('pdf')
      || mimeType.includes('document')
      || mimeType.includes('text')
      || mimeType.includes('spreadsheet')) {
      return 'documents'
    }

    return 'others'
  }

  /**
   * 存储文件到本地文件系统
   */
  private async storeFileToLocal(options: FileStorageOptions): Promise<FileStorageResult> {
    const { hash, extension, category, buffer } = options
    const fileName = `${hash}.${extension}`

    // 构建存储路径
    const baseDir = process.cwd()
    const categoryDir = join(baseDir, 'storage', 'uploads', category)
    const localPath = join(categoryDir, fileName)
    const publicUrl = `/static/uploads/${category}/${fileName}`

    // 创建目录
    await fs.mkdir(categoryDir, { recursive: true })

    // 写入文件
    await fs.writeFile(localPath, buffer)

    return {
      localPath,
      publicUrl,
      fileName,
    }
  }

  /**
   * 删除本地存储的文件
   * 这个方法可以轻松替换为其他存储方式的删除逻辑
   */
  private async deleteFileFromLocal(localPath: string): Promise<void> {
    await fs.rm(localPath, { force: true })
  }

  /**
   * 通过哈希查找已存在的文件
   */
  private findFileByHash(hash: string): StoredFileInfo | undefined {
    for (const fileInfo of this.storedFiles.values()) {
      if (fileInfo.hash === hash) {
        return fileInfo
      }
    }

    return undefined
  }

  /**
   * 获取存储的文件信息
   */
  getStoredFile(id: string): StoredFileInfo | undefined {
    return this.storedFiles.get(id)
  }

  /**
   * 获取多个存储文件信息
   */
  getStoredFiles(ids: string[]): StoredFileInfo[] {
    return ids.map((id) => this.storedFiles.get(id)).filter(Boolean) as StoredFileInfo[]
  }

  /**
   * 删除存储的文件
   */
  async deleteStoredFile(id: string): Promise<boolean> {
    const fileInfo = this.storedFiles.get(id)

    if (!fileInfo) {
      return false
    }

    try {
      // 检查是否有其他文件使用相同哈希（去重文件）
      const sameHashFiles = Array.from(this.storedFiles.values())
        .filter((f) => f.hash === fileInfo.hash && f.id !== id)

      // 只有在没有其他文件使用相同哈希时才删除物理文件
      if (sameHashFiles.length === 0) {
        await this.deleteFileFromLocal(fileInfo.localPath)
      }

      // 删除文件信息记录
      this.storedFiles.delete(id)

      return true
    }
    catch (error) {
      consola.error(`删除文件失败: ${fileInfo.localPath}`, error)

      return false
    }
  }

  /**
   * 清理多个文件
   */
  async deleteStoredFiles(ids: string[]): Promise<{ success: string[], failed: string[] }> {
    const results = await Promise.allSettled(
      ids.map(async (id) => ({ id, success: await this.deleteStoredFile(id) })),
    )

    const success: string[] = []
    const failed: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        success.push(ids[index])
      }
      else {
        failed.push(ids[index])
      }
    })

    return { success, failed }
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
