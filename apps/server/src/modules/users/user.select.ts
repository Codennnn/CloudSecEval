import type { Prisma } from '#prisma/client'

/**
 * 用户摘要字段选择器
 * 用于在关联查询中返回用户的基本信息
 */
const userBasicSelectFields = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect

const userOrgAndDeptSelectFields = {
  organization: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect

const userRolesSelectFields = {
  userRoles: {
    select: {
      role: {
        select: {
          id: true,
          name: true,
          slug: true,
          system: true,
          isActive: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect

/**
 * 用户模型字段选择器
 * 定义了在查询中需要返回的用户字段
 */
export const userDetailSelectFields = {
  ...userBasicSelectFields,
  ...userOrgAndDeptSelectFields,
  ...userRolesSelectFields,
} satisfies Prisma.UserSelect

/**
 * 包含密码哈希的用户字段选择器
 * 用于身份验证
 */
export const userWithPasswordSelectFields = {
  ...userBasicSelectFields,
  ...userOrgAndDeptSelectFields,
  passwordHash: true,
} satisfies Prisma.UserSelect
