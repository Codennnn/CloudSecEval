import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

import { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'

import { BaseLicenseDto } from './base-license.dto'

/**
 * 创建授权码响应数据 DTO
 */
export class CreateLicenseResponseDataDto extends PickType(BaseLicenseDto, ['code']) {
  @ApiProperty({
    description: '邮件消息ID',
    example: 'msg-123456789',
  })
  readonly messageId!: string
}

export class LicenseDetailDto extends BaseLicenseDto {
}

/**
 * 授权码列表项 DTO（脱敏版）
 */
export class LicenseListItemDto extends PickType(LicenseDetailDto, [
  'id',
  'email',
  'code',
  'remark',
  'isUsed',
  'locked',
  'purchaseAmount',
  'warningCount',
  'expiresAt',
  'createdAt',
  'updatedAt',
]) {
}

/**
 * 授权码统计信息 DTO
 */
export class LicenseStatsDto {
  @ApiProperty({
    description: '总访问次数',
    example: 150,
  })
  @IsNumber()
  readonly totalAccesses!: number

  @ApiProperty({
    description: '常用IP地址列表',
    example: ['192.168.1.1', '10.0.0.1'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  readonly commonIPs!: string[]

  @ApiProperty({
    description: '最近风险访问次数',
    example: 2,
  })
  @IsNumber()
  readonly recentRiskyAccesses!: number

  @ApiPropertyOptional({
    description: '最后访问时间',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly lastAccessTime!: Date

  @ApiProperty({
    description: '风险等级',
    example: 'low',
    enum: ['safe', 'low', 'medium', 'high'],
  })
  @IsIn(['safe', 'low', 'medium', 'high'])
  readonly riskLevel!: 'safe' | 'low' | 'medium' | 'high'

  @ApiProperty({
    description: '是否为风险访问',
    example: false,
  })
  @IsBoolean()
  readonly isRisky!: boolean
}

/**
 * 授权码详情（含统计信息）响应数据 DTO
 */
export class LicenseDetailWithStatsDto extends LicenseDetailDto {
  @ApiProperty({
    description: '统计信息',
    type: LicenseStatsDto,
  })
  @ValidateNested()
  @Type(() => LicenseStatsDto)
  readonly stats!: LicenseStatsDto
}

/**
 * 授权验证结果响应数据 DTO
 */
export class CheckLicenseResponseDataDto {
  @ApiProperty({
    description: '是否授权通过',
    example: true,
  })
  @IsBoolean()
  readonly authorized!: boolean

  @ApiProperty({
    description: '是否为风险访问',
    example: false,
  })
  @IsBoolean()
  readonly isRisky!: boolean

  @ApiPropertyOptional({
    description: '警告信息',
    example: '检测到来自新IP的访问',
  })
  @IsString()
  @IsOptional()
  readonly warning?: string
}

/**
 * 授权码详细状态信息 DTO
 */
export class LicenseDetailsDto {
  @ApiProperty({
    description: '是否已使用',
    example: true,
  })
  @IsBoolean()
  readonly isUsed!: boolean

  @ApiProperty({
    description: '是否锁定',
    example: false,
  })
  @IsBoolean()
  readonly locked!: boolean

  @ApiProperty({
    description: '是否过期',
    example: false,
  })
  @IsBoolean()
  readonly expired!: boolean

  @ApiPropertyOptional({
    description: '过期时间',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly expiresAt?: Date
}

/**
 * 管理员授权码检查结果响应数据 DTO
 */
export class AdminCheckLicenseResponseDataDto {
  @ApiProperty({
    description: '授权码是否有效',
    example: true,
  })
  @IsBoolean()
  readonly valid!: boolean

  @ApiProperty({
    description: '状态消息',
    example: '授权码有效且已使用',
  })
  @IsString()
  readonly message!: string

  @ApiProperty({
    description: '详细状态信息',
    type: LicenseDetailsDto,
  })
  @ValidateNested()
  @Type(() => LicenseDetailsDto)
  readonly details!: LicenseDetailsDto
}

/**
 * 访问日志记录结果响应数据 DTO
 */
export class LogAccessResponseDataDto {
  @ApiProperty({
    description: '记录是否成功',
    example: true,
  })
  @IsBoolean()
  readonly success!: boolean
}

/**
 * 授权码更新结果响应数据 DTO
 */
export class UpdateLicenseResponseDataDto extends BaseLicenseDto {
}

/**
 * 删除授权码结果响应数据 DTO
 */
export class DeleteLicenseResponseDataDto {
  @ApiProperty({
    description: '是否删除成功',
    example: true,
  })
  @IsBoolean()
  readonly deleted!: boolean
}

/**
 * 锁定/解锁授权码结果响应数据 DTO
 */
export class ToggleLockResponseDataDto extends PickType(BaseLicenseDto, ['locked']) {
}

/**
 * 发送过期提醒结果响应数据 DTO
 */
export class SendRemindersResponseDataDto {
  @ApiProperty({
    description: '成功发送数量',
    example: 5,
  })
  @IsNumber()
  readonly sent!: number

  @ApiProperty({
    description: '发送失败数量',
    example: 0,
  })
  @IsNumber()
  readonly failed!: number

  @ApiProperty({
    description: '错误信息列表',
    type: [String],
  })
  @IsArray()
  readonly errors!: string[]
}

/**
 * 创建授权码 API 响应 DTO
 */
export class CreateLicenseApiResponseDto extends StandardResponseDto<CreateLicenseResponseDataDto> {
  @ApiProperty({
    description: '创建授权码响应数据',
    type: CreateLicenseResponseDataDto,
  })
  declare data: CreateLicenseResponseDataDto
}

/**
 * 授权码列表 API 响应 DTO
 */
export class LicenseListApiResponseDto extends StandardListResponseDto<LicenseListItemDto> {
  @ApiProperty({
    description: '授权码列表数据',
    type: [LicenseListItemDto],
  })
  declare data: LicenseListItemDto[]
}

/**
 * 单个授权码 API 响应 DTO
 */
export class LicenseDetailApiResponseDto extends StandardResponseDto<LicenseDetailWithStatsDto> {
  @ApiProperty({
    description: '授权码详情数据',
    type: LicenseDetailWithStatsDto,
  })
  declare data: LicenseDetailWithStatsDto
}

/**
 * 检查授权码 API 响应 DTO
 */
export class CheckLicenseApiResponseDto extends StandardResponseDto<CheckLicenseResponseDataDto> {
  @ApiProperty({
    description: '授权验证结果数据',
    type: CheckLicenseResponseDataDto,
  })
  declare data: CheckLicenseResponseDataDto
}

/**
 * 管理员检查授权码 API 响应 DTO
 */
export class AdminCheckLicenseApiResponseDto extends StandardResponseDto<
  AdminCheckLicenseResponseDataDto
> {
  @ApiProperty({
    description: '管理员授权码检查结果数据',
    type: AdminCheckLicenseResponseDataDto,
  })
  declare data: AdminCheckLicenseResponseDataDto
}

/**
 * 记录访问日志 API 响应 DTO
 */
export class LogAccessApiResponseDto extends StandardResponseDto<LogAccessResponseDataDto | null> {
  @ApiProperty({
    description: '访问日志记录结果数据',
    type: LogAccessResponseDataDto,
  })
  declare data: LogAccessResponseDataDto | null
}

/**
 * 更新授权码 API 响应 DTO
 */
export class UpdateLicenseApiResponseDto extends StandardResponseDto<UpdateLicenseResponseDataDto> {
  @ApiProperty({
    description: '授权码更新结果数据',
    type: UpdateLicenseResponseDataDto,
  })
  declare data: UpdateLicenseResponseDataDto
}

/**
 * 删除授权码 API 响应 DTO
 */
export class DeleteLicenseApiResponseDto extends StandardResponseDto<DeleteLicenseResponseDataDto> {
  @ApiProperty({
    description: '授权码删除结果数据',
    type: DeleteLicenseResponseDataDto,
  })
  declare data: DeleteLicenseResponseDataDto
}

/**
 * 锁定/解锁授权码 API 响应 DTO
 */
export class ToggleLockApiResponseDto extends StandardResponseDto<ToggleLockResponseDataDto> {
  @ApiProperty({
    description: '锁定/解锁结果数据',
    type: ToggleLockResponseDataDto,
  })
  declare data: ToggleLockResponseDataDto
}

/**
 * 发送过期提醒 API 响应 DTO
 */
export class SendRemindersApiResponseDto extends StandardResponseDto<SendRemindersResponseDataDto> {
  @ApiProperty({
    description: '发送过期提醒结果数据',
    type: SendRemindersResponseDataDto,
  })
  declare data: SendRemindersResponseDataDto
}
