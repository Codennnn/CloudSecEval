import type { QueryKeyFn, QueryOptionsFn } from '~/components/table/ProTable'

import type { BugItem } from '../types'

import { mockFetchBugs } from './mockData'

import type { Options } from '~api/sdk.gen'

// ============================================================================
// MARK: 查询键与查询选项
// ============================================================================

/**
 * 生成 react-query 的查询键
 */
export const getBugListQueryKey: QueryKeyFn = (options: Options) => {
  return ['bug-list', options.query]
}

/**
 * 生成 react-query 的查询选项（使用模拟请求）
 */
export const getBugListQueryOptions: QueryOptionsFn<BugItem> = (options: Options) => {
  return {
    queryKey: [...getBugListQueryKey(options)] as unknown[],
    queryFn: async () => {
      const res = await mockFetchBugs(options)

      return res
    },
  }
}
