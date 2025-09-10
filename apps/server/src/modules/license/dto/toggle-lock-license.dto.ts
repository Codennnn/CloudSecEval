import { PickType } from '@nestjs/swagger'

import { BaseLicenseDto } from './base-license.dto'

/**
 * 锁定/解锁授权码 DTO
 *
 * @description 从 BaseLicenseDto 中选择锁定/解锁授权码所需的字段
 * 需要邮箱地址和锁定状态
 */
export class ToggleLockLicenseDto extends PickType(BaseLicenseDto, ['id', 'locked']) {
}
