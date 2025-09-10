import { PartialType } from '@nestjs/swagger'

import { CreateLicenseDto } from './create-license.dto'

/**
 * 更新授权码 DTO
 */
export class UpdateLicenseDto extends PartialType(CreateLicenseDto) {}
