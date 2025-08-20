/**
 * 部门数据获取 Hook
 * 负责从 API 获取部门数据并转换为树形结构
 */

import { useMemo } from 'react'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { departmentsControllerFindAllDepartmentsOptions } from '~/lib/api/generated/@tanstack/react-query.gen'
import type { DepartmentListItemDto } from '~/lib/api/generated/types.gen'
import type { User } from '~/lib/api/types'

import type { DepartmentTreeNode } from '../types'
import { buildDepartmentTree } from '../utils/tree-utils'

/**
 * 部门数据获取 Hook 参数接口
 */
interface UseDepartmentDataOptions {
  /** 组织 ID */
  orgId: User['orgId']
  /** 是否启用查询 */
  enabled?: boolean
}

/**
 * 部门数据获取 Hook 返回值接口
 */
interface UseDepartmentDataReturn {
  /** 树形结构的部门数据 */
  treeData: DepartmentTreeNode[]
  /** 原始平铺的部门数据 */
  rawData?: DepartmentListItemDto[]
  /** 数据加载状态 */
  isLoading: boolean
  /** 错误信息 */
  error: Error | null
  /** 是否获取成功 */
  isSuccess: boolean
  /** 重新获取数据 */
  refetch: UseQueryResult['refetch']
}

/**
 * 部门数据获取 Hook
 * @param options - 配置选项
 * @returns 部门数据和相关状态
 */
export function useDepartmentData(options: UseDepartmentDataOptions): UseDepartmentDataReturn {
  const { orgId, enabled = true } = options

  const {
    data,
    isLoading,
    error,
    isSuccess,
    refetch,
  } = useQuery({
    ...departmentsControllerFindAllDepartmentsOptions({
      query: {
        orgId,
        page: 1,
        pageSize: 100, // 获取所有数据，不分页
      },
    }),
    enabled: enabled && Boolean(orgId),
  })

  // 将平铺数据转换为树形结构
  const treeData = useMemo(() => {
    if (data?.data && Array.isArray(data.data)) {
      return buildDepartmentTree(data.data)
    }

    return []
  }, [data?.data])

  return {
    treeData,
    rawData: data?.data,
    isLoading,
    error,
    isSuccess,
    refetch,
  }
}
