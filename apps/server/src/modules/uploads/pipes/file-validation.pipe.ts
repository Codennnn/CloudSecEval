import { Injectable, PipeTransform } from '@nestjs/common'

import { BUSINESS_CODES } from '~/common/constants/business-codes'
import {
  getAllowedExtensions,
  getAllowedMimeTypes,
  getExtensionsByMimeType,
} from '~/common/constants/file-types'
import { BusinessException } from '~/common/exceptions/business.exception'

export interface FileValidationOptions {
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 允许的 MIME 类型 */
  allowedTypes?: string[]
  /** 最大文件数量 */
  maxFiles?: number
  /** 是否必需文件 */
  required?: boolean
}

const DEFAULT_MAX_SIZE_10MB = 10 * 1024 * 1024

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly defaultOptions: FileValidationOptions = {
    maxSize: DEFAULT_MAX_SIZE_10MB,
    allowedTypes: getAllowedMimeTypes(),
    maxFiles: 5,
    required: true,
  }

  constructor(private readonly options: FileValidationOptions = {}) {
    this.options = { ...this.defaultOptions, ...options }
  }

  transform(value: unknown) {
    const files = value

    // 如果没有文件且文件是必需的，抛出异常
    if (!files) {
      if (this.options.required) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.MISSING_PARAMETER,
          '请选择要上传的文件',
        )
      }

      return files
    }

    // 类型安全检查：只处理文件对象
    if (!this.isFileObject(files)) {
      if (this.options.required) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.MISSING_PARAMETER,
          '上传的文件格式不正确',
        )
      }

      return files
    }

    const fileArray = Array.isArray(files) ? files : [files]

    // 验证文件数量
    if (this.options.maxFiles && fileArray.length > this.options.maxFiles) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.REQUEST_TOO_LARGE,
        `最多只能上传 ${this.options.maxFiles} 个文件`,
      )
    }

    // 验证每个文件
    for (const file of fileArray) {
      this.validateFile(file)
    }

    return files
  }

  /**
   * 检查是否为文件对象
   */
  private isFileObject(value: unknown):
   value is Express.Multer.File | Express.Multer.File[] {
    if (!value) {
      return false
    }

    // 检查单个文件对象
    if (typeof value === 'object' && 'fieldname' in value && 'originalname' in value && 'buffer' in value) {
      return true
    }

    // 检查文件数组
    if (Array.isArray(value)) {
      return value.length > 0 && value.every((item) =>
        typeof item === 'object' && 'fieldname' in item && 'originalname' in item && 'buffer' in item,
      )
    }

    return false
  }

  private validateFile(file: Express.Multer.File) {
    // 验证文件大小
    if (this.options.maxSize) {
      if (file.size > this.options.maxSize) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.FILE_SIZE_EXCEEDED,
          `文件 ${file.originalname} 大小超过限制 (${this.formatFileSize(this.options.maxSize)})`,
        )
      }
    }

    // 验证文件类型
    if (this.options.allowedTypes) {
      if (!this.options.allowedTypes.includes(file.mimetype)) {
        throw BusinessException.badRequest(
          BUSINESS_CODES.FILE_TYPE_NOT_ALLOWED,
          `不支持的文件类型: ${file.mimetype}`,
        )
      }
    }

    // 验证文件名
    if (!file.originalname || file.originalname.trim() === '') {
      throw BusinessException.badRequest(
        BUSINESS_CODES.INVALID_FILE_FORMAT,
        '文件名不能为空',
      )
    }

    // 验证文件扩展名
    const allowedExtensions = this.getAllowedExtensions()
    const fileExtension = this.getFileExtension(file.originalname).toLowerCase()

    if (!allowedExtensions.includes(fileExtension)) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.FILE_TYPE_NOT_ALLOWED,
        `不支持的文件扩展名: ${fileExtension}`,
      )
    }
  }

  private getAllowedExtensions(): string[] {
    if (!this.options.allowedTypes) {
      return getAllowedExtensions()
    }

    // 根据允许的 MIME 类型获取对应的扩展名
    return this.options.allowedTypes.flatMap((mimeType) =>
      getExtensionsByMimeType(mimeType),
    )
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() ?? ''
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes'
    }

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }
}

// 预定义的常用管道实例
export const ImageValidationPipe = new FileValidationPipe({
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
})

export const DocumentValidationPipe = new FileValidationPipe({
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
  ],
})

export const MultipleFilesValidationPipe = new FileValidationPipe({
  maxFiles: 10,
})

export const AvatarValidationPipe = new FileValidationPipe({
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFiles: 1,
})
