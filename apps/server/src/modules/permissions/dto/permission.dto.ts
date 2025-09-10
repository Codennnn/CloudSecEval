import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { IsId } from '~/common/decorators/uuid.decorator'
import { CommonTimeDto } from '~/common/dto/common.dto'

/**
 * 权限基础 DTO
 */
export class BasePermissionDto extends CommonTimeDto {
  @ApiProperty({
    description: '权限ID',
  })
  @IsId('权限 ID')
  readonly id!: string

  @ApiProperty({
    description: '资源名称',
    example: 'users',
  })
  readonly resource!: string

  @ApiProperty({
    description: '操作类型',
    example: 'read',
  })
  readonly action!: string

  @ApiProperty({
    description: '权限标识符',
    example: 'users:read',
  })
  readonly slug!: string

  @ApiPropertyOptional({
    description: '权限描述',
    example: '查看用户信息',
  })
  readonly description?: string

  @ApiProperty({
    description: '是否为系统权限',
    example: true,
  })
  @BooleanTransform()
  readonly system!: boolean
}

/**
 * 创建权限 DTO
 */
export class CreatePermissionDto {
  @ApiProperty({
    description: '资源名称',
    example: 'users',
    pattern: '^[a-z][a-z0-9_]*$',
  })
  @IsString({ message: '资源名称必须是字符串' })
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: '资源名称只能包含小写字母、数字和下划线，且以字母开头',
  })
  @MaxLength(30, { message: '资源名称不能超过30个字符' })
  readonly resource!: string

  @ApiProperty({
    description: '操作类型',
    example: 'read',
    pattern: '^[a-z*][a-z0-9_]*$',
  })
  @IsString({ message: '操作类型必须是字符串' })
  @Matches(/^[a-z*][a-z0-9_]*$/, {
    message: '操作类型只能包含小写字母、数字、下划线和星号',
  })
  @MaxLength(20, { message: '操作类型不能超过20个字符' })
  readonly action!: string

  @ApiPropertyOptional({
    description: '权限描述',
    example: '查看用户信息',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '权限描述必须是字符串' })
  @MaxLength(100, { message: '权限描述不能超过100个字符' })
  readonly description?: string
}

/**
 * 权限分组 DTO（用于权限目录展示）
 */
export class PermissionGroupDto {
  @ApiProperty({
    description: '资源名称',
    example: 'users',
  })
  readonly resource!: string

  @ApiProperty({
    description: '资源显示名称',
    example: '用户管理',
  })
  readonly resourceName!: string

  @ApiProperty({
    description: '该资源下的权限列表',
    type: [BasePermissionDto],
  })
  readonly permissions!: BasePermissionDto[]
}
