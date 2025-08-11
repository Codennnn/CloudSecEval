# 高级搜索配置器组件

一个功能完整的高级搜索条件配置器组件，支持多字段、多操作符组合查询，生成符合后端 API 规范的查询参数。

## ✨ 特性

- 🔍 **多字段搜索** - 支持字符串、数值、日期、布尔、枚举等多种字段类型
- 🔧 **丰富的操作符** - 等于、包含、范围、正则表达式等 20+ 种操作符
- 🎯 **智能匹配** - 根据字段类型自动显示支持的操作符
- 🎨 **可视化界面** - 卡片式设计，拖拽排序，直观易用
- 📊 **实时预览** - 实时生成查询参数和代码示例
- 💾 **导入导出** - 支持配置导入导出，保存查询模板
- 🎛️ **高度可定制** - 支持自定义字段、操作符、样式等
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🚀 快速开始

### 基本用法

```tsx
import { SearchBuilder } from '~/components/advanced-search/SearchBuilder'
import { SearchField, SearchConfig } from '~/types/advanced-search/search'

const fields: SearchField[] = [
  {
    key: 'name',
    label: '用户姓名',
    type: 'string',
    group: '基本信息',
  },
  {
    key: 'age',
    label: '年龄',
    type: 'number',
    group: '基本信息',
  },
  {
    key: 'isActive',
    label: '激活状态',
    type: 'boolean',
  },
]

function MySearchPage() {
  const handleSearch = (config: SearchConfig) => {
    console.log('执行搜索:', config)
    // 调用后端 API
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
}
```

### 高级配置

```tsx
const initialConfig: Partial<SearchConfig> = {
  globalSearch: '全局搜索关键词',
  searchMode: 'advanced',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  pagination: { page: 1, pageSize: 20 },
  defaultLogicalOperator: 'and',
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
/>
```

## 📋 API 参考

### SearchBuilder Props

| 属性             | 类型                             | 默认值  | 描述             |
| ---------------- | -------------------------------- | ------- | ---------------- |
| `fields`         | `SearchField[]`                  | -       | 可搜索的字段配置 |
| `initialConfig`  | `Partial<SearchConfig>`          | -       | 初始搜索配置     |
| `onChange`       | `(config: SearchConfig) => void` | -       | 配置变更回调     |
| `onSearch`       | `(config: SearchConfig) => void` | -       | 搜索执行回调     |
| `showPreview`    | `boolean`                        | `true`  | 是否显示预览面板 |
| `enableDragSort` | `boolean`                        | `true`  | 是否启用拖拽排序 |
| `maxConditions`  | `number`                         | `10`    | 最大条件数量限制 |
| `className`      | `string`                         | -       | 自定义样式类名   |
| `disabled`       | `boolean`                        | `false` | 是否禁用         |

### SearchField 配置

```typescript
interface SearchField {
  key: string // 字段键名
  label: string // 字段显示标签
  type: FieldType // 字段数据类型
  options?: Array<{
    // 枚举选项（仅 enum 类型）
    value: string
    label: string
  }>
  description?: string // 字段描述
  required?: boolean // 是否必填
  group?: string // 字段分组
}
```

### 支持的字段类型

- **string** - 字符串类型，支持文本搜索、正则匹配等
- **number** - 数值类型，支持范围查询、比较操作等
- **date** - 日期类型，支持日期范围、比较操作等
- **boolean** - 布尔类型，支持是/否选择
- **enum** - 枚举类型，支持预定义选项选择

### 支持的操作符

#### 通用操作符

- `eq` - 等于
- `neq` - 不等于
- `isNull` - 为空
- `isNotNull` - 不为空

#### 字符串专用

- `contains` - 包含子字符串
- `startsWith` - 以...开始
- `endsWith` - 以...结束
- `regex` - 正则表达式匹配
- `ilike` - 不区分大小写匹配

#### 数值/日期专用

- `gt` - 大于
- `gte` - 大于等于
- `lt` - 小于
- `lte` - 小于等于
- `between` - 范围查询

#### 数组操作

- `in` - 包含于列表
- `notIn` - 不包含于列表

## 🎯 查询参数格式

生成的查询参数符合 RESTful API 规范：

```javascript
// 简单查询
{
  "name": "张三",           // 等于操作可简化
  "age[gte]": 18,          // 大于等于
  "status[in]": ["active", "pending"], // 包含于
  "isVip[eq]": true,       // 布尔值
  "createdAt[between]": ["2023-01-01", "2023-12-31"], // 范围
  "email[isNotNull]": true, // 非空检查

  // 全局参数
  "search": "全局搜索关键词",
  "searchMode": "advanced",
  "operator": "and",
  "sortBy": "createdAt",
  "sortOrder": "desc",
  "page": 1,
  "pageSize": 20
}
```

## 🔧 自定义操作符

```typescript
import { OperatorConfig } from '~/types/advanced-search/search'

const customOperators: OperatorConfig[] = [
  {
    value: 'customOp',
    label: '自定义操作',
    description: '自定义操作符描述',
    requiresValue: true,
    supportedTypes: ['string']
  }
]

<SearchBuilder
  fields={fields}
  customOperators={customOperators}
  // ...
/>
```

## 🎨 样式定制

组件使用 Tailwind CSS 构建，支持通过 className 定制样式：

```tsx
<SearchBuilder
  className="border rounded-lg shadow-lg"
  fields={fields}
  // ...
/>
```

## 📱 演示页面

访问 `/test/search-builder` 查看完整的功能演示和使用示例。

## 🛠️ 开发

### 项目结构

```
src/components/advanced-search/
├── SearchBuilder.tsx          # 主组件
├── SearchConditionCard.tsx    # 条件卡片
├── OperatorSelect.tsx         # 操作符选择
├── ValueInput.tsx             # 值输入组件
├── SearchPreview.tsx          # 查询预览
└── README.md                  # 说明文档

src/types/advanced-search/search.ts      # 类型定义
src/utils/advanced-search/search-config.ts # 工具函数
src/hooks/advanced-search/useSearchBuilder.ts # 状态管理 Hook
```

### 依赖项

- React 19+
- TypeScript 5+
- Tailwind CSS 4+
- Radix UI 组件
- @dnd-kit 拖拽库
- date-fns 日期处理
- Sonner 通知组件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个组件！

## 📄 许可证

MIT License
