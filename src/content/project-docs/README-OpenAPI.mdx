# OpenAPI-TS + React Query 集成指南

本项目使用 @hey-api/openapi-ts v0.80.5 和 @tanstack/react-query v5，提供了类型安全、高性能的 API 请求解决方案。

## 🚀 快速开始

### 1. 生成 API 客户端

```bash
# 生成 API 客户端和类型定义
pnpm api:generate

# 一键设置（清理旧文件 + 生成新文件）
pnpm api:setup

# 清理生成的文件
pnpm api:clean
```

> **注意**：项目当前只支持单一环境的 API 生成，默认从 `http://[::1]:8007/api-docs-json` 获取 OpenAPI 规范。

## 📁 项目结构

```
src/lib/api/
├── 🔧 config.ts              # API 配置管理
├── 🌐 client.ts              # 统一 API 客户端
├── 📍 endpoints.ts           # API 端点定义
├── 🏷️  types.ts               # 手动类型定义
└── 🤖 generated/             # OpenAPI-TS 生成目录
    ├── @tanstack/
    │   └── react-query.gen.ts # 自动生成的 React Query hooks
    ├── client/               # 生成的客户端代码
    │   ├── client.ts         # 客户端实例
    │   ├── index.ts          # 客户端导出
    │   ├── types.ts          # 客户端类型
    │   └── utils.ts          # 客户端工具
    ├── core/                 # 核心功能
    │   ├── auth.ts           # 认证处理
    │   ├── bodySerializer.ts # 请求体序列化
    │   ├── params.ts         # 参数处理
    │   ├── pathSerializer.ts # 路径序列化
    │   └── types.ts          # 核心类型
    ├── client.gen.ts         # 生成的客户端
    ├── schemas.gen.ts        # JSON Schema 定义
    ├── sdk.gen.ts            # SDK 方法定义
    └── types.gen.ts          # 类型定义

# 业务层 API Hooks（手动编写）
src/app/admini/hooks/api/
├── useAuth.ts                # 认证相关 hooks
└── useLicense.ts             # 授权码相关 hooks
```

## 🎯 使用方式

### 1. 自动生成的 React Query Hooks

```typescript
// 从生成的文件中导入 hooks（推荐用于简单查询）
import {
  usersControllerFindAllUsersQueryOptions,
  usersControllerCreateMutation
} from '~api/@tanstack/react-query.gen'

function UserListSimple() {
  // 使用生成的查询选项
  const { data: users, isLoading } = useQuery(
    usersControllerFindAllUsersQueryOptions()
  )

  // 使用生成的变更 hook
  const createUser = useMutation(usersControllerCreateMutation())

  return <div>...</div>
}
```

### 2. 业务层自定义 Hooks（推荐）

```typescript
// 使用业务层封装的 hooks
import { useLogin, useProfile } from '~admin/hooks/api/useAuth'
import { useLicenses, useCreateLicense } from '~admin/hooks/api/useLicense'

function AdminDashboard() {
  // 认证相关
  const login = useLogin()
  const { data: profile } = useProfile()

  // 授权码管理
  const { data: licenses, isLoading } = useLicenses({
    page: 1,
    pageSize: 10
  })

  const createLicense = useCreateLicense()

  const handleLogin = () => {
    login.mutate({
      email: 'admin@example.com',
      password: 'password'
    })
  }

  const handleCreateLicense = () => {
    createLicense.mutate({
      name: 'Premium License',
      expiresAt: '2024-12-31'
    })
  }

  return (
    <div>
      <h1>Welcome, {profile?.name}</h1>
      {isLoading ? 'Loading licenses...' : (
        <div>
          {licenses?.data.map(license => (
            <div key={license.id}>{license.name}</div>
          ))}
        </div>
      )}
      <button onClick={handleCreateLicense}>Create License</button>
    </div>
  )
}
```

### 3. 使用统一的 API 客户端

```typescript
import { api } from '~/lib/api/client'

// 直接使用 API 客户端（用于复杂场景）
const response = await api.get('/users', {
  params: { page: 1, pageSize: 10 },
})
```

## 🔧 配置

### 环境变量

```bash
# .env.local
# API 服务器基础 URL
NEXT_PUBLIC_API_BASE_URL=https://example.com/api

# API 代理配置（Next.js 应用中的路径）
NEXT_PUBLIC_API_PROXY_SOURCE=/api
NEXT_PUBLIC_API_PROXY_DESTINATION=http://localhost:8007/api

# 付费内容功能开关
NEXT_PUBLIC_ENABLE_PAID_CONTENT_MODE=false

# Orama 搜索服务配置
NEXT_PUBLIC_ORAMA_API_KEY=your_orama_api_key_here
NEXT_PUBLIC_ORAMA_ENDPOINT=https://cloud.orama.run/v1/indexes/your_index_name
```

### OpenAPI-TS 配置

```typescript
// openapi-ts.config.ts
import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  // OpenAPI 规范 URL
  input: {
    path: 'http://[::1]:8007/api-docs-json',
  },

  // 输出配置
  output: {
    path: './src/lib/api/generated',
    indexFile: false, // 禁用生成 index 文件，避免循环引用
  },

  // 插件配置
  plugins: [
    // TypeScript 类型生成
    {
      name: '@hey-api/typescript',
      enums: 'typescript', // 生成 TypeScript 枚举
    },

    // SDK 客户端生成
    {
      name: '@hey-api/sdk',
      asClass: false, // 使用函数而非类
      operationId: true, // 使用 operationId 作为函数名
      response: 'body', // 只返回响应数据
      validator: false, // 禁用运行时验证
    },

    // Fetch 客户端
    {
      name: '@hey-api/client-fetch',
      bundle: true, // 打包客户端代码
      exportFromIndex: false, // 不从 index 导出
    },

    // JSON Schema 生成
    {
      name: '@hey-api/schemas',
      type: 'json',
    },

    // React Query hooks 生成
    '@tanstack/react-query',
  ],
})
```

