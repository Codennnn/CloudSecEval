import { PickType } from '@nestjs/swagger'

import { BaseOrganizationDto } from './base-organization.dto'

export class CreateOrganizationDto extends PickType(BaseOrganizationDto, [
  'name',
  'code',
  'remark',
  'isActive',
]) {}
