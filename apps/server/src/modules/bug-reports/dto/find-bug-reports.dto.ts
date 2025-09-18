import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator'

import { BugReportStatus } from '#prisma/client'
import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { EnumOrOperatorsTransform, IsEnumOrOperators } from '~/common/decorators/enum-or-operators.decorator'
import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import { VulnerabilitySeverity } from '~/common/enums/severity.enum'
import {
  AdvancedDateSearchOperators,
  AdvancedStringSearchOperators,
} from '~/common/search/dto/advanced-search-operators.dto'
import { BaseSearchDto } from '~/common/search/dto/base-search.dto'

/**
 * 漏洞报告搜索字段 DTO
 * 支持高级搜索操作符，提供强大的查询能力
 */
export class BugReportSearchFields {
  @ApiPropertyOptional({ description: '标题搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  title?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({
    description: '漏洞等级搜索条件',
    oneOf: [
      { enum: Object.values(VulnerabilitySeverity), description: '简单枚举值' },
      { type: 'object', description: '高级搜索操作符' },
    ],
    example: VulnerabilitySeverity.HIGH,
  })
  @IsOptional()
  @IsEnumOrOperators(VulnerabilitySeverity)
  @EnumOrOperatorsTransform()
  severity?: AdvancedStringSearchOperators | VulnerabilitySeverity

  @ApiPropertyOptional({
    description: '状态搜索条件',
    oneOf: [
      { enum: Object.values(BugReportStatus), description: '简单枚举值' },
      { type: 'object', description: '高级搜索操作符' },
    ],
    example: BugReportStatus.PENDING,
  })
  @IsOptional()
  @IsEnumOrOperators(BugReportStatus)
  @EnumOrOperatorsTransform()
  status?: AdvancedStringSearchOperators | BugReportStatus

  @ApiPropertyOptional({ description: '攻击方式搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  attackMethod?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '描述搜索条件', type: AdvancedStringSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedStringSearchOperators)
  description?: AdvancedStringSearchOperators | string

  @ApiPropertyOptional({ description: '创建时间搜索条件', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  createdAt?: AdvancedDateSearchOperators | Date

  @ApiPropertyOptional({ description: '更新时间搜索条件', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  updatedAt?: AdvancedDateSearchOperators | Date

  @ApiPropertyOptional({ description: '审核时间搜索条件', type: AdvancedDateSearchOperators })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedDateSearchOperators)
  reviewedAt?: AdvancedDateSearchOperators | Date
}

/**
 * 查询漏洞报告 DTO
 * 支持高级搜索功能，使用通用搜索框架
 */
export class FindBugReportsDto extends IntersectionType(
  PaginationQueryDto,
  BaseSearchDto,
  BugReportSearchFields,
) {
  @ApiPropertyOptional({ description: '是否包含关联的用户信息', example: true })
  @IsOptional()
  @IsBoolean({ message: '包含用户信息必须是布尔值' })
  @BooleanTransform()
  includeUser?: boolean

  @ApiPropertyOptional({ description: '是否包含关联的审核人信息', example: true })
  @IsOptional()
  @IsBoolean({ message: '包含审核人信息必须是布尔值' })
  @BooleanTransform()
  includeReviewer?: boolean

  @ApiPropertyOptional({ description: '是否包含关联的组织信息', example: false })
  @IsOptional()
  @IsBoolean({ message: '包含组织信息必须是布尔值' })
  @BooleanTransform()
  includeOrganization?: boolean
}
