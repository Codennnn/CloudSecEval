/**
 * 高级搜索配置器演示页面
 *
 * 展示搜索配置器的完整功能和使用方法
 * 包含实际的搜索字段配置和演示数据
 */

'use client'

import { useCallback, useState } from 'react'

import { toast } from 'sonner'

import { SearchBuilder } from '~/components/advanced-search/SearchBuilder'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import type { SearchConfig, SearchField } from '~/types/advanced-search'

/**
 * 演示用户数据接口
 */
interface DemoUser {
  id: number
  name: string
  email: string
  isActive: boolean
  userType: string
  purchaseAmount: number
  registrationDate: string
}

/**
 * 示例搜索字段配置
 */
const DEMO_SEARCH_FIELDS: SearchField[] = [
  // 用户信息字段组
  {
    key: 'name',
    label: '用户姓名',
    type: 'string',
    description: '用户的真实姓名或昵称',
    group: '用户信息',
  },
  {
    key: 'email',
    label: '邮箱地址',
    type: 'string',
    description: '用户注册邮箱',
    group: '用户信息',
  },
  {
    key: 'phone',
    label: '手机号码',
    type: 'string',
    description: '用户绑定的手机号',
    group: '用户信息',
  },
  {
    key: 'isActive',
    label: '账户状态',
    type: 'boolean',
    description: '用户账户是否激活',
    group: '用户信息',
  },
  {
    key: 'userType',
    label: '用户类型',
    type: 'enum',
    description: '用户账户类型',
    group: '用户信息',
    options: [
      { value: 'individual', label: '个人用户' },
      { value: 'enterprise', label: '企业用户' },
      { value: 'vip', label: 'VIP用户' },
      { value: 'admin', label: '管理员' },
    ],
  },

  // 业务数据字段组
  {
    key: 'purchaseAmount',
    label: '购买金额',
    type: 'number',
    description: '用户累计购买金额（元）',
    group: '业务数据',
  },
  {
    key: 'orderCount',
    label: '订单数量',
    type: 'number',
    description: '用户累计订单数量',
    group: '业务数据',
  },
  {
    key: 'lastLoginDate',
    label: '最后登录时间',
    type: 'date',
    description: '用户最后一次登录的时间',
    group: '业务数据',
  },
  {
    key: 'registrationDate',
    label: '注册时间',
    type: 'date',
    description: '用户账户注册时间',
    group: '业务数据',
  },
  {
    key: 'riskLevel',
    label: '风险等级',
    type: 'enum',
    description: '用户风险评估等级',
    group: '业务数据',
    options: [
      { value: 'safe', label: '安全' },
      { value: 'low', label: '低风险' },
      { value: 'medium', label: '中风险' },
      { value: 'high', label: '高风险' },
      { value: 'critical', label: '极高风险' },
    ],
  },

  // 地理位置字段组
  {
    key: 'country',
    label: '国家',
    type: 'string',
    description: '用户所在国家',
    group: '地理位置',
  },
  {
    key: 'city',
    label: '城市',
    type: 'string',
    description: '用户所在城市',
    group: '地理位置',
  },
  {
    key: 'region',
    label: '地区',
    type: 'enum',
    description: '用户所在地区',
    group: '地理位置',
    options: [
      { value: 'north', label: '华北地区' },
      { value: 'south', label: '华南地区' },
      { value: 'east', label: '华东地区' },
      { value: 'west', label: '华西地区' },
      { value: 'central', label: '华中地区' },
      { value: 'northeast', label: '东北地区' },
      { value: 'southwest', label: '西南地区' },
      { value: 'northwest', label: '西北地区' },
    ],
  },
]

/**
 * 初始搜索配置
 */
const INITIAL_CONFIG: Partial<SearchConfig> = {
  globalSearch: '',
  searchMode: 'advanced',
  sortBy: 'registrationDate',
  sortOrder: 'desc',
  pagination: {
    page: 1,
    pageSize: 20,
  },
  defaultLogicalOperator: 'and',
  conditions: [
    {
      id: 'demo-condition-1',
      field: 'isActive',
      operator: 'eq',
      value: true,
      logicalOperator: 'and',
      enabled: true,
    },
  ],
}

