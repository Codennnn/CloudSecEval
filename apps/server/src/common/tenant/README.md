# 多租户数据隔离方案

## 📋 概述

本方案提供了一套完整的多租户数据隔离解决方案，确保每个组织的数据完全隔离，防止跨租户数据访问漏洞。

## 🎯 核心目标

1. **自动化**: 自动注入租户上下文，自动应用数据过滤
2. **类型安全**: 完整的 TypeScript 类型支持
3. **可审计**: 记录所有绕过租户隔离的操作
4. **易迁移**: 最小化现有代码改动

## 🏗️ 架构设计

### 核心组件

```
┌─────────────────────────────────────────────────────┐
│                   HTTP Request                       │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              JwtAuthGuard (认证)                     │
│         提取 user 信息到 request.user                │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│       TenantContextInterceptor (租户上下文注入)      │
│    从 request.user 提取 orgId 和 userId             │
│    设置到 TenantContext (REQUEST 作用域)             │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│         PermissionsGuard (权限验证)                  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              Controller (业务逻辑)                    │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│        Service (调用 Repository)                     │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│    TenantAwareRepository (自动应用租户过滤)          │
│    - findMany: WHERE orgId = currentOrgId           │
│    - create: 自动注入 orgId                          │
│    - update/delete: 自动验证归属                     │
└─────────────────────────────────────────────────────┘
```

### 关键设计

1. **REQUEST 作用域**: `TenantContext` 使用 REQUEST 作用域，每个请求都有独立的实例
2. **拦截器注入**: 在认证后自动注入租户上下文
3. **仓库基类**: 继承 `TenantAwareRepository` 自动获得租户隔离能力
4. **临时绕过**: 支持在特定场景下临时绕过租户隔离

## 🚀 快速开始

### 1. 集成到 AppModule

```typescript
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TenantModule } from '~/common/tenant/tenant.module'
import { TenantContextInterceptor } from '~/common/tenant/interceptors/tenant-context.interceptor'

@Module({
  imports: [
    TenantModule, // 导入租户模块
    // ... 其他模块
  ],
  providers: [
    // 注册全局拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
    // ... 其他 providers
  ],
})
export class AppModule {}
```

### 2. 创建租户感知的 Repository

```typescript
import { Injectable } from '@nestjs/common'
import { Prisma, BugReport } from '@prisma/client'
import { TenantAwareRepository } from '~/common/tenant/repositories/tenant-aware.repository'
import { TenantContext } from '~/common/tenant/services/tenant-context.service'
import { PrismaService } from '~/prisma/prisma.service'

@Injectable()
export class BugReportsRepository extends TenantAwareRepository<
  BugReport,
  Prisma.BugReportWhereUniqueInput,
  Prisma.BugReportWhereInput,
  Prisma.BugReportCreateInput,
  Prisma.BugReportUpdateInput,
  Prisma.BugReportInclude
> {
  constructor(prisma: PrismaService, tenantContext: TenantContext) {
    super(prisma, prisma.bugReport, tenantContext, 'BugReport')
  }

  // 所有基础 CRUD 操作都已自动带有租户隔离
  // 你可以添加自定义方法
}
```

### 3. 在 Service 中使用

```typescript
@Injectable()
export class BugReportsService {
  constructor(private readonly repository: BugReportsRepository) {}

  // 自动只返回当前组织的数据
  async findAll() {
    return this.repository.findMany()
  }

  // 自动注入当前组织 ID
  async create(data: CreateBugReportDto) {
    return this.repository.create(data)
  }

  // 自动验证归属后再更新
  async update(id: string, data: UpdateBugReportDto) {
    return this.repository.update(id, data)
  }
}
```

## 🔧 高级用法

### 临时绕过租户隔离

```typescript
@Injectable()
export class AdminService {
  constructor(
    private readonly tenantContext: TenantContext,
    private readonly repository: BugReportsRepository
  ) {}

  // 获取所有组织的数据（需要超级管理员权限）
  async getAllReportsAcrossOrganizations() {
    return this.tenantContext.runWithoutTenantIsolation(
      {
        action: 'ADMIN_GET_ALL_REPORTS',
        reason: '管理员查询所有组织的漏洞报告',
        isSystemOperation: false,
      },
      async () => {
        return this.repository.findMany()
      }
    )
  }
}
```

### 使用装饰器标记绕过

```typescript
@Controller('admin')
export class AdminController {
  @Get('all-reports')
  @BypassTenantIsolation()
  @RequirePermissions('SUPER_ADMIN')
  async getAllReports() {
    return this.adminService.getAllReportsAcrossOrganizations()
  }
}
```

### 验证资源归属

```typescript
@Injectable()
export class BugReportsService {
  constructor(
    private readonly tenantContext: TenantContext,
    private readonly repository: BugReportsRepository
  ) {}

  async shareReport(reportId: string, targetOrgId: string) {
    // 先获取报告
    const report = await this.repository.findByIdOrThrow(reportId)

    // 验证报告属于当前组织
    this.tenantContext.verifyResourceOwnership(report.orgId, '漏洞报告')

    // 执行分享逻辑
    // ...
  }
}
```

