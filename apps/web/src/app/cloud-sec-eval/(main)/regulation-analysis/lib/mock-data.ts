import type {
  AnalysisResult,
  AssessmentItem,
  RegulationClause,
  RegulationTemplate,
  RemediationMeasure,
  RiskPoint,
} from '../types/regulation'

/**
 * 模拟法规条款数据
 */
export const mockRegulationClauses: RegulationClause[] = [
  {
    id: 'clause-1',
    code: '8.1.4.1',
    title: '身份鉴别',
    content: '应对登录的用户进行身份标识和鉴别，身份标识具有唯一性，身份鉴别信息具有复杂度要求并定期更换。',
    category: '访问控制',
    level: 'high',
  },
  {
    id: 'clause-2',
    code: '8.1.4.2',
    title: '访问控制',
    content: '应启用访问控制功能，依据安全策略控制用户对资源的访问，实现最小授权原则。',
    category: '访问控制',
    level: 'high',
  },
  {
    id: 'clause-3',
    code: '8.1.4.3',
    title: '安全审计',
    content: '应启用安全审计功能，审计覆盖到每个用户，对重要的用户行为和重要安全事件进行审计。',
    category: '安全审计',
    level: 'medium',
  },
  {
    id: 'clause-4',
    code: '8.1.3.1',
    title: '数据完整性',
    content: '应采用校验技术或密码技术保证重要数据在传输过程中的完整性，包括但不限于鉴别数据、重要业务数据、重要审计数据、重要配置数据、重要视频数据和重要个人信息等。',
    category: '数据安全',
    level: 'high',
  },
  {
    id: 'clause-5',
    code: '8.1.3.2',
    title: '数据保密性',
    content: '应采用密码技术保证重要数据在传输过程中的保密性，包括但不限于鉴别数据、重要业务数据和重要个人信息等。',
    category: '数据安全',
    level: 'high',
  },
  {
    id: 'clause-6',
    code: '8.1.5.1',
    title: '入侵防范',
    content: '应遵循最小安装的原则，仅安装需要的组件和应用程序，并通过设置升级服务器等方式保持系统补丁及时得到更新。',
    category: '入侵防范',
    level: 'medium',
  },
  {
    id: 'clause-7',
    code: '8.1.5.2',
    title: '恶意代码防范',
    content: '应安装防恶意代码软件，并及时更新防恶意代码软件版本和恶意代码库。',
    category: '入侵防范',
    level: 'medium',
  },
  {
    id: 'clause-8',
    code: '8.1.2.1',
    title: '备份和恢复',
    content: '应提供重要数据的本地数据备份与恢复功能，并定期执行备份和恢复测试。',
    category: '数据备份',
    level: 'medium',
  },
]

/**
 * 模拟评估项数据
 */
