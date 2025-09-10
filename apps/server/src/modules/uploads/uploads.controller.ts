import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'

import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { resp } from '~/common/utils/response.util'

import {
  AvatarValidationPipe,
  DocumentValidationPipe,
  FileValidationOptions,
  FileValidationPipe,
  ImageValidationPipe,
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

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  ) {
    const tempFileInfo = await this.uploadsService.handleUploadedFile(file)

    return resp({
      msg: '文件上传成功',
      data: tempFileInfo,
    })
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles(MultipleFilesValidationPipe) files: Express.Multer.File[],
  ) {
    const tempFileInfos = await this.uploadsService.handleUploadedFiles(files)

    return resp({
      msg: '文件上传成功',
      data: tempFileInfos.map((tempFileInfo) => ({
        ...tempFileInfo,
      })),
    })
  }

  /**
   * 上传图片文件（限制类型和大小）
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  ) {
    const tempFileInfo = await this.uploadsService.handleUploadedFile(file)

    return resp({
      msg: '图片上传成功',
      data: tempFileInfo,
    })
  }

  /**
   * 上传文档文件
   */
  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile(DocumentValidationPipe) file: Express.Multer.File,
  ) {
    const tempFileInfo = await this.uploadsService.handleUploadedFile(file)

    return resp({
      msg: '文档上传成功',
      data: tempFileInfo,
    })
  }

  /**
   * 上传头像文件
   */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile(AvatarValidationPipe) file: Express.Multer.File,
  ) {
    const tempFileInfo = await this.uploadsService.handleUploadedFile(file)

    return resp({
      msg: '头像上传成功',
      data: tempFileInfo,
    })
  }

  /**
   * 自定义文件上传配置
   */
  @Post('custom')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCustomFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: FileValidationOptions,
  ) {
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

    const tempFileInfo = await this.uploadsService
      .handleUploadedFile(validatedFile)

    return resp({
      msg: '文件上传成功',
      data: tempFileInfo,
    })
  }

  /**
   * 获取临时文件信息
   */
  @Get('temp/:id')
  getTempFile(@Param('id') id: string) {
    const tempFile = this.uploadsService.getTempFile(id)

    const result = tempFile
      ? resp({
          data: tempFile,
          msg: '获取临时文件信息成功',
        })
      : resp({
          msg: '临时文件不存在',
          code: BUSINESS_CODES.FILE_NOT_FOUND,
        })

    return result
  }

  /**
   * 清理临时文件
   */
  @Delete('temp/:id')
  cleanupTempFile(@Param('id') id: string) {
    this.uploadsService.cleanupTempFile(id)

    return resp({
      msg: '临时文件清理成功',
    })
  }

  /**
   * 批量清理临时文件
   */
  @Delete('temp')
  cleanupTempFiles(@Body() { ids }: { ids: string[] }) {
    for (const id of ids) {
      this.uploadsService.cleanupTempFile(id)
    }

    return resp({
      msg: '临时文件批量清理成功',
    })
  }
}
