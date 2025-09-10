import { ApiProperty, ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { PaginationQueryDto } from '~/common/dto/pagination-query.dto'
import { BaseSearchDto } from '~/common/search/dto/base-search.dto'
import { UserSearchFields } from '~/modules/users/dto/find-users.dto'

/**
 * 获取角色成员查询参数 DTO（支持高级搜索）
 * - 继承分页参数、通用搜索参数、用户可搜索字段
 * - 与用户列表高级搜索保持一致能力
 */
export class GetRoleMembersDto extends IntersectionType(
  PaginationQueryDto,
  BaseSearchDto,
  UserSearchFields,
) {
  @ApiPropertyOptional({ description: '是否包含子孙部门的用户（需要提供 departmentId）' })
  @IsOptional()
  @IsBoolean({ message: '包含子孙部门必须是布尔值' })
  @BooleanTransform()
  includeDescendants?: boolean
}

export class AddRoleMembersDto {
  @ApiProperty({ description: '用户 ID 列表' })
  @IsArray({ message: '用户 ID 列表必须是数组' })
  @IsString({ each: true, message: '每个用户 ID 必须是字符串' })
  userIds!: string[]

  @ApiPropertyOptional({ description: '过期时间' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  note?: string
}

export class RemoveRoleMembersDto extends PickType(AddRoleMembersDto, ['userIds']) {}
