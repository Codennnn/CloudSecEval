import { BUSINESS_CODES } from '@mono/constants'

import type { Prisma } from '#prisma/client'

import { BusinessException } from '../exceptions/business.exception'

/**
 * 检查是否为 Prisma 错误
 */
export function isPrismaError(error: unknown): boolean {
  return (
    error !== null
    && typeof error === 'object'
    && 'code' in error
    && 'clientVersion' in error
  )
}

/**
 * 处理唯一约束违反错误 (P2002)
 */
function handleUniqueConstraintError(meta: Prisma.PrismaClientKnownRequestError['meta']): BusinessException {
  const target = meta?.target as string[] | undefined

  if (target?.includes('email')) {
    return BusinessException.conflict(
      BUSINESS_CODES.EMAIL_ALREADY_EXISTS,
      '邮箱已存在',
    )
  }

  if (target?.includes('name')) {
    return BusinessException.conflict(
      BUSINESS_CODES.ORGANIZATION_NAME_EXISTS,
      '组织名称已存在',
    )
  }

  return BusinessException.conflict(
    BUSINESS_CODES.DUPLICATE_RESOURCE,
    '资源已存在',
    { target },
  )
}

/**
 * 处理记录不存在错误 (P2025)
 *
 * 通过分析错误消息中的模型名称来确定具体的资源类型
 */
function handleRecordNotFoundError(message: string): BusinessException {
  const errorMessage = message.toLowerCase()

  if (errorMessage.includes('user')) {
    return BusinessException.notFound(
      BUSINESS_CODES.USER_NOT_FOUND,
      '用户不存在',
    )
  }

  if (errorMessage.includes('organization')) {
    return BusinessException.notFound(
      BUSINESS_CODES.ORGANIZATION_NOT_FOUND,
      '组织不存在',
    )
  }

  return BusinessException.notFound(
    BUSINESS_CODES.RESOURCE_NOT_FOUND,
    '请求的资源不存在',
  )
}

/**
 * 处理 Prisma 错误并转换为业务异常
 *
 * @param error Prisma 错误对象
 * @returns BusinessException 转换后的业务异常
 */
export function handlePrismaError(error: unknown): BusinessException {
  if (!isPrismaError(error)) {
    return BusinessException.internalServerError(
      BUSINESS_CODES.INTERNAL_SERVER_ERROR,
      '服务器内部错误',
    )
  }

  const prismaError = error as Prisma.PrismaClientKnownRequestError
  const { code, meta, message } = prismaError

  // 处理已知的 Prisma 错误码
  switch (code) {
    case 'P2002': // 唯一约束违反
      return handleUniqueConstraintError(meta)

    case 'P2025': // 记录不存在
      return handleRecordNotFoundError(message)

    case 'P2003': // 外键约束违反
      return BusinessException.badRequest(
        BUSINESS_CODES.DATABASE_CONSTRAINT_ERROR,
        '关联资源不存在或操作违反数据完整性约束',
        { code, meta },
      )

    case 'P2014': // 关联记录不存在
      return BusinessException.badRequest(
        BUSINESS_CODES.RESOURCE_NOT_FOUND,
        '关联的记录不存在',
        { code, meta },
      )

    case 'P2021': // 表不存在
      return BusinessException.internalServerError(
        BUSINESS_CODES.DATABASE_ERROR,
        '数据库表不存在',
        { code, meta },
      )

    case 'P2022': // 列不存在
      return BusinessException.internalServerError(
        BUSINESS_CODES.DATABASE_ERROR,
        '数据库列不存在',
        { code, meta },
      )

    default:
      return BusinessException.internalServerError(
        BUSINESS_CODES.DATABASE_ERROR,
        `数据库操作失败: ${message || '未知错误'}`,
        { code, meta },
      )
  }
}
