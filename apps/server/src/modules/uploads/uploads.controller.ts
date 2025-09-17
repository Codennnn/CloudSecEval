import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'

import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { resp } from '~/common/utils/response.util'
import { UPLOADS_API_CONFIG } from '~/config/documentation/api-operations.config'
import { ApiDocs } from '~/config/documentation/decorators/api-docs.decorator'
import { PERMISSIONS, RequirePermissions } from '~/modules/permissions/decorators/require-permissions.decorator'
import { PermissionsGuard } from '~/modules/permissions/guards/permissions.guard'

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
@UseGuards(PermissionsGuard)
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

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @RequirePermissions(PERMISSIONS.uploads.create)
  @ApiDocs(UPLOADS_API_CONFIG.uploadSingleFile)
  async uploadSingleFile(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  ): Promise<FileUploadApiResponseDto> {
    const storedFileInfo = await this.uploadsService.handleUploadedFile(file)

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

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @RequirePermissions(PERMISSIONS.uploads.create)
  @ApiDocs(UPLOADS_API_CONFIG.uploadMultipleFiles)
  async uploadMultipleFiles(
    @UploadedFiles(MultipleFilesValidationPipe) files: Express.Multer.File[],
  ): Promise<MultipleFileUploadApiResponseDto> {
    const storedFileInfos = await this.uploadsService.handleUploadedFiles(files)

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
    @Body() options: FileValidationOptions,
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
      .handleUploadedFile(validatedFile)

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
  getStoredFile(@Param('id') id: string) {
    const storedFile = this.uploadsService.getStoredFile(id)

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
}
