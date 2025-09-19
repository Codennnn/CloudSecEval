import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

import { BugReportStatus, BugSeverity } from '#prisma/client'

/**
 * 历史事件类型枚举
 */
export enum HistoryEventType {
  /** 首次提交 */
  SUBMIT = 'SUBMIT',
  /** 重新提交 */
  RESUBMIT = 'RESUBMIT',
  /** 审批通过 */
  APPROVE = 'APPROVE',
  /** 审批驳回 */
  REJECT = 'REJECT',
  /** 要求补充信息 */
  REQUEST_INFO = 'REQUEST_INFO',
  /** 转发审批 */
  FORWARD = 'FORWARD',
  /** 更新报告内容 */
  UPDATE = 'UPDATE',
}

/**
 * 历史事件基础信息
 */
export class HistoryEventDto {
  @ApiProperty({ description: '事件ID' })
  readonly id!: string

  @ApiProperty({
    description: '事件类型',
    enum: HistoryEventType,
  })
  readonly eventType!: HistoryEventType

  @ApiProperty({ description: '事件发生时间' })
  readonly createdAt!: Date

  @ApiProperty({ description: '操作用户信息' })
  readonly user!: {
    id: string
    name: string | null
    email: string
    avatarUrl?: string | null
  }

  @ApiProperty({ description: '事件描述' })
  readonly description!: string

  @ApiPropertyOptional({ description: '审批相关信息' })
  readonly approvalInfo?: {
    action: string
    comment?: string
    targetUser?: {
      id: string
      name: string | null
      email: string
    }
  }

  @ApiPropertyOptional({ description: '提交相关信息' })
  readonly submitInfo?: {
    title: string
    severity: BugSeverity
    status: BugReportStatus
    isResubmit: boolean
    changedFields?: string[]
  }
}

/**
 * 扩展的审批历史记录DTO，包含提交记录
 */
export class ExtendedApprovalHistoryDto extends HistoryEventDto {
  @ApiProperty({ description: '漏洞报告基础信息' })
  readonly bugReport?: {
    id: string
    title: string
    severity: BugSeverity
    status: BugReportStatus
  }
}

/**
 * 获取完整历史记录查询参数
 */
export class GetCompleteHistoryDto {
  @ApiPropertyOptional({
    description: '事件类型过滤',
    enum: HistoryEventType,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(HistoryEventType, { each: true, message: '事件类型必须是有效的枚举值' })
  readonly eventTypes?: HistoryEventType[]

  @ApiPropertyOptional({
    description: '是否包含用户详细信息',
    default: true,
  })
  @IsOptional()
  readonly includeUser?: boolean = true

  @ApiPropertyOptional({
    description: '是否包含审批详情',
    default: true,
  })
  @IsOptional()
  readonly includeApprovalDetails?: boolean = true

  @ApiPropertyOptional({
    description: '是否包含提交详情',
    default: true,
  })
  @IsOptional()
  readonly includeSubmitDetails?: boolean = true
}

/**
 * 扩展的获取审批历史查询DTO
 */
export class ExtendedGetApprovalHistoryDto {
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

  @ApiPropertyOptional({
    description: '是否包含提交记录',
    default: true,
  })
  @IsOptional()
  readonly includeSubmissions?: boolean = true
}
