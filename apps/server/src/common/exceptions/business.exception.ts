import { type BusinessCode, getBusinessCodeMessage } from '@mono/constants'
import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * 业务异常类
 *
 * 用于抛出带有自定义业务状态码的异常
 * 支持自定义消息和额外数据
 */
export class BusinessException extends HttpException {
  public readonly businessCode: BusinessCode
  public readonly businessMessage: string
  public readonly extraData?: unknown

  constructor(
    businessCode: BusinessCode,
    message?: string,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
    extraData?: unknown,
  ) {
    const businessMessage = message ?? getBusinessCodeMessage(businessCode)

    super(
      {
        businessCode,
        message: businessMessage,
        extraData,
      },
      httpStatus,
    )

    this.businessCode = businessCode
    this.businessMessage = businessMessage
    this.extraData = extraData
  }

  /**
   * 快速创建常见的业务异常
   */
  static badRequest(
    businessCode: BusinessCode,
    message?: string,
    extraData?: unknown,
  ): BusinessException {
    return new BusinessException(businessCode, message, HttpStatus.BAD_REQUEST, extraData)
  }

  static unauthorized(
    businessCode: BusinessCode,
    message?: string,
    extraData?: unknown,
  ): BusinessException {
    return new BusinessException(businessCode, message, HttpStatus.OK, extraData)
  }

  static forbidden(
    businessCode: BusinessCode,
    message?: string,
    extraData?: unknown,
  ): BusinessException {
    return new BusinessException(businessCode, message, HttpStatus.FORBIDDEN, extraData)
  }

  static notFound(
    businessCode: BusinessCode,
    message?: string,
    extraData?: unknown,
  ): BusinessException {
    return new BusinessException(businessCode, message, HttpStatus.NOT_FOUND, extraData)
  }

  static conflict(
    businessCode: BusinessCode,
    message?: string,
    extraData?: unknown,
  ): BusinessException {
    return new BusinessException(businessCode, message, HttpStatus.CONFLICT, extraData)
  }

  static internalServerError(
    businessCode: BusinessCode,
    message?: string,
    extraData?: unknown,
  ): BusinessException {
    return new BusinessException(businessCode, message, HttpStatus.INTERNAL_SERVER_ERROR, extraData)
  }
}
