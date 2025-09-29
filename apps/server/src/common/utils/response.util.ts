import { BUSINESS_CODES, type BusinessCode, getBusinessCodeMessage } from '@mono/constants'
import { HttpStatus } from '@nestjs/common'
import { type ClassConstructor, plainToInstance } from 'class-transformer'
import contentDisposition from 'content-disposition'

import type { PaginationMetaDto } from '~/common/dto/pagination-meta.dto'
import type { StandardListResponseDto, StandardResponseDto } from '~/common/dto/standard-response.dto'

import { createPaginationMeta } from './pagination.util'

/**
 * 成功响应函数
 * @param options 响应配置选项
 * @returns 标准响应对象
 */
export function resp<T>(options: {
  data?: unknown
  dto?: ClassConstructor<T>
  code?: BusinessCode
  msg?: string
}): StandardResponseDto<T> {
  const { data = null, dto, msg, code = BUSINESS_CODES.SUCCESS } = options
  const transformedData = dto && data
    ? plainToInstance(dto, data)
    : data as T

  return {
    code,
    message: msg ?? getBusinessCodeMessage(code),
    data: transformedData,
  }
}

/**
 * 分页响应函数
 * @param options 响应配置选项
 * @returns 标准分页响应对象
 */
export function respWithPagination<T>(options: {
  data: unknown[]
  dto?: ClassConstructor<T>
  pageOptions?: Partial<PaginationMetaDto>
  msg?: string
  code?: BusinessCode
}): StandardListResponseDto<T> {
  const { data, dto, pageOptions, msg, code = BUSINESS_CODES.SUCCESS } = options

  const transformedData = dto
    ? plainToInstance(dto, data, {
        excludeExtraneousValues: false,
      })
    : data as T[]

  const pagination = typeof pageOptions?.total === 'number'
    ? createPaginationMeta(pageOptions.total, pageOptions)
    : undefined

  return {
    code,
    message: msg ?? getBusinessCodeMessage(code),
    data: transformedData,
    pagination,
  }
}

/**
 * 从 HTTP 状态码映射到业务状态码
 * @param httpStatus HTTP 状态码
 * @returns 对应的业务状态码
 */
export function mapHttpStatusToBusinessCode(httpStatus: HttpStatus): BusinessCode {
  switch (httpStatus) {
    case HttpStatus.OK:
      return BUSINESS_CODES.SUCCESS

    case HttpStatus.CREATED:
      return BUSINESS_CODES.CREATED

    case HttpStatus.BAD_REQUEST:
      return BUSINESS_CODES.BAD_REQUEST

    case HttpStatus.UNAUTHORIZED:
      return BUSINESS_CODES.UNAUTHORIZED

    case HttpStatus.FORBIDDEN:
      return BUSINESS_CODES.FORBIDDEN

    case HttpStatus.NOT_FOUND:
      return BUSINESS_CODES.NOT_FOUND

    case HttpStatus.CONFLICT:
      return BUSINESS_CODES.CONFLICT

    case HttpStatus.INTERNAL_SERVER_ERROR:
      return BUSINESS_CODES.INTERNAL_SERVER_ERROR

    default:
      return BUSINESS_CODES.INTERNAL_SERVER_ERROR
  }
}

/**
 * 生成符合标准的 Content-Disposition 头值
 * 使用 content-disposition 库确保完全符合 RFC 6266 和 RFC 5987 标准
 *
 * @param filename 原始文件名
 * @param options 其他处置选项
 *
 * @returns 完整的 Content-Disposition 头值
 */
export function createContentDisposition(
  filename: string,
  options?: contentDisposition.Options,
): string {
  return contentDisposition(
    filename,
    {
      type: 'attachment',
      ...options,
    },
  )
}
