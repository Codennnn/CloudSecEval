import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { BUSINESS_CODES, getBusinessCodeMessage } from '../constants/business-codes'
import { StandardListResponseDto, StandardResponseDto } from '../dto/standard-response.dto'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponseDto | StandardListResponseDto | StreamableFile> {
    return next.handle().pipe(
      map((data: unknown) => {
        // 如果返回的数据是文件流（blob），直接返回，不进行封装
        if (this.isStreamableFile(data)) {
          return data
        }

        // 如果返回的数据已经是标准响应格式，直接返回
        if (this.isStandardResponse(data)) {
          return data
        }

        // 检查返回的数据是否包含分页信息
        if (data && this.isPaginatedResult(data)) {
          return data
        }

        return {
          code: BUSINESS_CODES.SUCCESS,
          message: getBusinessCodeMessage(BUSINESS_CODES.SUCCESS),
          data,
        }
      }),
    )
  }

  /**
   * 判断是否为标准响应格式
   */
  private isStandardResponse(data: unknown): data is StandardResponseDto {
    return Boolean(
      data
      && typeof data === 'object'
      && 'code' in data
      && 'message' in data
      && 'data' in data
      && typeof (data as Record<string, unknown>).code === 'number'
      && typeof (data as Record<string, unknown>).message === 'string',
    )
  }

  /**
   * 判断是否为分页结果
   */
  private isPaginatedResult(data: unknown): data is StandardListResponseDto {
    return Boolean(
      data
      && typeof data === 'object'
      && 'data' in data
      && Array.isArray((data as Record<string, unknown>).data)
      && 'pagination' in data
      && typeof (data as Record<string, unknown>).pagination === 'object'
      && (data as Record<string, unknown>).pagination !== null
      && typeof ((data as Record<string, unknown>).pagination as Record<string, unknown>).total === 'number',
    )
  }

  /**
   * 判断是否为 StreamableFile（文件流）
   */
  private isStreamableFile(data: unknown): data is StreamableFile {
    return data instanceof StreamableFile
  }
}
