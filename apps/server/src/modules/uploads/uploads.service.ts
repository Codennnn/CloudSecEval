import { Injectable } from '@nestjs/common'
import { consola } from 'consola'
import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { basename, join } from 'path'

import { type FileObject, Prisma } from '#prisma/client'
import { PrismaService } from '~/prisma/prisma.service'

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
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 处理上传的文件，直接存储到本地文件系统
   */
  async handleUploadedFile(file: Express.Multer.File): Promise<StoredFileInfo> {
    const hash = this.generateFileHash(file.buffer)
    const category = this.getFileCategory(file.mimetype)
    const extension = this.getFileExtension(file.originalname)

    // 幂等检查：存在相同 sha256+size 且已就绪的文件则直接返回
    try {
      const existed: FileObject | null = await this.prisma.fileObject.findFirst({
        where: { sha256: hash, size: file.size, status: { not: 'DELETED' } },
      })

      if (existed && existed.status !== 'DELETED') {
        const info: StoredFileInfo = {
          id: existed.id,
          originalName: existed.originalName ?? file.originalname,
          fileName: basename(existed.storageKey),
          mimeType: existed.mimeType,
          size: existed.size,
          hash,
          localPath: existed.storageKey,
          publicUrl: existed.url ?? '',
          storedAt: existed.createdAt,
        }

        return info
      }
    }
    catch (e) {
      // 查询异常不应阻断上传流程，但记录日志
      consola.warn('幂等检查失败，将继续写入：', e)
    }

    // 创建 UPLOADING 记录并写入文件后置 READY
    const uploading: FileObject = await this.prisma.fileObject.create({
      data: {
        provider: 'local',
        bucket: null,
        storageKey: '',
        url: null,
        size: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname,
        sha256: hash,
        md5: null,
        status: 'UPLOADING',
        visibility: 'PRIVATE',
      },
    })

    try {
      const storageResult = await this.storeFileToLocal({
        hash,
        extension,
        category,
        buffer: file.buffer,
      })

      const updated: FileObject = await this.prisma.fileObject.update({
        where: { id: uploading.id },
        data: {
          storageKey: storageResult.localPath,
          url: storageResult.publicUrl,
          status: 'READY',
          checksumAt: new Date(),
        },
      })

      const fileInfo: StoredFileInfo = {
        id: updated.id,
        originalName: updated.originalName ?? file.originalname,
        fileName: storageResult.fileName,
        mimeType: updated.mimeType,
        size: updated.size,
        hash,
        localPath: storageResult.localPath,
        publicUrl: storageResult.publicUrl,
        storedAt: updated.createdAt,
      }

      return fileInfo
    }
    catch (error: unknown) {
      // 处理唯一键并发写入：返回已存在记录
      // P2002: Unique constraint failed on the constraint
      // 其他错误：标记失败并抛出
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existed: FileObject | null = await this.prisma.fileObject.findFirst({
          where: { sha256: hash, size: file.size, status: { not: 'DELETED' } },
        })

        if (existed) {
          const info: StoredFileInfo = {
            id: existed.id,
            originalName: existed.originalName ?? file.originalname,
            fileName: basename(existed.storageKey),
            mimeType: existed.mimeType,
            size: existed.size,
            hash,
            localPath: existed.storageKey,
            publicUrl: existed.url ?? '',
            storedAt: existed.createdAt,
          }

          return info
        }
      }

      try {
        await this.prisma.fileObject.update({
          where: { id: uploading.id },
          data: { status: 'FAILED' },
        })
      }
      catch {
        // 忽略失败状态回写异常
      }

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
  private async findFileById(id: string): Promise<StoredFileInfo | undefined> {
    const record: FileObject | null = await this.prisma.fileObject.findUnique({ where: { id } })

    if (!record || record.status === 'DELETED') {
      return undefined
    }

    const info: StoredFileInfo = {
      id: record.id,
      originalName: record.originalName ?? '',
      fileName: basename(record.storageKey),
      mimeType: record.mimeType,
      size: record.size,
      hash: record.sha256,
      localPath: record.storageKey,
      publicUrl: record.url ?? '',
      storedAt: record.createdAt,
    }

    return info
  }

  /**
   * 获取存储的文件信息
   */
  async getStoredFile(id: string): Promise<StoredFileInfo | undefined> {
    const found = await this.findFileById(id)

    return found
  }

  /**
   * 获取多个存储文件信息
   */
  async getStoredFiles(ids: string[]): Promise<StoredFileInfo[]> {
    if (ids.length === 0) {
      return []
    }

    const records: FileObject[] = await this.prisma.fileObject.findMany({
      where: { id: { in: ids } },
    })
    const list: StoredFileInfo[] = []

    for (const r of records) {
      if (r.status !== 'DELETED') {
        list.push({
          id: r.id,
          originalName: r.originalName ?? '',
          fileName: basename(r.storageKey),
          mimeType: r.mimeType,
          size: r.size,
          hash: r.sha256,
          localPath: r.storageKey,
          publicUrl: r.url ?? '',
          storedAt: r.createdAt,
        })
      }
    }

    return list
  }

  /**
   * 删除存储的文件
   */
  async deleteStoredFile(id: string): Promise<boolean> {
    const record: FileObject | null = await this.prisma.fileObject.findUnique({ where: { id } })

    if (!record || record.status === 'DELETED') {
      return false
    }

    try {
      await this.deleteFileFromLocal(record.storageKey)
    }
    catch (error) {
      consola.error(`删除文件失败: ${record.storageKey}`, error)

      return false
    }

    try {
      await this.prisma.fileObject.update({
        where: { id },
        data: { status: 'DELETED', deletedAt: new Date() },
      })

      return true
    }
    catch (e) {
      consola.error('标记删除失败:', e)

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
