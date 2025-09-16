import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator'

import { BooleanTransform } from '~/common/decorators/boolean-transform.decorator'
import { IsId } from '~/common/decorators/uuid.decorator'
import { CommonTimeDto } from '~/common/dto/common.dto'
import { DepartmentRefDto } from '~/modules/departments/dto/base-department.dto'
import { OrganizationRefDto } from '~/modules/organizations/dto/base-organization.dto'
import { UserRoleDto } from '~/modules/roles/dto/role-response.dto'

/**
 * 基础用户 DTO
 */
export class BaseUserDto extends CommonTimeDto {
  @ApiProperty({
    description: '用户 ID',
  })
  @IsId('用户 ID')
  @Expose()
  readonly id!: string

  @ApiProperty({
    description: '邮箱地址',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @Expose()
  readonly email!: string

  @ApiPropertyOptional({
    description: '用户名/姓名',
    example: '张三',
  })
  @IsString({ message: '用户名必须是字符串' })
  @IsOptional()
  @Expose()
  readonly name?: string

  @ApiPropertyOptional({
    description: '手机号',
  })
  @IsString({ message: '手机号必须是字符串' })
  @IsOptional()
  @Expose()
  readonly phone?: string

  @ApiPropertyOptional({
    description: '头像URL',
  })
  @IsString({ message: '头像必须是字符串' })
  @IsOptional()
  @Expose()
  readonly avatarUrl?: string

  @ApiProperty({
    description: '密码',
    minLength: 6,
  })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于 6 个字符' })
  @Expose()
  readonly password!: string

  @ApiPropertyOptional({
    description: '账户是否激活',
    default: true,
  })
  @IsBoolean({ message: '激活状态必须是布尔值' })
  @IsOptional()
  @BooleanTransform(true)
  @Expose()
  readonly isActive?: boolean
}

export class SafeUserDto extends OmitType(BaseUserDto, ['password']) {
  @ApiProperty({
    description: '所属组织信息',
    type: OrganizationRefDto,
  })
  @ValidateNested()
  @Type(() => OrganizationRefDto)
  @IsObject()
  @Expose()
  readonly organization!: OrganizationRefDto

  @ApiPropertyOptional({
    description: '所属部门信息',
    type: DepartmentRefDto,
  })
  @ValidateNested()
  @Type(() => DepartmentRefDto)
  @IsObject()
  @IsOptional()
  @Expose()
  readonly department?: DepartmentRefDto

  @ApiPropertyOptional({
    description: '用户角色',
    type: [UserRoleDto],
  })
  @ValidateNested()
  @Type(() => UserRoleDto)
  @IsArray()
  @IsOptional()
  @Expose()
  readonly userRoles?: UserRoleDto[]
}

export class CurrentUserDto extends SafeUserDto {}
