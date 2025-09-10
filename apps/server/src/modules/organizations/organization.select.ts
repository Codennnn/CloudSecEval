import type { Prisma } from '#prisma/client'

/**
 * 组织简要信息选择字段
 * 用于关联查询的最少字段
 */
const organizationBriefSelectFields = {
  id: true,
  name: true,
  code: true,
} as const satisfies Prisma.OrganizationSelect

/**
 * 组织详情选择字段
 * 用于 API 响应的完整组织信息
 */
export const organizationDetailSelectFields = {
  ...organizationBriefSelectFields,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      departments: true,
      users: true,
    },
  },
} as const satisfies Prisma.OrganizationSelect

/**
 * 组织列表选择字段
 * 用于列表展示的精简组织信息
 */
export const organizationListSelectFields = {
  ...organizationDetailSelectFields,
} as const satisfies Prisma.OrganizationSelect
