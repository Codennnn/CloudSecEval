import { BUSINESS_CODES, PERMISSIONS } from '@mono/constants'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { createReadStream } from 'fs'

import { BusinessException } from '~/common/exceptions/business.exception'
import { encodeRFC5987Filename, resp } from '~/common/utils/response.util'
import { UPLOADS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'
import { RequirePermissions } from '~/modules/permissions/decorators/require-permissions.decorator'

import {
  BatchFileDeleteApiResponseDto,
  FileDeleteApiResponseDto,
  FileUploadApiResponseDto,
  MultipleFileUploadApiResponseDto,
} from './dto/upload-response.dto'
import {
  FileValidationOptions,
  FileValidationPipe,
  MultipleFilesValidationPipe,
} from './pipes/file-validation.pipe'
import { UploadsService } from './uploads.service'

@ApiTags('文件上传')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * 运行时类型守卫：判断对象是否为 Express.Multer.File
   */
  private isExpressFile(value: unknown): value is Express.Multer.File {
    return Boolean(
      value
      && typeof value === 'object'
      && 'fieldname' in value
      && 'originalname' in value
      && 'buffer' in value,
    )
  }

  /**
   * 解析布尔值，处理字符串形式的布尔值
   */
  private parseBooleanValue(value: boolean | string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) {
      return defaultValue
    }

    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'string') {
      return value.toLowerCase() === 'true'
    }

    return defaultValue
  }

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @RequirePermissions(PERMISSIONS.uploads.create)
  @ApiDocs(UPLOADS_API_CONFIG.uploadSingleFile)
  async uploadSingleFile(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Body('allowDuplicate') allowDuplicate?: boolean | string,
  ): Promise<FileUploadApiResponseDto> {
    // 处理字符串形式的布尔值
    const allowDuplicateValue = this.parseBooleanValue(allowDuplicate, true)

    const storedFileInfo = await this.uploadsService.handleUploadedFile(file, {
      allowDuplicate: allowDuplicateValue,
    })

    return resp({
      msg: '文件上传成功',
      data: {
        id: storedFileInfo.id,
        originalName: storedFileInfo.originalName,
        size: storedFileInfo.size,
        mimeType: storedFileInfo.mimeType,
        publicUrl: storedFileInfo.publicUrl,
        uploadedAt: storedFileInfo.storedAt,
      },
    })
  }

  /**
   * 多文件上传
   */
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @RequirePermissions(PERMISSIONS.uploads.create)
  @ApiDocs(UPLOADS_API_CONFIG.uploadMultipleFiles)
  async uploadMultipleFiles(
    @UploadedFiles(MultipleFilesValidationPipe) files: Express.Multer.File[],
    @Body('allowDuplicate') allowDuplicate?: boolean | string,
  ): Promise<MultipleFileUploadApiResponseDto> {
    // 处理字符串形式的布尔值
    const allowDuplicateValue = this.parseBooleanValue(allowDuplicate, true)

    const storedFileInfos = await this.uploadsService.handleUploadedFiles(files, {
      allowDuplicate: allowDuplicateValue,
    })

    return resp({
      msg: '文件上传成功',
      data: storedFileInfos.map((storedFileInfo) => ({
        id: storedFileInfo.id,
        originalName: storedFileInfo.originalName,
        size: storedFileInfo.size,
        mimeType: storedFileInfo.mimeType,
        publicUrl: storedFileInfo.publicUrl,
        uploadedAt: storedFileInfo.storedAt,
      })),
    })
  }

  /**
   * 自定义文件上传配置
   */
  @Post('custom')
  @UseInterceptors(FileInterceptor('file'))
  @RequirePermissions(PERMISSIONS.uploads.create)
  @ApiDocs(UPLOADS_API_CONFIG.uploadCustomFile)
  async uploadCustomFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: FileValidationOptions & { allowDuplicate?: boolean },
  ): Promise<FileUploadApiResponseDto> {
    // 使用自定义验证选项
    const validationPipe = new FileValidationPipe(options)
    const validatedFile = validationPipe.transform(file)

    // 运行时类型守卫，避免不安全赋值
    if (!this.isExpressFile(validatedFile)) {
      throw BusinessException.badRequest(
        BUSINESS_CODES.MISSING_PARAMETER,
        '请选择要上传的文件',
      )
    }

    const storedFileInfo = await this.uploadsService
      .handleUploadedFile(validatedFile, {
        allowDuplicate: options.allowDuplicate ?? true,
      })

    return resp({
      msg: '文件上传成功',
      data: {
        id: storedFileInfo.id,
        originalName: storedFileInfo.originalName,
        size: storedFileInfo.size,
        mimeType: storedFileInfo.mimeType,
        publicUrl: storedFileInfo.publicUrl,
        uploadedAt: storedFileInfo.storedAt,
      },
    })
  }

  /**
   * 获取存储文件信息
   */
  @Get('stored/:id')
  @RequirePermissions(PERMISSIONS.uploads.read)
  @ApiDocs(UPLOADS_API_CONFIG.getStoredFile)
  async getStoredFile(@Param('id') id: string) {
    const storedFile = await this.uploadsService.getStoredFile(id)

    if (storedFile) {
      return resp({
        msg: '获取存储文件信息成功',
        data: {
          id: storedFile.id,
          originalName: storedFile.originalName,
          size: storedFile.size,
          mimeType: storedFile.mimeType,
          publicUrl: storedFile.publicUrl,
          uploadedAt: storedFile.storedAt,
        },
      })
    }

    return resp({
      msg: '存储文件不存在',
      code: BUSINESS_CODES.FILE_NOT_FOUND,
    })
  }

  /**
   * 删除存储文件
   */
  @Delete('stored/:id')
  @RequirePermissions(PERMISSIONS.uploads.delete)
  @ApiDocs(UPLOADS_API_CONFIG.deleteStoredFile)
  async deleteStoredFile(@Param('id') id: string): Promise<FileDeleteApiResponseDto> {
    const success = await this.uploadsService.deleteStoredFile(id)

    return resp({
      msg: success ? '文件删除成功' : '文件不存在或删除失败',
      code: success ? undefined : BUSINESS_CODES.FILE_NOT_FOUND,
    })
  }

  /**
   * 批量删除存储文件
   */
  @Delete('stored')
  @RequirePermissions(PERMISSIONS.uploads.delete)
  @ApiDocs(UPLOADS_API_CONFIG.deleteStoredFiles)
  async deleteStoredFiles(
    @Body() { ids }: { ids: string[] },
  ): Promise<BatchFileDeleteApiResponseDto> {
    const result = await this.uploadsService.deleteStoredFiles(ids)

    return resp({
      msg: `批量删除完成，成功：${result.success.length}，失败：${result.failed.length}`,
      data: result,
    })
  }

  /**
   * 下载文件
   */
  @Get('download/:id')
  @ApiDocs(UPLOADS_API_CONFIG.downloadFile)
  @RequirePermissions(PERMISSIONS.uploads.read)
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // 验证文件ID格式
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new BusinessException(BUSINESS_CODES.INVALID_PARAMETER, '无效的文件ID')
    }

    // 获取文件信息
    const fileInfo = await this.uploadsService.getStoredFile(id.trim())

    if (!fileInfo) {
      throw new BusinessException(BUSINESS_CODES.FILE_NOT_FOUND, '文件不存在或已被删除')
    }

    // 验证文件物理存在性
    try {
      await import('fs').then((fs) => fs.promises.access(fileInfo.localPath, fs.constants.R_OK))
    }
    catch {
      throw new BusinessException(BUSINESS_CODES.FILE_NOT_FOUND, '文件不存在于存储系统中')
    }

    try {
      // 创建文件读取流
      const fileStream = createReadStream(fileInfo.localPath)

      // 处理流错误
      fileStream.on('error', (error) => {
        console.error('文件流读取错误:', error)

        if (!res.headersSent) {
          res.status(500).json({
            code: BUSINESS_CODES.FILE_SYSTEM_ERROR,
            msg: '文件读取失败',
          })
        }
      })

      // 设置响应头 - 确保文件名正确编码
      const encodedFileName = encodeRFC5987Filename(fileInfo.originalName)

      res.set({
        'Content-Type': fileInfo.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
        'Content-Length': fileInfo.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      })

      return new StreamableFile(fileStream, {
        type: fileInfo.mimeType || 'application/octet-stream',
        length: fileInfo.size,
        disposition: `attachment; filename*=UTF-8''${encodedFileName}`,
      })
    }
    catch (error) {
      console.error('文件下载失败:', error)

      // 根据错误类型提供更具体的错误信息
      if (error instanceof Error) {
        if (error.message.includes('ENOENT')) {
          throw new BusinessException(BUSINESS_CODES.FILE_NOT_FOUND, '文件不存在')
        }

        if (error.message.includes('EACCES')) {
          throw new BusinessException(BUSINESS_CODES.FILE_SYSTEM_ERROR, '文件访问权限不足')
        }

        if (error.message.includes('EMFILE') || error.message.includes('ENFILE')) {
          throw new BusinessException(BUSINESS_CODES.FILE_SYSTEM_ERROR, '系统文件句柄不足，请稍后重试')
        }
      }

      throw new BusinessException(BUSINESS_CODES.FILE_SYSTEM_ERROR, '文件下载失败，请重试')
    }
  }
}
