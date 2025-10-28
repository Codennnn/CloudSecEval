import { type RiskItem, RiskLevel, RiskType } from './types'

/**
 * 格式化日期时间
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))

      return `${minutes}分钟前`
    }

    return `${hours}小时前`
  }
  else if (days === 1) {
    return '昨天'
  }
  else if (days < 7) {
    return `${days}天前`
  }

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 生成攻击路径 Mermaid 图谱代码
 */
export function generateAttackPathMermaid(risks: RiskItem[]): string {
  // 筛选有攻击路径的高风险项
  const risksWithPath = risks
    .filter((risk) => risk.attackPath && risk.attackPath.length > 0)
    .slice(0, 5) // 只取前5个，避免图谱过于复杂

  if (risksWithPath.length === 0) {
    return `graph LR
    A[暂无攻击路径数据]
    style A fill:#f0f0f0,stroke:#999,stroke-width:2px`
  }

  let mermaidCode = 'graph LR\n'
  const nodeMap = new Map<string, string>()
  let nodeIndex = 0

  // 为每个风险生成攻击路径
  risksWithPath.forEach((risk, riskIndex) => {
    if (!risk.attackPath) {
      return
    }

    const pathNodes: string[] = []

    risk.attackPath.forEach((step) => {
      if (!nodeMap.has(step)) {
        const nodeId = `N${nodeIndex++}`
        nodeMap.set(step, nodeId)
      }

      pathNodes.push(nodeMap.get(step)!)
    })

    // 生成路径连接
    for (let i = 0; i < pathNodes.length - 1; i++) {
      mermaidCode += `    ${pathNodes[i]} -->|${risk.name.substring(0, 10)}...| ${pathNodes[i + 1]}\n`
    }
  })

  // 添加节点定义
  mermaidCode += '\n'
  nodeMap.forEach((nodeId, nodeName) => {
    mermaidCode += `    ${nodeId}[${nodeName}]\n`
  })

  // 添加样式
  mermaidCode += '\n'
  risksWithPath.forEach((risk, index) => {
    const color = risk.level === RiskLevel.HIGH
      ? '#ef4444'
      : risk.level === RiskLevel.MEDIUM
        ? '#f59e0b'
        : '#10b981'

    if (risk.attackPath && risk.attackPath.length > 0) {
      const lastNode = nodeMap.get(risk.attackPath[risk.attackPath.length - 1])

      if (lastNode) {
        mermaidCode += `    style ${lastNode} fill:${color},stroke:${color},stroke-width:3px,color:#fff\n`
      }
    }
  })

  return mermaidCode
}

/**
 * 根据风险类型获取图标
 */
export function getRiskTypeIcon(type: RiskType): string {
  const icons: Record<RiskType, string> = {
    [RiskType.WEAK_PASSWORD]: '🔑',
    [RiskType.SQL_INJECTION]: '💉',
    [RiskType.XSS]: '🔗',
    [RiskType.CONFIG_ERROR]: '⚙️',
    [RiskType.OUTDATED_SOFTWARE]: '📦',
    [RiskType.UNAUTHORIZED_ACCESS]: '🚫',
    [RiskType.DATA_LEAK]: '💧',
    [RiskType.PRIVILEGE_ESCALATION]: '⬆️',
  }

  return icons[type] || '⚠️'
}

/**
 * 获取风险等级颜色（用于图表）
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    [RiskLevel.HIGH]: '#ef4444',
    [RiskLevel.MEDIUM]: '#f59e0b',
    [RiskLevel.LOW]: '#10b981',
  }

  return colors[level]
}

/**
 * 筛选风险数据
 */
export function filterRisks(
  risks: RiskItem[],
  filters: {
    level?: RiskLevel[]
    status?: string[]
    type?: RiskType[]
    search?: string
  },
): RiskItem[] {
  return risks.filter((risk) => {
    // 等级筛选
    if (filters.level && filters.level.length > 0 && !filters.level.includes(risk.level)) {
      return false
    }

    // 状态筛选
    if (filters.status && filters.status.length > 0 && !filters.status.includes(risk.status)) {
      return false
    }

    // 类型筛选
    if (filters.type && filters.type.length > 0 && !filters.type.includes(risk.type)) {
      return false
    }

    // 搜索筛选
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()

      return (
        risk.name.toLowerCase().includes(searchLower)
        || risk.description.toLowerCase().includes(searchLower)
        || risk.affectedAssets.some((asset) => asset.toLowerCase().includes(searchLower))
      )
    }

    return true
  })
}
