import type { AnalysisResult } from '../types/regulation'

/**
 * 生成 Mermaid 知识图谱代码
 * 展示"法规条款 → 评估项 → 风险点 → 整改措施"的四层关系网络
 */
export function generateKnowledgeGraph(result: AnalysisResult): string {
  const { clauses, assessmentItems, riskPoints, remediationMeasures } = result

  // 如果没有数据，返回空图谱提示
  if (clauses.length === 0) {
    return `graph TD
      A[暂无数据]
      style A fill:#f0f0f0,stroke:#999,stroke-width:2px`
  }

  const lines: string[] = ['graph LR']

  // 添加样式定义
  lines.push('  classDef clauseStyle fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff')
  lines.push('  classDef assessmentStyle fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff')
  lines.push('  classDef riskStyle fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff')
  lines.push('  classDef remediationStyle fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff')
  lines.push('')

  // 生成节点ID的辅助函数
  const getNodeId = (prefix: string, id: string) => {
    return `${prefix}_${id.replace(/-/g, '_')}`
  }

  // 生成节点标签的辅助函数（限制长度）
  const getNodeLabel = (text: string, maxLength = 12) => {
    if (text.length <= maxLength) {
      return text
    }

    return `${text.substring(0, maxLength)}...`
  }

  // 1. 定义法规条款节点
  clauses.forEach((clause) => {
    const nodeId = getNodeId('C', clause.id)
    const label = getNodeLabel(`${clause.code}<br/>${clause.title}`, 20)
    lines.push(`  ${nodeId}["${label}"]:::clauseStyle`)
  })

  lines.push('')

  // 2. 定义评估项节点并连接到法规条款
  assessmentItems.forEach((item) => {
    const nodeId = getNodeId('A', item.id)
    const label = getNodeLabel(item.name)
    lines.push(`  ${nodeId}["${label}"]:::assessmentStyle`)

    // 连接到对应的法规条款
    const clauseNodeId = getNodeId('C', item.clauseId)
    lines.push(`  ${clauseNodeId} --> ${nodeId}`)
  })

  lines.push('')

  // 3. 定义风险点节点并连接到评估项
  riskPoints.forEach((risk) => {
    const nodeId = getNodeId('R', risk.id)
    const label = getNodeLabel(risk.name)
    lines.push(`  ${nodeId}["${label}"]:::riskStyle`)

    // 连接到对应的评估项
    const assessmentNodeId = getNodeId('A', risk.assessmentItemId)
    lines.push(`  ${assessmentNodeId} --> ${nodeId}`)
  })

  lines.push('')

  // 4. 定义整改措施节点并连接到风险点
  remediationMeasures.forEach((measure) => {
    const nodeId = getNodeId('M', measure.id)
    const label = getNodeLabel(measure.name)
    lines.push(`  ${nodeId}["${label}"]:::remediationStyle`)

    // 连接到对应的风险点
    const riskNodeId = getNodeId('R', measure.riskPointId)
    lines.push(`  ${riskNodeId} --> ${nodeId}`)
  })

  return lines.join('\n')
}

/**
 * 生成简化版知识图谱（仅显示部分节点，避免过于复杂）
 */
export function generateSimplifiedKnowledgeGraph(result: AnalysisResult, maxNodesPerLayer = 3): string {
  const { clauses, assessmentItems, riskPoints, remediationMeasures } = result

  // 限制每层的节点数量
  const limitedClauses = clauses.slice(0, maxNodesPerLayer)
  const limitedAssessmentItems = assessmentItems.filter((item) => {
    return limitedClauses.some((c) => {
      return c.id === item.clauseId
    })
  }).slice(0, maxNodesPerLayer)
  const limitedRiskPoints = riskPoints.filter((risk) => {
    return limitedAssessmentItems.some((a) => {
      return a.id === risk.assessmentItemId
    })
  }).slice(0, maxNodesPerLayer)
  const limitedRemediationMeasures = remediationMeasures.filter((measure) => {
    return limitedRiskPoints.some((r) => {
      return r.id === measure.riskPointId
    })
  }).slice(0, maxNodesPerLayer)

  return generateKnowledgeGraph({
    clauses: limitedClauses,
    assessmentItems: limitedAssessmentItems,
    riskPoints: limitedRiskPoints,
    remediationMeasures: limitedRemediationMeasures,
  })
}
