import { PickType } from '@nestjs/swagger'

import { BaseLicenseDto } from './base-license.dto'

/**
 * 获取单个授权码 DTO
 *
 * @description 根据授权码 ID 获取详细信息
 */
export class GetLicenseDto extends PickType(BaseLicenseDto, ['id']) {
}