### API 客户端配置

```typescript
// src/lib/api/config.ts
export const API_CONFIG = {
  // API 基础 URL
  baseUrl:
    process.env.NEXT_PUBLIC_API_PROXY_SOURCE ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    '',

  // 请求超时时间（毫秒）
  timeout: 10 * 1000,

  // 失败重试次数
  retries: 3,

  // 重试基础延迟时间（毫秒）
  retryDelay: 1000,

  // 是否启用开发工具
  enableDevtools: isDevelopment(),

  // 缓存配置
  cacheTime: 30 * 60 * 1000, // 30 分钟
  staleTime: 5 * 60 * 1000, // 5 分钟
}
```

## 📚 核心特性

### 1. 类型安全

- **端到端 TypeScript 支持**：从后端 OpenAPI 规范自动生成前端类型定义
- **编译时类型检查**：确保 API 调用的参数和返回值类型正确
- **自动代码提示**：IDE 中完整的类型提示和自动补全

### 2. 智能缓存与状态管理

```typescript
// React Query 配置（src/providers/QueryProvider.tsx）
const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟新鲜度
      gcTime: 30 * 60 * 1000, // 30分钟缓存时间
      retry: (failureCount, error) => {
        // 4xx 错误不重试，5xx 错误重试
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
      refetchOnReconnect: true, // 网络重连时重新获取
    },
  },
}
```

### 3. 错误处理机制

```typescript
// 统一的错误处理（src/lib/api/client.ts）
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 在业务层 hook 中使用
const { data, error, isLoading } = useLicenses()

if (error) {
  if (error.status === 401) {
    // 处理认证错误
    router.push('/admin/login')
  } else {
    // 显示错误提示
    toast.error(error.message)
  }
}
```

### 4. 查询键管理

```typescript
// 结构化查询键（业务层 hooks）
export const licenseQueryKeys = {
  all: ['license'] as const,
  lists: () => [...licenseQueryKeys.all, 'list'] as const,
  list: (params?: LicenseQueryParams) =>
    [...licenseQueryKeys.lists(), params] as const,
  details: () => [...licenseQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...licenseQueryKeys.details(), id] as const,
} as const

// 在 React Query 中使用
const { data: licenses } = useQuery({
  queryKey: licenseQueryKeys.list(params),
  queryFn: () => fetchLicenses(params),
})
```

### 5. 请求拦截与认证

```typescript
// 自动处理认证 Token（src/lib/api/client.ts）
const client = createClient({
  baseUrl: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  interceptors: {
    request: (config) => {
      // 自动添加认证头
      const token = getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    response: (response) => {
      // 自动处理 401 错误
      if (response.status === 401) {
        clearAuthToken()
        window.location.href = '/admin/login'
      }
      return response
    },
  },
})
```

## 🔍 调试和监控

### React Query DevTools

开发环境下自动启用（src/providers/QueryProvider.tsx）：

```typescript
// 根据配置显示 React Query 开发工具
{isDevtoolsEnabled() && (
  <ReactQueryDevtools
    buttonPosition="bottom-right"
    initialIsOpen={false}
  />
)}
```

提供以下功能：

- **查询状态可视化**：实时查看所有查询的状态
- **缓存数据查看**：检查缓存中的数据内容
- **网络请求时间线**：监控 API 请求的执行情况
- **查询键管理**：查看和管理查询键结构

### API 请求日志

```typescript
// 开发环境下启用详细日志（src/lib/api/config.ts）
export const API_CONFIG = {
  enableLogging: isDevelopment(), // 开发环境启用日志
  enableDevtools: isDevelopment(), // 开发环境启用开发工具
}

// 请求和响应会自动记录到控制台
```

## 🚨 注意事项

1. **生成的文件不要手动修改**
   - `src/lib/api/generated/` 目录下的所有文件都是自动生成的
   - 这些文件会在每次运行 `pnpm api:generate` 时被覆盖

2. **API Schema 同步**
   - 后端 API 变更后，需要重新运行 `pnpm api:setup` 更新客户端
   - 确保后端服务在 `http://[::1]:8007` 运行且 `/api-docs-json` 端点可访问

3. **缓存策略选择**
   - 实时数据（如在线用户）：使用较短的 `staleTime`
   - 相对静态数据（如用户配置）：使用较长的 `staleTime`
   - 根据业务需求在业务层 hooks 中定制缓存策略

4. **错误处理最佳实践**
   - 在业务层 hooks 中统一处理常见错误（401、403、500等）
   - 使用 toast 提示用户友好的错误信息
   - 对于认证错误，自动跳转到登录页面

## 🔗 相关链接

- [@hey-api/openapi-ts 文档](https://hey-api.dev/openapi-ts/)
- [TanStack Query v5 文档](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)

---

## 🤝 开发工作流

### 首次设置

```bash
# 1. 确保后端服务运行在 http://[::1]:8007
# 2. 生成 API 客户端
pnpm api:setup

# 3. 开始开发
pnpm dev
```

### API 变更工作流

```bash
# 1. 后端更新 OpenAPI 规范
# 2. 重新生成客户端
pnpm api:setup

# 3. 检查生成的类型定义
# 4. 更新业务层 hooks（如需要）
# 5. 测试 API 调用
# 6. 提交代码
```

### 调试建议

1. **使用 React Query DevTools** 查看查询状态和缓存数据
2. **检查浏览器 Network 面板** 确认 API 请求正确发送
3. **查看控制台日志** 了解请求和响应详情（开发环境）
4. **使用 TypeScript 类型检查** 确保 API 调用的类型安全
