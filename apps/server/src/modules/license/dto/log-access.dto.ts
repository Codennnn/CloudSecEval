import { PickType } from '@nestjs/swagger'

import { BaseLicenseDto } from './base-license.dto'

/**
 * 记录访问日志 DTO
 *
 * @description 从 BaseLicenseDto 中选择记录访问日志所需的字段
 * 需要邮箱、授权码和可选的页面路径信息
 */
export class LogAccessDto extends PickType(BaseLicenseDto, ['email', 'code', 'pagePath']) {}