export const mockAssessmentItems: AssessmentItem[] = [
  {
    id: 'assessment-1',
    name: '身份认证机制评估',
    clauseId: 'clause-1',
    checkpoints: [
      '检查是否启用用户身份鉴别功能',
      '检查用户标识是否唯一',
      '检查密码复杂度策略是否符合要求',
      '检查密码是否定期更换',
    ],
    scoringCriteria: '完全符合得10分，部分符合得5分，不符合得0分',
  },
  {
    id: 'assessment-2',
    name: '双因素认证评估',
    clauseId: 'clause-1',
    checkpoints: [
      '检查是否启用双因素认证',
      '检查双因素认证的实现方式',
      '检查关键操作是否需要二次认证',
    ],
    scoringCriteria: '完全符合得10分，部分符合得5分，不符合得0分',
  },
  {
    id: 'assessment-3',
    name: '权限管理评估',
    clauseId: 'clause-2',
    checkpoints: [
      '检查是否实施最小权限原则',
      '检查权限分配是否合理',
      '检查是否存在权限滥用',
      '检查权限变更审批流程',
    ],
    scoringCriteria: '完全符合得10分，部分符合得5分，不符合得0分',
  },
  {
    id: 'assessment-4',
    name: '审计日志评估',
    clauseId: 'clause-3',
    checkpoints: [
      '检查审计功能是否启用',
      '检查审计日志是否完整',
      '检查审计日志保存时长',
      '检查审计日志是否定期分析',
    ],
    scoringCriteria: '完全符合得10分，部分符合得5分，不符合得0分',
  },
  {
    id: 'assessment-5',
    name: '数据传输加密评估',
    clauseId: 'clause-4',
    checkpoints: [
      '检查是否使用加密协议传输数据',
      '检查加密算法强度',
      '检查证书有效性',
    ],
    scoringCriteria: '完全符合得10分，部分符合得5分，不符合得0分',
  },
  {
    id: 'assessment-6',
    name: '数据存储加密评估',
    clauseId: 'clause-5',
    checkpoints: [
      '检查敏感数据是否加密存储',
      '检查密钥管理机制',
      '检查加密算法是否符合国家标准',
    ],
    scoringCriteria: '完全符合得10分，部分符合得5分，不符合得0分',
  },
  {
    id: 'assessment-7',
    name: '系统加固评估',
    clauseId: 'clause-6',
    checkpoints: [
      '检查是否遵循最小安装原则',
      '检查系统补丁更新情况',
      '检查不必要的服务是否关闭',
    ],
    scoringCriteria: '完全符合得10分，部分符合得5分，不符合得0分',
  },
  {
    id: 'assessment-8',
    name: '防病毒软件评估',
    clauseId: 'clause-7',
    checkpoints: [
      '检查是否安装防病毒软件',
      '检查病毒库是否及时更新',
      '检查是否定期进行全盘扫描',
    ],
    scoringCriteria: '完全符合得10分，部分符合得5分，不符合得0分',
  },
  {
    id: 'assessment-9',
    name: '数据备份评估',
    clauseId: 'clause-8',
    checkpoints: [
      '检查备份策略是否完善',
      '检查备份频率是否合理',
      '检查是否定期进行恢复测试',
    ],
    scoringCriteria: '完全符合得10分，部分符合得5分，不符合得0分',
  },
]

/**
 * 模拟风险点数据
 */
export const mockRiskPoints: RiskPoint[] = [
  {
    id: 'risk-1',
    name: '弱密码风险',
    assessmentItemId: 'assessment-1',
    level: 'high',
    description: '系统存在弱密码或默认密码，容易被暴力破解',
    impact: '可能导致账户被非法访问，造成数据泄露或系统被控制',
    frequency: 15,
  },
  {
    id: 'risk-2',
    name: '缺少双因素认证',
    assessmentItemId: 'assessment-2',
    level: 'medium',
    description: '关键系统未启用双因素认证，仅依赖密码认证',
    impact: '密码泄露后无额外防护措施，增加账户被盗风险',
    frequency: 8,
  },
  {
    id: 'risk-3',
    name: '权限配置过高',
    assessmentItemId: 'assessment-3',
    level: 'high',
    description: '用户权限配置超出实际需要，违反最小权限原则',
    impact: '增加内部人员误操作或恶意操作的风险',
    frequency: 12,
  },
  {
    id: 'risk-4',
    name: '审计日志缺失',
    assessmentItemId: 'assessment-4',
    level: 'medium',
    description: '部分关键操作未记录审计日志',
    impact: '安全事件发生后无法追溯，影响事件调查',
    frequency: 6,
  },
  {
    id: 'risk-5',
    name: '数据传输未加密',
    assessmentItemId: 'assessment-5',
    level: 'high',
    description: '敏感数据在网络传输过程中未加密',
    impact: '数据可能被中间人窃取或篡改',
    frequency: 10,
  },
  {
    id: 'risk-6',
    name: '敏感数据明文存储',
    assessmentItemId: 'assessment-6',
    level: 'high',
    description: '数据库中存储的敏感信息未加密',
    impact: '数据库泄露后敏感信息直接暴露',
    frequency: 9,
  },
  {
    id: 'risk-7',
    name: '系统补丁未及时更新',
    assessmentItemId: 'assessment-7',
    level: 'medium',
    description: '操作系统或应用程序存在已知漏洞未修复',
    impact: '可能被攻击者利用漏洞入侵系统',
    frequency: 11,
  },
  {
    id: 'risk-8',
    name: '病毒库过期',
    assessmentItemId: 'assessment-8',
    level: 'low',
    description: '防病毒软件病毒库更新不及时',
    impact: '无法检测最新的恶意代码',
    frequency: 4,
  },
  {
    id: 'risk-9',
    name: '备份未验证',
    assessmentItemId: 'assessment-9',
    level: 'medium',
    description: '数据备份后未进行恢复测试',
    impact: '灾难发生时可能无法成功恢复数据',
    frequency: 7,
  },
]

