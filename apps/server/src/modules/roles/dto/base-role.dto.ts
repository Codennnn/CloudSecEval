import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { IsId } from '~/common/decorators/uuid.decorator'
import { CommonTimeDto } from '~/common/dto/common.dto'

/**
 * 角色基础 DTO
 */
export class BaseRoleDto extends CommonTimeDto {
  @ApiProperty({
    description: '角色ID',
  })
  @IsId('角色 ID')
  readonly id!: string

  @ApiPropertyOptional({
    description: '组织 ID，null 表示系统级角色',
  })
  @IsOptional()
  @IsId('组织 ID', { required: false })
  readonly orgId?: string

  @ApiProperty({
    description: '角色名称',
    example: '组织管理员',
    minLength: 1,
    maxLength: 20,
  })
  @IsString({ message: '角色名称必须是字符串' })
  @MinLength(1, { message: '角色名称不能为空' })
  @MaxLength(20, { message: '角色名称不能超过 20 个字符' })
  readonly name!: string

  @ApiProperty({
    description: '角色标识符',
    example: 'org_admin',
    pattern: '^[a-z][a-z0-9_]*$',
  })
  @IsString({ message: '角色标识符必须是字符串' })
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: '角色标识符只能包含小写字母、数字和下划线，且以字母开头',
  })
  @MaxLength(30, { message: '角色标识符不能超过 30 个字符' })
  readonly slug!: string

  @ApiPropertyOptional({
    description: '角色描述',
    example: '负责组织内部的用户管理和部门管理',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  @MaxLength(200, { message: '角色描述不能超过 200 个字符' })
  readonly description?: string

  @ApiProperty({
    description: '是否为系统内置角色',
  })
  @IsBoolean({ message: '系统角色标识必须是布尔值' })
  @BooleanTransform()
  readonly system!: boolean

  @ApiProperty({
    description: '角色是否启用',
  })
  @IsBoolean({ message: '角色状态必须是布尔值' })
  @BooleanTransform()
  readonly isActive!: boolean
}
