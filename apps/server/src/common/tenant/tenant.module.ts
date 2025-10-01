import { Global, Module } from '@nestjs/common'

import { TenantContextInterceptor } from './interceptors/tenant-context.interceptor'
import { TenantContext } from './services/tenant-context.service'

/**
 * 租户模块
 *
 * 提供多租户数据隔离的核心功能：
 * 1. TenantContext - 租户上下文服务（请求作用域）
 * 2. TenantContextInterceptor - 自动注入租户上下文的拦截器
 * 3. TenantAwareRepository - 租户感知的仓库基类
 * 4. 相关装饰器
 *
 * 使用 @Global() 装饰器，使得租户服务在整个应用中可用
 * 无需在每个模块中重复导入
 */
@Global()
@Module({
  providers: [
    TenantContext,
    TenantContextInterceptor,
  ],
  exports: [
    TenantContext,
    TenantContextInterceptor,
  ],
})
export class TenantModule {}