/**
 * 模拟整改措施数据
 */
export const mockRemediationMeasures: RemediationMeasure[] = [
  {
    id: 'remediation-1',
    riskPointId: 'risk-1',
    name: '强化密码策略',
    steps: [
      '制定密码复杂度策略：至少8位，包含大小写字母、数字和特殊字符',
      '配置密码定期更换策略：每90天强制更换一次',
      '启用密码历史记录：禁止使用最近5次使用过的密码',
      '对现有弱密码账户进行排查和强制修改',
    ],
    estimatedEffort: 2,
    referenceLinks: [
      'https://www.djbh.net/webdev/web/GBDetail.aspx?id=1',
      'https://www.gb688.cn/bzgk/gb/newGbInfo?hcno=73EEFA8E',
    ],
  },
  {
    id: 'remediation-2',
    riskPointId: 'risk-2',
    name: '部署双因素认证系统',
    steps: [
      '选择合适的双因素认证方案（短信验证码、OTP令牌、生物识别等）',
      '在关键系统中集成双因素认证功能',
      '对管理员账户强制启用双因素认证',
      '对用户进行双因素认证使用培训',
    ],
    estimatedEffort: 5,
    referenceLinks: ['https://www.djbh.net/webdev/web/GBDetail.aspx?id=1'],
  },
  {
    id: 'remediation-3',
    riskPointId: 'risk-3',
    name: '实施最小权限原则',
    steps: [
      '梳理所有用户的实际工作需求',
      '重新设计角色权限体系',
      '收回不必要的权限',
      '建立权限申请和审批流程',
      '定期审查权限分配情况',
    ],
    estimatedEffort: 3,
    referenceLinks: ['https://www.gb688.cn/bzgk/gb/newGbInfo?hcno=73EEFA8E'],
  },
  {
    id: 'remediation-4',
    riskPointId: 'risk-4',
    name: '完善审计日志系统',
    steps: [
      '识别需要审计的关键操作和安全事件',
      '配置审计日志记录规则',
      '部署集中式日志管理系统',
      '设置日志保存期限（至少6个月）',
      '建立日志定期分析机制',
    ],
    estimatedEffort: 4,
    referenceLinks: ['https://www.djbh.net/webdev/web/GBDetail.aspx?id=1'],
  },
  {
    id: 'remediation-5',
    riskPointId: 'risk-5',
    name: '启用传输加密',
    steps: [
      '为所有Web应用部署SSL/TLS证书',
      '强制使用HTTPS协议',
      '配置安全的加密套件（禁用弱加密算法）',
      '定期检查证书有效期并及时续期',
    ],
    estimatedEffort: 3,
    referenceLinks: ['https://www.gb688.cn/bzgk/gb/newGbInfo?hcno=73EEFA8E'],
  },
  {
    id: 'remediation-6',
    riskPointId: 'risk-6',
    name: '实施数据加密存储',
    steps: [
      '识别需要加密的敏感数据字段',
      '选择符合国家标准的加密算法（如SM4）',
      '实施数据库字段级加密',
      '建立密钥管理系统',
      '对历史明文数据进行加密迁移',
    ],
    estimatedEffort: 6,
    referenceLinks: [
      'https://www.djbh.net/webdev/web/GBDetail.aspx?id=1',
      'https://www.gb688.cn/bzgk/gb/newGbInfo?hcno=73EEFA8E',
    ],
  },
  {
    id: 'remediation-7',
    riskPointId: 'risk-7',
    name: '建立补丁管理流程',
    steps: [
      '建立补丁管理制度',
      '部署补丁管理工具',
      '定期检查系统漏洞',
      '在测试环境验证补丁',
      '制定补丁发布计划并执行',
    ],
    estimatedEffort: 4,
    referenceLinks: ['https://www.djbh.net/webdev/web/GBDetail.aspx?id=1'],
  },
  {
    id: 'remediation-8',
    riskPointId: 'risk-8',
    name: '配置自动更新',
    steps: [
      '启用防病毒软件自动更新功能',
      '配置病毒库每日自动更新',
      '设置更新失败告警',
      '定期检查更新状态',
    ],
    estimatedEffort: 1,
    referenceLinks: ['https://www.gb688.cn/bzgk/gb/newGbInfo?hcno=73EEFA8E'],
  },
  {
    id: 'remediation-9',
    riskPointId: 'risk-9',
    name: '建立备份验证机制',
    steps: [
      '制定备份恢复测试计划',
      '每季度进行一次完整恢复演练',
      '记录恢复测试结果',
      '优化备份策略',
    ],
    estimatedEffort: 2,
    referenceLinks: ['https://www.djbh.net/webdev/web/GBDetail.aspx?id=1'],
  },
]

