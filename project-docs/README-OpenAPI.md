# OpenAPI-TS + React Query 集成指南

本项目已成功集成 OpenAPI-TS 和 React Query，提供了类型安全、高性能的 API 请求解决方案。

## 🚀 快速开始

### 1. 生成 API 客户端

```bash
# 生成基于当前环境的 API 客户端
pnpm api:generate

# 或指定环境生成
pnpm api:generate:dev     # 开发环境
pnpm api:generate:staging # 预发布环境
pnpm api:generate:prod    # 生产环境
pnpm api:generate:local   # 本地 schema 文件
```

### 2. 生成 React Query Hooks

```bash
# 生成 React Query hooks
pnpm api:hooks

# 或一键设置（清理 + 生成 + hooks）
pnpm api:setup
```

### 3. 监控模式

```bash
# 监控 schema 变化并自动重新生成
pnpm api:watch
```

## 📁 项目结构

```
src/lib/api/
├── 🔧 config.ts              # API 配置
├── 🌐 client.ts              # 通用 API 客户端
├── 📍 endpoints.ts           # 端点管理
├── 🏷️  types.ts               # 手动类型定义
├── 🤖 generated/             # OpenAPI-TS 生成目录
│   ├── schema.ts             # OpenAPI Schema 类型
│   ├── services.ts           # 生成的 API 服务
│   └── types.ts              # 生成的类型定义
├── 🔗 adapters/              # 适配器层
│   ├── openapi-adapter.ts    # OpenAPI 客户端适配器
│   └── query-adapter.ts      # React Query 集成适配器
├── 🎣 hooks/                 # React Query Hooks
│   ├── generated/            # 自动生成的 hooks
│   └── factories/            # Hook 工厂函数
└── 🛠️  utils/                 # 工具函数
    ├── query-keys.ts         # 查询键生成器
    ├── cache-utils.ts        # 缓存工具
    └── type-guards.ts        # 类型守卫
```

## 🎯 使用方式

### 基础用法

```typescript
import { useUsers, useCreateUser } from '~/lib/api/hooks/generated'

function UserList() {
  // 获取用户列表
  const { data: users, isLoading } = useUsers({
    page: 1,
    pageSize: 10
  })

  // 创建用户
  const createUser = useCreateUser()

  const handleCreate = () => {
    createUser.mutate({
      email: 'user@example.com',
      name: 'New User'
    })
  }

  return (
    <div>
      {isLoading ? 'Loading...' : users?.map(user =>
        <div key={user.id}>{user.name}</div>
      )}
      <button onClick={handleCreate}>Create User</button>
    </div>
  )
}
```

### 高级用法

```typescript
import {
  useUsers,
  useCreateUser,
  queryPresets,
  cacheStrategies
} from '~/lib/api/openapi'

function AdvancedUserList() {
  // 使用自定义缓存策略
  const { data: users } = useUsers(
    { page: 1 },
    { ...cacheStrategies.realtime }
  )

  // 带乐观更新的变更
  const createUser = useCreateUser({
    optimisticUpdate: {
      queryKey: ['users', 'list'],
      updater: (old, newUser) => [...(old || []), newUser]
    }
  })

  return <div>...</div>
}
```

## 🔧 配置

### 环境变量

```bash
# .env.local
NEXT_PUBLIC_API_DEV_SCHEMA=http://localhost:3000/api/docs-json
NEXT_PUBLIC_API_PROD_SCHEMA=https://api.example.com/docs-json
OPENAPI_ENV=development
```

### 自定义配置

```typescript
// openapi-ts.config.ts
export default {
  input: 'http://localhost:3000/api/docs-json',
  output: {
    path: './src/lib/api/generated',
  },
  // 更多配置...
}
```

## 📚 核心特性

### 1. 类型安全

- 端到端的 TypeScript 类型支持
- 运行时类型检查和验证
- 自动生成的接口定义

### 2. 智能缓存

```typescript
// 预定义缓存策略
const strategies = {
  realtime: { staleTime: 0 }, // 实时数据
  fast: { staleTime: 30 * 1000 }, // 30秒
  standard: { staleTime: 5 * 60 * 1000 }, // 5分钟
  slow: { staleTime: 30 * 60 * 1000 }, // 30分钟
  static: { staleTime: Infinity }, // 永不过期
}
```

### 3. 错误处理

```typescript
import { isAuthError, isNetworkError } from '~/lib/api/openapi'

const { error } = useUsers()

if (isAuthError(error)) {
  // 处理认证错误
} else if (isNetworkError(error)) {
  // 处理网络错误
}
```

### 4. 查询键管理

```typescript
import { queryKeys, QueryInvalidator } from '~/lib/api/openapi'

// 层级化查询键
queryKeys.users.all // ['users']
queryKeys.users.list(params) // ['users', 'list', params]
queryKeys.users.detail(id) // ['users', 'detail', id]

// 批量失效
const invalidator = new QueryInvalidator(queryClient)
await invalidator.invalidateResource('users', ['lists', 'details'])
```

## 🔍 调试和监控

### React Query DevTools

开发环境自动启用，提供：

- 查询状态可视化
- 缓存数据查看
- 请求时间线

### 缓存性能监控

```typescript
import { createPerformanceMonitor } from '~/lib/api/openapi'

const monitor = createPerformanceMonitor()
const report = monitor.getPerformanceReport()
console.log('缓存命中率:', report)
```

## 🚨 注意事项

1. **生成的文件不要手动修改** - 使用 `@generated` 标记的文件会被自动覆盖
2. **环境配置** - 确保在不同环境使用正确的 API Schema URL
3. **版本同步** - API Schema 变更后及时重新生成客户端
4. **缓存策略** - 根据数据特性选择合适的缓存策略

## 🔗 相关链接

- [OpenAPI-TS 文档](https://hey-api.dev/openapi-ts/)
- [TanStack Query 文档](https://tanstack.com/query/latest)
- [项目 API 文档](./docs/api.md)

---

## 🤝 贡献指南

1. 修改 `schema.yaml` 或后端 OpenAPI 规范
2. 运行 `pnpm api:setup` 重新生成
3. 测试生成的 hooks
4. 提交代码

**快速开始生成：**

```bash
# 首次设置
pnpm api:setup

# 开发时监控
pnpm api:watch
```
