import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator'

/**
 * 审批动作枚举
 */
export enum ApprovalAction {
  APPROVE = 'APPROVE', // 审批通过
  REJECT = 'REJECT', // 审批驳回
  REQUEST_INFO = 'REQUEST_INFO', // 要求补充信息
  FORWARD = 'FORWARD', // 转发审批
}

/**
 * 统一审批处理 DTO
 */
export class ProcessApprovalDto {
  @ApiProperty({
    description: '审批动作',
    enum: ApprovalAction,
    example: ApprovalAction.APPROVE,
  })
  @IsEnum(ApprovalAction, { message: '审批动作必须是有效的枚举值' })
  readonly action!: ApprovalAction

  @ApiProperty({
    description: '审批意见',
    example: '漏洞确认，风险等级合理，建议尽快修复',
    maxLength: 1000,
  })
  @IsString({ message: '审批意见必须是字符串' })
  @IsNotEmpty({ message: '审批意见不能为空' })
  readonly comment!: string

  @ApiPropertyOptional({
    description: '转发目标用户ID（仅当action为FORWARD时需要）',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID('4', { message: '转发目标用户ID必须是有效的UUID' })
  @ValidateIf((o: ProcessApprovalDto) => o.action === ApprovalAction.FORWARD)
  @IsNotEmpty({ message: '转发操作必须指定目标用户ID' })
  readonly targetUserId?: string
}

/**
 * 审批历史记录响应 DTO
 */
export class ApprovalLogDto {
  @ApiProperty({ description: '审批记录ID' })
  readonly id!: string

  @ApiProperty({ description: '审批动作', enum: ApprovalAction })
  readonly action!: ApprovalAction

  @ApiProperty({ description: '审批意见' })
  readonly comment!: string

  @ApiPropertyOptional({ description: '转发目标用户信息' })
  readonly targetUser?: {
    id: string
    name: string
    email: string
  }

  @ApiProperty({ description: '审批人信息' })
  readonly approver!: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }

  @ApiProperty({ description: '审批时间' })
  readonly createdAt!: Date
}

/**
 * 获取审批历史查询 DTO
 */
export class GetApprovalHistoryDto {
  @ApiPropertyOptional({
    description: '是否包含审批人详细信息',
    default: true,
  })
  @IsOptional()
  readonly includeApprover?: boolean = true

  @ApiPropertyOptional({
    description: '是否包含转发目标用户信息',
    default: true,
  })
  @IsOptional()
  readonly includeTargetUser?: boolean = true
}