/**
 * 模拟法规模板数据
 */
export const mockRegulationTemplates: RegulationTemplate[] = [
  {
    id: 'template-1',
    name: '等保2.0 - 访问控制',
    description: '等级保护2.0标准中关于访问控制的相关要求',
    clauseIds: ['clause-1', 'clause-2', 'clause-3'],
  },
  {
    id: 'template-2',
    name: '等保2.0 - 数据安全',
    description: '等级保护2.0标准中关于数据安全的相关要求',
    clauseIds: ['clause-4', 'clause-5', 'clause-8'],
  },
  {
    id: 'template-3',
    name: '等保2.0 - 入侵防范',
    description: '等级保护2.0标准中关于入侵防范的相关要求',
    clauseIds: ['clause-6', 'clause-7'],
  },
  {
    id: 'template-4',
    name: '等保2.0 - 完整评估',
    description: '等级保护2.0标准的完整评估项',
    clauseIds: ['clause-1', 'clause-2', 'clause-3', 'clause-4', 'clause-5', 'clause-6', 'clause-7', 'clause-8'],
  },
]

/**
 * 根据模板ID获取解析结果
 */
export function getAnalysisResultByTemplate(templateId: string): AnalysisResult {
  const template = mockRegulationTemplates.find((t) => {
    return t.id === templateId
  })

  if (!template) {
    return {
      clauses: [],
      assessmentItems: [],
      riskPoints: [],
      remediationMeasures: [],
    }
  }

  const clauses = mockRegulationClauses.filter((c) => {
    return template.clauseIds.includes(c.id)
  })
  const assessmentItems = mockAssessmentItems.filter((a) => {
    return clauses.some((c) => {
      return c.id === a.clauseId
    })
  })
  const riskPoints = mockRiskPoints.filter((r) => {
    return assessmentItems.some((a) => {
      return a.id === r.assessmentItemId
    })
  })
  const remediationMeasures = mockRemediationMeasures.filter((m) => {
    return riskPoints.some((r) => {
      return r.id === m.riskPointId
    })
  })

  return {
    clauses,
    assessmentItems,
    riskPoints,
    remediationMeasures,
  }
}

/**
 * 根据自定义文本模拟解析结果（返回默认模板）
 */
export function getAnalysisResultByText(_text: string): AnalysisResult {
  // 演示项目中，无论输入什么文本，都返回第一个模板的结果
  return getAnalysisResultByTemplate('template-1')
}
