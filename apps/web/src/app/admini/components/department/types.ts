import type { OrganizationId } from '~/lib/api/types'

import type { DepartmentTreeNodeDto } from '~api/types.gen'

/**
 * 部门树节点接口
 * 扩展原始部门数据，添加树形结构所需的属性
 */
export interface DepartmentTreeNode extends Omit<DepartmentTreeNodeDto, 'children'> {
  /** 子部门列表 */
  children?: DepartmentTreeNode[]
  /** 节点层级深度，从 0 开始 */
  level: number
  /** 是否展开状态 */
  isExpanded?: boolean
  /** 是否选中状态 */
  isSelected?: boolean
}

/**
 * 选择模式枚举
 */
export type SelectMode = 'single' | 'multiple' | false

/**
 * 部门树组件属性接口
 */
export interface DepartmentTreeProps {
  /** 组织 ID，用于获取部门数据 */
  orgId: OrganizationId
  /** 选择模式：single-单选，multiple-多选，false-不可选 */
  selectable?: SelectMode
  /** 默认展开的部门 ID 列表 */
  defaultExpandedKeys?: string[]
  /** 默认选中的部门 ID 列表 */
  defaultSelectedKeys?: string[]
  /** 是否默认选中第一个节点 */
  defaultSelectFirstNode?: boolean
  /** 是否显示搜索框 */
  showSearch?: boolean
  /** 自定义样式类名 */
  className?: string

  /** 选中状态变化回调 */
  onSelect?: (selectedKeys: string[]) => void
  /** 展开状态变化回调 */
  onExpand?: (expandedKeys: string[]) => void
  /** 自定义节点渲染函数 */
  renderNode?: (node: DepartmentTreeNode) => React.ReactNode
}

/**
 * 部门树节点组件属性接口
 */
export interface DepartmentTreeItemProps {
  /** 部门节点数据 */
  node: DepartmentTreeNode
  /** 是否可选择 */
  selectable: SelectMode
  /** 组织 ID */
  orgId: DepartmentTreeNodeDto['organization']['id']
  /** 原始树形数据（用于多选时的父子联动） */
  treeData: DepartmentTreeNode[]

  /** 自定义节点渲染函数 */
  renderNode?: (node: DepartmentTreeNode) => React.ReactNode
  /** 删除节点回调 */
  onDelete?: (nodeId: string) => void
  /** 编辑节点回调 */
  onEdit?: (nodeId: string) => void
  /** 添加子节点回调 */
  onAddChild?: (nodeId: string) => void
}

/**
 * 部门树状态接口
 */
export interface DepartmentTreeState {
  /** 展开的节点 ID 集合 */
  expandedKeys: Set<string>
  /** 选中的节点 ID 集合 */
  selectedKeys: Set<string>
  /** 搜索关键词 */
  searchKeyword: string
  /** 过滤后的树形数据 */
  filteredTreeData: DepartmentTreeNode[]
}

/**
 * 部门树状态操作接口
 */
export interface DepartmentTreeActions {
  /** 切换节点展开状态 */
  toggleExpanded: (nodeId: string) => void
  /** 设置展开的节点 */
  setExpandedKeys: (keys: string[]) => void
  /** 切换节点选中状态 */
  toggleSelected: (nodeId: string) => void
  /** 设置选中的节点 */
  setSelectedKeys: (keys: string[]) => void
  /** 设置搜索关键词 */
  setSearchKeyword: (keyword: string) => void
  /** 设置过滤后的树形数据 */
  setFilteredTreeData: (data: DepartmentTreeNode[]) => void
  /** 重置所有状态 */
  reset: () => void
}

/**
 * 部门树 Store 接口
 */
export interface DepartmentTreeStore extends DepartmentTreeState, DepartmentTreeActions {}

// ==================== 部门对话框相关类型 ====================

/**
 * 部门对话框模式
 */
export type DepartmentDialogMode = 'create' | 'edit'

/**
 * 部门表单验证模式
 */
export interface DepartmentFormValues {
  /** 部门名称 */
  name: string
  /** 部门描述 */
  remark?: string
  /** 父部门 ID */
  parentId?: string
  /** 是否启用 */
  isActive: boolean
}

/**
 * 部门表单初始数据
 */
export interface DepartmentFormInitialData {
  /** 部门 ID（编辑模式必需） */
  id?: string
  /** 部门名称 */
  name?: string
  /** 部门描述 */
  remark?: string
  /** 父部门 ID */
  parentId?: string
  /** 是否启用 */
  isActive?: boolean
}

/**
 * 部门对话框属性接口
 */
export interface DepartmentDialogProps {
  /** 对话框模式 */
  mode?: DepartmentDialogMode
  /** 表单初始数据 */
  formData?: DepartmentFormInitialData
  /** 对话框打开状态 */
  open: boolean
  /** 对话框打开状态变化回调 */
  onOpenChange: (open: boolean) => void
  /** 成功操作后的回调 */
  onSuccess?: () => void
  /** 组织 ID */
  orgId: OrganizationId
}
