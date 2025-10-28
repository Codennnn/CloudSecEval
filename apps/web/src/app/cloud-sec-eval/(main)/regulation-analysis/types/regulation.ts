/**
 * 法规条款数据类型
 */
export interface RegulationClause {
  /** 唯一标识 */
  id: string
  /** 条款编号，如 "8.1.4.1" */
  code: string
  /** 条款标题 */
  title: string
  /** 条款完整内容 */
  content: string
  /** 分类：访问控制、数据安全等 */
  category: string
  /** 重要性等级 */
  level: 'high' | 'medium' | 'low'
}

/**
 * 评估项数据类型
 */
export interface AssessmentItem {
  /** 唯一标识 */
  id: string
  /** 评估项名称 */
  name: string
  /** 关联的法规条款ID */
  clauseId: string
  /** 检查点列表 */
  checkpoints: string[]
  /** 评分标准 */
  scoringCriteria: string
}

/**
 * 风险点数据类型
 */
export interface RiskPoint {
  /** 唯一标识 */
  id: string
  /** 风险点名称 */
  name: string
  /** 关联的评估项ID */
  assessmentItemId: string
  /** 风险等级 */
  level: 'high' | 'medium' | 'low'
  /** 风险描述 */
  description: string
  /** 影响范围 */
  impact: string
  /** 历史发现次数 */
  frequency: number
}

/**
 * 整改措施数据类型
 */
export interface RemediationMeasure {
  /** 唯一标识 */
  id: string
  /** 关联的风险点ID */
  riskPointId: string
  /** 整改措施名称 */
  name: string
  /** 具体操作步骤 */
  steps: string[]
  /** 预计工作量（人天） */
  estimatedEffort: number
  /** 参考文档链接 */
  referenceLinks: string[]
}

/**
 * 法规模板数据类型
 */
export interface RegulationTemplate {
  /** 模板ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description: string
  /** 包含的法规条款ID列表 */
  clauseIds: string[]
}

/**
 * 解析结果数据类型
 */
export interface AnalysisResult {
  /** 法规条款列表 */
  clauses: RegulationClause[]
  /** 评估项列表 */
  assessmentItems: AssessmentItem[]
  /** 风险点列表 */
  riskPoints: RiskPoint[]
  /** 整改措施列表 */
  remediationMeasures: RemediationMeasure[]
}

/**
 * 解析步骤类型
 */
export type AnalysisStep = 'idle' | 'preprocessing' | 'semantic-analysis' | 'graph-building' | 'completed'

/**
 * 解析步骤配置
 */
export interface AnalysisStepConfig {
  /** 步骤标识 */
  step: AnalysisStep
  /** 步骤标题 */
  title: string
  /** 步骤描述 */
  description: string
  /** 持续时间（毫秒） */
  duration: number
}