/**
 * 高级搜索配置器演示页面
 */
export default function SearchBuilderDemoPage() {
  const [, setSearchConfig] = useState<SearchConfig | undefined>()
  const [searchResults, setSearchResults] = useState<DemoUser[]>([])
  const [isSearching, setIsSearching] = useState(false)

  /**
   * 处理搜索配置变更
   */
  const handleConfigChange = useCallback((config: SearchConfig) => {
    setSearchConfig(config)
    // console.log('搜索配置已更新:', config)
  }, [])

  /**
   * 模拟执行搜索
   */
  const handleSearch = useCallback(async (_config: SearchConfig) => {
    setIsSearching(true)

    try {
      // 模拟 API 调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 模拟搜索结果
      const mockResults: DemoUser[] = [
        {
          id: 1,
          name: '张三',
          email: 'zhangsan@example.com',
          isActive: true,
          userType: 'individual',
          purchaseAmount: 1250.00,
          registrationDate: '2023-01-15',
        },
        {
          id: 2,
          name: '李四',
          email: 'lisi@example.com',
          isActive: true,
          userType: 'enterprise',
          purchaseAmount: 5680.50,
          registrationDate: '2023-02-20',
        },
        {
          id: 3,
          name: '王五',
          email: 'wangwu@example.com',
          isActive: false,
          userType: 'vip',
          purchaseAmount: 8900.75,
          registrationDate: '2023-03-10',
        },
      ]

      setSearchResults(mockResults)

      toast.success('搜索完成', {
        description: `找到 ${mockResults.length} 条记录`,
      })
    }
    catch (_error) {
      toast.error('搜索失败', {
        description: '请检查网络连接后重试',
      })
    }
    finally {
      setIsSearching(false)
    }
  }, [])

  /**
   * 渲染搜索结果
   */
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return (
        <Alert>
          <AlertDescription>
            暂无搜索结果。请配置搜索条件并点击"执行搜索"按钮。
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">搜索结果</h3>
          <Badge variant="secondary">
            共 {searchResults.length} 条记录
          </Badge>
        </div>

        <div className="grid gap-4">
          {searchResults.map((result) => (
            <Card key={result.id}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">姓名：</span>
                    <span>{result.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">邮箱：</span>
                    <span>{result.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">状态：</span>
                    <Badge variant={result.isActive ? 'default' : 'secondary'}>
                      {result.isActive ? '激活' : '未激活'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">类型：</span>
                    <span>{DEMO_SEARCH_FIELDS.find((f) => f.key === 'userType')?.options?.find((o) => o.value === result.userType)?.label}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">购买金额：</span>
                    <span>¥{result.purchaseAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">注册时间：</span>
                    <span>{result.registrationDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 页面标题 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">高级搜索配置器演示</h1>
        <p className="text-muted-foreground">
          展示高级搜索配置器的完整功能，包括多字段、多操作符组合查询、拖拽排序、查询预览等特性。
        </p>
      </div>

      <Tabs className="space-y-6" defaultValue="demo">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">功能演示</TabsTrigger>
          <TabsTrigger value="fields">字段配置</TabsTrigger>
          <TabsTrigger value="examples">使用示例</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="demo">
          {/* 搜索配置器 */}
          <SearchBuilder
            enableDragSort={true}
            fields={DEMO_SEARCH_FIELDS}
            initialConfig={INITIAL_CONFIG}
            maxConditions={10}
            showPreview={true}
            onChange={handleConfigChange}
            onSearch={handleSearch}
          />

          <Separator />

          {/* 搜索结果 */}
          <Card>
            <CardHeader>
              <CardTitle>搜索结果</CardTitle>
              <CardDescription>
                {isSearching ? '正在搜索...' : '基于当前搜索条件的模拟结果'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSearching
                ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  )
                : (
                    renderSearchResults()
                  )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="fields">
          <Card>
            <CardHeader>
              <CardTitle>字段配置说明</CardTitle>
              <CardDescription>
                演示页面使用的搜索字段配置和类型说明
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(
                  DEMO_SEARCH_FIELDS.reduce<Record<string, SearchField[]>>((groups, field) => {
                    const group = field.group ?? '其他'

                    if (!(group in groups)) {
                      groups[group] = []
                    }

                    groups[group].push(field)

                    return groups
                  }, {}),
                ).map(([groupName, groupFields]) => (
                  <div key={groupName} className="space-y-3">
                    <h3 className="font-semibold text-lg">{groupName}</h3>
                    <div className="grid gap-4">
                      {groupFields.map((field) => (
                        <div key={field.key} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{field.label}</h4>
                            <Badge variant="outline">{field.type}</Badge>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {field.key}
                            </code>
                          </div>
                          {field.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {field.description}
                            </p>
                          )}
                          {field.options && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-muted-foreground mr-2">选项：</span>
                              {field.options.map((option) => (
                                <Badge key={option.value} className="text-xs" variant="secondary">
                                  {option.label}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="examples">
          <Card>
            <CardHeader>
              <CardTitle>使用示例</CardTitle>
              <CardDescription>
                高级搜索配置器的基本使用方法和代码示例
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">基本用法</h3>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{`import { SearchBuilder } from '~/components/advanced-search/SearchBuilder'
import { SearchField, SearchConfig } from '~/types/advanced-search/search'

const fields: SearchField[] = [
  {
    key: 'name',
    label: '姓名',
    type: 'string',
    group: '基本信息'
  },
  {
    key: 'age',
    label: '年龄',
    type: 'number',
    group: '基本信息'
  },
  {
    key: 'isActive',
    label: '激活状态',
    type: 'boolean'
  }
]

function MySearchPage() {
  const handleSearch = (config: SearchConfig) => {
    console.log('执行搜索:', config)
    // 调用 API 执行搜索
  }

  return (
    <SearchBuilder
      fields={fields}
      onSearch={handleSearch}
      showPreview={true}
      enableDragSort={true}
      maxConditions={10}
    />
  )
}`}
                  </code>
                </pre>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">高级配置</h3>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{`const initialConfig: Partial<SearchConfig> = {
  globalSearch: '全局搜索关键词',
  searchMode: 'advanced',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  pagination: { page: 1, pageSize: 20 },
  conditions: [
    {
      id: 'condition-1',
      field: 'status',
      operator: 'eq',
      value: 'active',
      enabled: true
    }
  ]
}

<SearchBuilder
  fields={fields}
  initialConfig={initialConfig}
  onChange={(config) => console.log('配置变更:', config)}
  onSearch={handleSearch}
  showPreview={true}
  enableDragSort={true}
  maxConditions={20}
  className="my-search-builder"
/>`}
                  </code>
                </pre>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">字段类型支持</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">字符串类型 (string)</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>• 等于 (eq)</div>
                      <div>• 不等于 (neq)</div>
                      <div>• 包含 (contains)</div>
                      <div>• 开始于 (startsWith)</div>
                      <div>• 结束于 (endsWith)</div>
                      <div>• 正则匹配 (regex)</div>
                      <div>• 模糊匹配 (ilike)</div>
                      <div>• 包含于/不包含于 (in/notIn)</div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">数值类型 (number)</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>• 等于/不等于 (eq/neq)</div>
                      <div>• 大于 (gt)</div>
                      <div>• 大于等于 (gte)</div>
                      <div>• 小于 (lt)</div>
                      <div>• 小于等于 (lte)</div>
                      <div>• 范围查询 (between)</div>
                      <div>• 包含于/不包含于 (in/notIn)</div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">日期类型 (date)</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>• 等于/不等于 (eq/neq)</div>
                      <div>• 早于 (lt)</div>
                      <div>• 早于等于 (lte)</div>
                      <div>• 晚于 (gt)</div>
                      <div>• 晚于等于 (gte)</div>
                      <div>• 日期范围 (between)</div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">布尔类型 (boolean)</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>• 等于 (eq)</div>
                      <div>• 不等于 (neq)</div>
                      <div>• 为空 (isNull)</div>
                      <div>• 不为空 (isNotNull)</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
