import { PartialType } from '@nestjs/swagger'

import { CreateOrganizationDto } from './create-organization.dto'

/**
 * 更新组织 DTO
 * 所有字段都是可选的，允许部分更新
 */
export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}
