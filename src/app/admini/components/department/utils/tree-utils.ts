import arrayToTree from 'array-to-tree'

import type { DepartmentTreeNode } from '../types'

import type { DepartmentListItemDto, DepartmentTreeNodeDto } from '~api/types.gen'

/**
 * 将平铺的部门列表转换为树形结构
 * @param departments - 平铺的部门列表
 * @returns 树形结构的部门数据
 */
export function buildDepartmentTree(departments: DepartmentListItemDto[]): DepartmentTreeNode[] {
  if (departments.length === 0) {
    return []
  }

  const treeData: DepartmentTreeNodeDto[] = arrayToTree(departments, {
    customID: 'id',
    parentProperty: 'parent.id',
    childrenProperty: 'children',
  })

  // 递归添加层级信息和初始状态
  const addTreeMetadata = (nodes: DepartmentTreeNodeDto[], level = 0): DepartmentTreeNode[] => {
    return nodes.map<DepartmentTreeNode>((node) => ({
      ...node,
      level,
      isExpanded: false,
      isSelected: false,
      children: node.children ? addTreeMetadata(node.children, level + 1) : undefined,
    }))
  }

  return addTreeMetadata(treeData)
}

/**
 * 根据关键词过滤部门树
 * @param treeData - 原始树形数据
 * @param keyword - 搜索关键词
 * @returns 过滤后的树形数据
 */
export function filterDepartmentTree(
  treeData: DepartmentTreeNode[],
  keyword: string,
): DepartmentTreeNode[] {
  if (!keyword.trim()) {
    return treeData
  }

  const searchKeyword = keyword.toLowerCase().trim()

  /**
   * 递归过滤节点
   * 如果节点匹配或其子节点有匹配项，则保留该节点
   */
  const filterNodes = (nodes: DepartmentTreeNode[]): DepartmentTreeNode[] => {
    const filteredNodes: DepartmentTreeNode[] = []

    for (const node of nodes) {
      // 检查当前节点是否匹配
      const isCurrentMatch = node.name.toLowerCase().includes(searchKeyword)
        || (node.remark?.toLowerCase().includes(searchKeyword))

      // 递归过滤子节点
      const filteredChildren = node.children ? filterNodes(node.children) : []

      // 如果当前节点匹配或有匹配的子节点，则保留
      if (isCurrentMatch || filteredChildren.length > 0) {
        filteredNodes.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
          // 搜索时自动展开有匹配结果的节点
          isExpanded: filteredChildren.length > 0 || isCurrentMatch,
        })
      }
    }

    return filteredNodes
  }

  return filterNodes(treeData)
}

/**
 * 获取树中所有节点的 ID 列表
 * @param treeData - 树形数据
 * @returns 所有节点 ID 的数组
 */
export function getAllNodeIds(treeData: DepartmentTreeNode[]): string[] {
  const ids: string[] = []

  const traverse = (nodes: DepartmentTreeNode[]) => {
    for (const node of nodes) {
      ids.push(node.id)

      if (node.children) {
        traverse(node.children)
      }
    }
  }

  traverse(treeData)

  return ids
}

/**
 * 根据节点 ID 查找节点
 * @param treeData - 树形数据
 * @param nodeId - 节点 ID
 * @returns 找到的节点或 undefined
 */
export function findNodeById(
  treeData: DepartmentTreeNode[],
  nodeId: string,
): DepartmentTreeNode | undefined {
  for (const node of treeData) {
    if (node.id === nodeId) {
      return node
    }

    if (node.children) {
      const found = findNodeById(node.children, nodeId)

      if (found) {
        return found
      }
    }
  }

  return undefined
}

/**
 * 获取节点的所有子节点 ID
 * @param node - 父节点
 * @returns 所有子节点 ID 的数组
 */
export function getChildrenIds(node: DepartmentTreeNode): string[] {
  const ids: string[] = []

  const traverse = (currentNode: DepartmentTreeNode) => {
    if (currentNode.children) {
      for (const child of currentNode.children) {
        ids.push(child.id)
        traverse(child)
      }
    }
  }

  traverse(node)

  return ids
}

/**
 * 获取节点的所有父节点 ID 路径
 * @param treeData - 树形数据
 * @param nodeId - 目标节点 ID
 * @returns 从根节点到目标节点的父节点 ID 路径
 */
export function getParentPath(treeData: DepartmentTreeNode[], nodeId: string): string[] {
  const path: string[] = []

  const findPath = (
    nodes: DepartmentTreeNode[],
    targetId: string,
    currentPath: string[],
  ): boolean => {
    for (const node of nodes) {
      const newPath = [...currentPath, node.id]

      if (node.id === targetId) {
        path.push(...currentPath) // 不包含目标节点本身

        return true
      }

      if (node.children && findPath(node.children, targetId, newPath)) {
        return true
      }
    }

    return false
  }

  findPath(treeData, nodeId, [])

  return path
}
