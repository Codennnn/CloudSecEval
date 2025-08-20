import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { User } from '~/lib/api/types'

import type { DepartmentTreeNode, DepartmentTreeStore, SelectMode } from '../types'
import { filterDepartmentTree, findNodeById, getChildrenIds, getParentPath } from '../utils/tree-utils'

/**
 * 创建部门树状态管理 Store
 * @param orgId - 组织 ID，用于区分不同组织的状态
 * @returns Zustand Store Hook
 */
export function createDepartmentTreeStore(orgId: string) {
  return create<DepartmentTreeStore>()(
    devtools(
      (set) => ({
        // ==================== 状态 ====================
        expandedKeys: new Set<string>(),
        selectedKeys: new Set<string>(),
        searchKeyword: '',
        filteredTreeData: [],

        // ==================== 操作方法 ====================

        /**
         * 切换节点展开状态
         */
        toggleExpanded: (nodeId: string) => {
          set((state) => {
            const newExpandedKeys = new Set(state.expandedKeys)

            if (newExpandedKeys.has(nodeId)) {
              newExpandedKeys.delete(nodeId)
            }
            else {
              newExpandedKeys.add(nodeId)
            }

            return { expandedKeys: newExpandedKeys }
          })
        },

        /**
         * 设置展开的节点
         */
        setExpandedKeys: (keys: string[]) => {
          set({ expandedKeys: new Set(keys) })
        },

        /**
         * 切换节点选中状态
         * @param nodeId - 节点 ID
         * @param selectMode - 选择模式
         * @param treeData - 树形数据（用于多选时的子节点处理）
         */
        toggleSelected: (nodeId: string, selectMode: SelectMode = 'single', treeData?: DepartmentTreeNode[]) => {
          set((state) => {
            const newSelectedKeys = new Set(state.selectedKeys)

            if (selectMode === 'single') {
              // 单选模式：清空其他选中项，只保留当前项
              if (newSelectedKeys.has(nodeId)) {
                newSelectedKeys.clear()
              }
              else {
                newSelectedKeys.clear()
                newSelectedKeys.add(nodeId)
              }
            }
            else if (selectMode === 'multiple' && treeData) {
              // 多选模式：支持父子节点联动
              const targetNode = findNodeById(treeData, nodeId)

              if (newSelectedKeys.has(nodeId)) {
                // 取消选中：同时取消选中所有子节点
                newSelectedKeys.delete(nodeId)

                if (targetNode) {
                  const childrenIds = getChildrenIds(targetNode)
                  childrenIds.forEach((id) => newSelectedKeys.delete(id))
                }
              }
              else {
                // 选中：同时选中所有子节点
                newSelectedKeys.add(nodeId)

                if (targetNode) {
                  const childrenIds = getChildrenIds(targetNode)
                  childrenIds.forEach((id) => newSelectedKeys.add(id))
                }

                // 检查是否需要自动选中父节点
                const parentPath = getParentPath(treeData, nodeId)

                for (const parentId of parentPath.reverse()) {
                  const parentNode = findNodeById(treeData, parentId)

                  if (parentNode?.children) {
                    // 如果父节点的所有子节点都被选中，则自动选中父节点
                    const allChildrenSelected = parentNode.children.every((child) =>
                      newSelectedKeys.has(child.id),
                    )

                    if (allChildrenSelected) {
                      newSelectedKeys.add(parentId)
                    }
                  }
                }
              }
            }

            return { selectedKeys: newSelectedKeys }
          })
        },

        /**
         * 设置选中的节点
         * @param keys - 节点 ID 数组
         */
        setSelectedKeys: (keys: string[]) => {
          set({ selectedKeys: new Set(keys) })
        },

        /**
         * 设置搜索关键词并过滤数据
         * @param keyword - 搜索关键词
         * @param originalTreeData - 原始树形数据
         */
        setSearchKeyword: (keyword: string, originalTreeData?: DepartmentTreeNode[]) => {
          set((state) => {
            // 如果关键词没有变化，直接返回当前状态
            if (state.searchKeyword === keyword) {
              return state
            }

            const filteredData = originalTreeData
              ? filterDepartmentTree(originalTreeData, keyword)
              : state.filteredTreeData

            return {
              searchKeyword: keyword,
              filteredTreeData: filteredData,
            }
          })
        },

        /**
         * 设置过滤后的树形数据
         * @param data - 树形数据
         */
        setFilteredTreeData: (data: DepartmentTreeNode[]) => {
          set((state) => {
            // 如果数据没有变化，直接返回当前状态（浅比较）
            if (state.filteredTreeData === data) {
              return state
            }

            return { filteredTreeData: data }
          })
        },

        /**
         * 重置所有状态
         */
        reset: () => {
          set({
            expandedKeys: new Set<string>(),
            selectedKeys: new Set<string>(),
            searchKeyword: '',
            filteredTreeData: [],
          })
        },
      }),
      {
        name: `department-tree-store-${orgId}`,
        enabled: process.env.NODE_ENV === 'development',
      },
    ),
  )
}

/**
 * 部门树 Store 实例缓存
 * 按组织 ID 缓存不同的 Store 实例
 */
const storeCache = new Map<string, ReturnType<typeof createDepartmentTreeStore>>()

/**
 * 获取部门树 Store Hook
 * @param orgId - 组织 ID
 * @returns Zustand Store Hook
 */
export function useDepartmentTreeStore(orgId: User['orgId']) {
  // 从缓存中获取或创建新的 Store 实例
  if (!storeCache.has(orgId)) {
    storeCache.set(orgId, createDepartmentTreeStore(orgId))
  }

  const useStore = storeCache.get(orgId)!

  return useStore()
}

/**
 * 清理指定组织的 Store 缓存
 * @param orgId - 组织 ID
 */
export function clearDepartmentTreeStore(orgId: User['orgId']) {
  storeCache.delete(orgId)
}

/**
 * 清理所有 Store 缓存
 */
export function clearAllDepartmentTreeStores() {
  storeCache.clear()
}
