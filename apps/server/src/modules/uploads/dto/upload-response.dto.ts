import { ApiProperty } from '@nestjs/swagger'

import { StandardResponseDto } from '~/common/dto/standard-response.dto'

/**
 * 文件上传响应数据
 */
export class FileUploadResponseDataDto {
  @ApiProperty({
    description: '文件唯一标识',
    example: 'abc123def456',
  })
  id!: string

  @ApiProperty({
    description: '原始文件名',
    example: 'document.pdf',
  })
  originalName!: string

  @ApiProperty({
    description: '文件大小（字节）',
    example: 1024000,
  })
  size!: number

  @ApiProperty({
    description: '文件MIME类型',
    example: 'application/pdf',
  })
  mimeType!: string

  @ApiProperty({
    description: '文件公共访问URL',
    example: 'http://localhost:3000/api/static/documents/abc123def456.pdf',
  })
  publicUrl!: string

  @ApiProperty({
    description: '文件上传时间',
    example: '2024-01-01T12:00:00.000Z',
  })
  uploadedAt!: string
}

/**
 * 单文件上传响应
 */
export class FileUploadApiResponseDto extends StandardResponseDto<FileUploadResponseDataDto> {
  @ApiProperty({
    description: '文件上传响应数据',
    type: FileUploadResponseDataDto,
  })
  data!: FileUploadResponseDataDto
}

/**
 * 多文件上传响应
 */
export class MultipleFileUploadApiResponseDto
  extends StandardResponseDto<FileUploadResponseDataDto[]> {
  @ApiProperty({
    description: '多文件上传响应数据',
    type: [FileUploadResponseDataDto],
  })
  data!: FileUploadResponseDataDto[]
}

/**
 * 获取文件信息响应
 */
export class FileInfoApiResponseDto extends StandardResponseDto<FileUploadResponseDataDto> {
  @ApiProperty({
    description: '文件信息响应数据',
    type: FileUploadResponseDataDto,
  })
  data!: FileUploadResponseDataDto
}

/**
 * 文件删除响应数据
 */
export class FileDeleteResponseDataDto {
  @ApiProperty({
    description: '删除成功的文件ID列表',
    type: [String],
    example: ['abc123', 'def456'],
  })
  success!: string[]

  @ApiProperty({
    description: '删除失败的文件ID列表',
    type: [String],
    example: ['xyz789'],
  })
  failed!: string[]
}

/**
 * 批量文件删除响应
 */
export class BatchFileDeleteApiResponseDto extends StandardResponseDto<FileDeleteResponseDataDto> {
  @ApiProperty({
    description: '批量删除响应数据',
    type: FileDeleteResponseDataDto,
  })
  data!: FileDeleteResponseDataDto
}

/**
 * 单文件删除响应
 */
export class FileDeleteApiResponseDto extends StandardResponseDto<null> {
  @ApiProperty({
    description: '删除成功，无返回数据',
    example: null,
  })
  data!: null
}
