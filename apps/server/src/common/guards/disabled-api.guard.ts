import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { BUSINESS_CODES } from '../constants/business-codes'
import { DISABLED_API_KEY, DisabledApiMetadata } from '../decorators/disabled-api.decorator'
import { BusinessException } from '../exceptions/business.exception'

/**
 * 禁用API守卫
 *
 * 功能描述：
 * - 检查请求的路由是否被 @DisabledApi 装饰器标记为禁用
 * - 如果接口被禁用，抛出相应的业务异常
 * - 根据禁用类型返回不同的错误信息
 *
 * 工作原理：
 * 1. 通过 Reflector 获取路由方法上的 @DisabledApi 元数据
 * 2. 如果存在禁用元数据，检查禁用类型
 * 3. 抛出相应的业务异常，包含禁用原因和恢复时间信息
 *
 * 优势：
 * - 统一的接口禁用机制
 * - 清晰的错误信息，包含禁用原因和预计恢复时间
 * - 支持维护模式和临时禁用的区分
 * - 不需要修改业务逻辑代码
 */
@Injectable()
export class DisabledApiGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * 守卫执行方法
   *
   * @param context 执行上下文
   * @returns 是否允许继续执行
   * @throws BusinessException 当接口被禁用时抛出异常
   */
  canActivate(context: ExecutionContext): boolean {
    // 获取路由方法上的禁用元数据
    const disabledMetadata = this.reflector.get<DisabledApiMetadata>(
      DISABLED_API_KEY,
      context.getHandler(),
    )

    // 如果没有禁用元数据，允许正常访问
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!disabledMetadata) {
      return true
    }

    // 构建错误信息
    const errorMessage = this.buildErrorMessage(disabledMetadata)

    // 根据禁用类型抛出不同的异常
    const businessCode = disabledMetadata.isMaintenanceMode
      ? BUSINESS_CODES.API_MAINTENANCE_MODE
      : BUSINESS_CODES.API_TEMPORARILY_DISABLED

    throw new BusinessException(
      businessCode,
      errorMessage,
      HttpStatus.SERVICE_UNAVAILABLE,
      {
        reason: disabledMetadata.reason,
        estimatedRecoveryTime: disabledMetadata.estimatedRecoveryTime,
        disabledAt: disabledMetadata.disabledAt,
        isMaintenanceMode: disabledMetadata.isMaintenanceMode,
      },
    )
  }

  /**
   * 构建错误消息
   *
   * @param metadata 禁用元数据
   * @returns 错误消息字符串
   */
  private buildErrorMessage(metadata: DisabledApiMetadata): string {
    let message = metadata.isMaintenanceMode
      ? `该接口正在维护中：${metadata.reason}`
      : `该接口已临时禁用：${metadata.reason}`

    if (metadata.estimatedRecoveryTime) {
      message += `，预计恢复时间：${metadata.estimatedRecoveryTime}`
    }

    return message
  }
}
