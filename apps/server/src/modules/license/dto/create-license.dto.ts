import { PickType } from '@nestjs/swagger'

import { BaseLicenseDto } from './base-license.dto'

/**
 * 创建授权码 DTO
 */
export class CreateLicenseDto extends PickType(BaseLicenseDto, [
  'email',
  'remark',
  'purchaseAmount',
  'expiresAt',
]) {}
