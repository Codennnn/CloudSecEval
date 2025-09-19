import { ApiProperty, ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'

import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import { StandardListResponseDto } from '~/common/dto/standard-response.dto'

import { BaseBugReportDto } from './base-bug-report.dto'

/**
 * 时间线事件类型枚举
 */
export enum TimelineEventType {
  SUBMIT = 'SUBMIT', // 提交报告
  APPROVE = 'APPROVE', // 审批通过
  REJECT = 'REJECT', // 审批驳回
  REQUEST_INFO = 'REQUEST_INFO', // 要求补充信息
  FORWARD = 'FORWARD', // 转发审批
  RESUBMIT = 'RESUBMIT', // 重新提交
  UPDATE = 'UPDATE', // 更新报告
}

/**
 * 时间线中的漏洞报告信息
 */
export class TimelineBugReportDto
  extends PickType(BaseBugReportDto, ['id', 'title', 'severity', 'status']) {
}

/**
 * 获取时间线查询 DTO
 */
export class GetTimelineDto extends IntersectionType(PaginationQueryDto) {
  @ApiPropertyOptional({
    description: '事件类型筛选',
    enum: TimelineEventType,
  })
  @IsOptional()
  @IsEnum(TimelineEventType, { message: '事件类型必须是有效的枚举值' })
  readonly eventType?: TimelineEventType

  @ApiPropertyOptional({
    description: '开始时间筛选（ISO日期字符串）',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '开始时间必须是有效的ISO日期字符串' })
  readonly startDate?: string

  @ApiPropertyOptional({
    description: '结束时间筛选（ISO日期字符串）',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '结束时间必须是有效的ISO日期字符串' })
  readonly endDate?: string

  @ApiPropertyOptional({
    description: '关键字搜索（标题或内容）',
    example: 'SQL注入',
  })
  @IsOptional()
  @IsString({ message: '关键字必须是字符串' })
  readonly keyword?: string
}

/**
 * 时间线事件响应 DTO
 */
export class TimelineEventDto {
  @ApiProperty({ description: '事件ID' })
  readonly id!: string

  @ApiProperty({
    description: '事件类型',
    enum: TimelineEventType,
  })
  readonly eventType!: TimelineEventType

  @ApiProperty({ description: '事件发生时间' })
  readonly createdAt!: Date

  @ApiProperty({
    description: '漏洞报告信息',
    type: () => TimelineBugReportDto,
  })
  @Type(() => TimelineBugReportDto)
  readonly bugReport!: TimelineBugReportDto

  @ApiProperty({ description: '操作用户信息' })
  readonly user!: {
    id: string
    name: string | null
    email: string
    avatarUrl?: string | null
  }

  @ApiPropertyOptional({
    description: '审批相关信息（仅审批事件有值）',
  })
  readonly approvalInfo?: {
    action: string
    comment: string
    targetUser?: {
      id: string
      name: string | null
      email: string
    }
  }

  @ApiPropertyOptional({ description: '事件描述' })
  readonly description?: string

  @ApiProperty({ description: '组织信息' })
  readonly organization!: {
    id: string
    name: string
    code: string
  }
}

/**
 * 分页时间线事件响应 DTO
 */
export class TimelineEventResponseDto extends StandardListResponseDto<TimelineEventDto> {
  @ApiProperty({
    description: '时间线事件列表',
    type: [TimelineEventDto],
  })
  @Type(() => TimelineEventDto)
  @Expose()
  readonly data!: TimelineEventDto[]
}
