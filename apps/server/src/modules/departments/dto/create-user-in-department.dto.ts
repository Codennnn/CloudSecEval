import { OmitType } from '@nestjs/swagger'

import { CreateUserDto } from '~/modules/users/dto/create-user.dto'

/**
 * 在部门作用域下创建用户时的请求体 DTO
 * - 去除 orgId 与 departmentId，由后端根据部门路径参数自动注入
 */
export class CreateUserInDepartmentDto extends OmitType(CreateUserDto, ['orgId', 'departmentId']) {}
