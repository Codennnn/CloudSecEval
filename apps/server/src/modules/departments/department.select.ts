import type { Prisma } from '#prisma/client'

/**
 * 部门详情选择字段
 * 用于API响应的完整部门信息
 */
export const departmentDetailSelectFields = {
  id: true,
  name: true,
  remark: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  organization: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  parent: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      children: true,
      users: true,
    },
  },
} as const satisfies Prisma.DepartmentSelect

/**
 * 部门列表选择字段
 * 用于列表展示的精简部门信息
 */
export const departmentListSelectFields = {
  id: true,
  name: true,
  remark: true,
  isActive: true,
  createdAt: true,
  organization: {
    select: {
      id: true,
      name: true,
    },
  },
  parent: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      children: true,
      users: true,
    },
  },
} as const satisfies Prisma.DepartmentSelect

/**
 * 部门树节点选择字段
 * 用于构建部门树的字段
 */
export const departmentTreeSelectFields = {
  id: true,
  name: true,
  remark: true,
  isActive: true,
  parentId: true,
  _count: {
    select: {
      users: true,
    },
  },
} as const satisfies Prisma.DepartmentSelect

/**
 * 部门简要信息选择字段
 * 用于关联查询的最少字段
 */
export const departmentBriefSelectFields = {
  id: true,
  name: true,
  orgId: true,
  parentId: true,
} as const satisfies Prisma.DepartmentSelect
