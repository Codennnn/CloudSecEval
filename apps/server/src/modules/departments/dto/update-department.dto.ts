import { OmitType, PartialType } from '@nestjs/swagger'

import { CreateDepartmentDto } from './create-department.dto'

/**
 * 更新部门 DTO
 * 除了组织 ID 外，其他字段都是可选的，允许部分更新
 * 组织 ID 不允许修改，防止部门在组织间移动
 */
export class UpdateDepartmentDto extends PartialType(
  OmitType(CreateDepartmentDto, ['orgId']),
) {}
