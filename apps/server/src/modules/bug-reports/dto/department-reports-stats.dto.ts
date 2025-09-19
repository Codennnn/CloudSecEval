import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDateString, IsOptional, IsString } from 'class-validator'

import { BugReportStatus } from '#prisma/client'
import { StandardResponseDto } from '~/common/dto/standard-response.dto'
import { BaseDepartmentDto } from '~/modules/departments/dto/base-department.dto'

/**
 * 获取部门报告统计的查询参数 DTO
 */
export class GetDepartmentReportsStatsDto {
  @ApiPropertyOptional({
    description: '开始日期（ISO 8601格式）',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  readonly startDate?: string

  @ApiPropertyOptional({
    description: '结束日期（ISO 8601格式）',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  readonly endDate?: string

  @ApiPropertyOptional({
    description: '报告状态过滤',
    example: 'APPROVED',
  })
  @IsOptional()
  @IsString()
  readonly status?: string
}

/**
 * 部门信息 DTO
 */
export class DepartmentInfoDto
  extends PickType(BaseDepartmentDto, ['id', 'name', 'remark']) {
  @ApiPropertyOptional({
    description: '父部门名称',
    example: '研发中心',
  })
  @Expose()
  readonly parentName?: string

  @ApiPropertyOptional({
    description: '部门层级路径',
    example: '研发中心/技术部',
  })
  @Expose()
  readonly path?: string
}

/**
 * 部门报告统计数据项 DTO
 */
export class DepartmentReportStatsDto {
  @ApiProperty({
    description: '部门信息',
    type: DepartmentInfoDto,
  })
  @Type(() => DepartmentInfoDto)
  @Expose()
  readonly department!: DepartmentInfoDto

  @ApiProperty({
    description: '总报告数量',
    example: 25,
  })
  @Expose()
  readonly reportCount!: number

  @ApiProperty({
    description: '各状态报告数量统计，key为状态值，value为包含状态和数量的对象',
    additionalProperties: {
      type: 'object',
      properties: {
        status: { enum: Object.values(BugReportStatus) },
        count: { type: 'number' },
      },
    },
  })
  @Expose()
  readonly statusCounts!: Record<
    BugReportStatus,
    { status: BugReportStatus, count: number }
  >
}

/**
 * 部门报告统计响应数据 DTO
 */
export class DepartmentReportsStatsDataDto {
  @ApiProperty({
    description: '总报告数',
    example: 150,
  })
  @Expose()
  readonly totalReports!: number

  @ApiProperty({
    description: '参与部门数',
    example: 8,
  })
  @Expose()
  readonly totalDepartments!: number

  @ApiProperty({
    description: '部门统计详情',
    type: [DepartmentReportStatsDto],
  })
  @Type(() => DepartmentReportStatsDto)
  @Expose()
  readonly departmentStats!: DepartmentReportStatsDto[]
}

/**
 * 部门报告统计响应 DTO
 */
export class DepartmentReportsStatsResponseDto
  extends StandardResponseDto<DepartmentReportsStatsDataDto> {
  @ApiProperty({
    description: '部门报告统计数据',
    type: DepartmentReportsStatsDataDto,
  })
  @Type(() => DepartmentReportsStatsDataDto)
  declare data: DepartmentReportsStatsDataDto
}
