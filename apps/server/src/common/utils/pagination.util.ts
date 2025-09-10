import type { PaginationMetaDto } from '../dto/pagination-meta.dto'

/** 默认分页页码 */
export const DEFAULT_PAGE = 1
/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 10

/**
 * 计算分页元数据
 *
 * @param total 总数据条数
 * @param options 分页选项，可选，默认使用默认分页设置
 */
export function createPaginationMeta(
  total: number, options: Partial<Pick<PaginationMetaDto, 'page' | 'pageSize'>>,
): PaginationMetaDto {
  const page = options.page ?? DEFAULT_PAGE
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const totalPages = Math.ceil(total / pageSize)

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

/**
 * 获取分页参数，用于数据库查询
 *
 * @param options 分页选项
 * @returns 处理后的分页参数
 */
export function getPaginationParams(
  options: Partial<Pick<PaginationMetaDto, 'page' | 'pageSize'>>,
) {
  const page = options.page ?? DEFAULT_PAGE
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}