## 📝 迁移指南

### 步骤 1: 识别需要隔离的模型

检查你的 Prisma Schema，找出所有包含 `orgId` 字段的模型。

### 步骤 2: 创建新的 Repository

```typescript
// 旧的 Repository (不使用继承)
@Injectable()
export class BugReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bugReport.findMany()
  }
}

// 新的 Repository (继承 TenantAwareRepository)
@Injectable()
export class BugReportsRepository extends TenantAwareRepository<...> {
  constructor(
    prisma: PrismaService,
    tenantContext: TenantContext,
  ) {
    super(prisma, prisma.bugReport, tenantContext, 'BugReport')
  }
}
```

### 步骤 3: 更新 Service

```typescript
// 旧代码
async findAll() {
  return this.prisma.bugReport.findMany({
    where: { orgId: currentUser.organization.id }
  })
}

// 新代码 (自动应用 orgId 过滤)
async findAll() {
  return this.repository.findMany()
}
```

### 步骤 4: 删除手动的 orgId 过滤

```typescript
// 旧代码 - 需要手动添加 orgId
async create(data: CreateDto, currentUser: User) {
  return this.prisma.bugReport.create({
    data: {
      ...data,
      orgId: currentUser.organization.id, // ❌ 手动注入
    },
  })
}

// 新代码 - 自动注入 orgId
async create(data: CreateDto) {
  return this.repository.create(data) // ✅ 自动注入
}
```

## 🧪 测试

### 单元测试示例

```typescript
describe('BugReportsRepository', () => {
  let repository: BugReportsRepository
  let tenantContext: TenantContext

  beforeEach(() => {
    // 模拟租户上下文
    tenantContext = {
      getOrganizationId: jest.fn().mockReturnValue('org-123'),
      getUserId: jest.fn().mockReturnValue('user-456'),
      isBypassEnabled: jest.fn().mockReturnValue(false),
      verifyResourceOwnership: jest.fn(),
    } as any

    repository = new BugReportsRepository(prismaService, tenantContext)
  })

  it('should filter by orgId', async () => {
    await repository.findMany()

    expect(prismaService.bugReport.findMany).toHaveBeenCalledWith({
      where: { orgId: 'org-123' },
    })
  })
})
```

## ⚠️ 注意事项

### 1. 公开路由

对于公开路由（如登录、注册），使用 `@Public()` 装饰器：

```typescript
@Post('login')
@Public()
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto)
}
```

### 2. 不需要隔离的模型

如果某个模型不需要租户隔离（如系统配置），重写 `hasTenantField()` 方法：

```typescript
export class SystemConfigRepository extends TenantAwareRepository<...> {
  protected hasTenantField(): boolean {
    return false // 不应用租户过滤
  }
}
```

### 3. 超级管理员

对于超级管理员的特殊逻辑，在拦截器中实现 `checkIsSuperAdmin()` 方法。

### 4. 审计日志

所有绕过租户隔离的操作都会被记录，可以通过以下方式获取：

```typescript
const auditLogs = this.tenantContext.getAuditLogs()
```

## 🔍 调试

### 查看当前租户上下文

```typescript
const snapshot = this.tenantContext.snapshot()
console.log(snapshot)
// {
//   organizationId: 'org-123',
//   userId: 'user-456',
//   isSuperAdmin: false,
//   bypassEnabled: false,
//   auditLogCount: 0
// }
```

### 启用调试日志

在 `main.ts` 中设置日志级别：

```typescript
app.useLogger(['log', 'error', 'warn', 'debug'])
```

## 📊 性能考虑

1. **索引优化**: 确保 `orgId` 字段有索引
2. **查询优化**: Repository 继承不会增加额外的查询
3. **请求作用域**: 每个请求都会创建新的 `TenantContext` 实例，但开销很小

## 🔐 安全最佳实践

1. ✅ **永远不要信任客户端传入的 orgId**
2. ✅ **使用 Repository 基类，避免直接使用 Prisma**
3. ✅ **绕过租户隔离时必须添加审计日志**
4. ✅ **定期审查绕过租户隔离的代码**
5. ✅ **为敏感操作添加额外的权限检查**

## 📚 相关文件

- `types/tenant.types.ts` - 类型定义
- `services/tenant-context.service.ts` - 租户上下文服务
- `interceptors/tenant-context.interceptor.ts` - 自动注入拦截器
- `repositories/tenant-aware.repository.ts` - 仓库基类
- `examples/migration-example.ts` - 迁移示例代码

## 🆘 常见问题

### Q: 为什么查询结果为空？

A: 检查是否正确设置了租户上下文，确保 `TenantContextInterceptor` 在请求链中正确执行。

### Q: 如何在种子数据中使用？

A: 种子数据脚本中使用 `runWithoutTenantIsolation()` 临时绕过租户隔离。

### Q: 如何处理跨组织的关联查询？

A: 使用 `runWithoutTenantIsolation()` 或重写 Repository 的相关方法。

## 📈 下一步

1. [ ] 迁移现有模块到新方案
2. [ ] 添加集成测试
3. [ ] 实现审计日志持久化
4. [ ] 添加监控和告警
