/**
 * 迁移示例代码
 *
 * ⚠️ 注意：此文件仅作为迁移示例参考，不会被实际编译或执行
 * 实际使用时需要根据您的 Prisma Schema 调整类型和导入
 */

/* eslint-disable */
// @ts-nocheck

import { Injectable } from '@nestjs/common'

import type { PrismaService } from '~/prisma/prisma.service'

import { TenantAwareRepository } from '../repositories/tenant-aware.repository'
import type { TenantContext } from '../services/tenant-context.service'

/**
 * ============================================================================
 * 示例 1: 基础 Repository 迁移
 * ============================================================================
 */

// ❌ 旧代码 - 手动管理 orgId
class OldBugReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.bugReport.findMany({
      where: { orgId }, // 手动添加 orgId 过滤
    })
  }

  async findById(id: string, orgId: string) {
    return this.prisma.bugReport.findFirst({
      where: { id, orgId }, // 手动添加 orgId 过滤
    })
  }

  async create(data: any, orgId: string) {
    return this.prisma.bugReport.create({
      data: {
        ...data,
        orgId, // 手动注入 orgId
      },
    })
  }
}

// ✅ 新代码 - 自动管理 orgId
@Injectable()
class NewBugReportsRepository extends TenantAwareRepository<
    any, // BugReport
    any, // Prisma.BugReportWhereUniqueInput
    any, // Prisma.BugReportWhereInput
    any, // Prisma.BugReportCreateInput
    any, // Prisma.BugReportUpdateInput
    any> {
  constructor(
    prisma: PrismaService,
    tenantContext: TenantContext,
  ) {
    super(prisma, prisma.bugReport, tenantContext, 'BugReport')
  }

  // 所有基础方法都已自动实现
  // 可以添加自定义方法
  async findByUserId(userId: string) {
    return this.findMany({
      where: { creatorId: userId },
    })
  }
}

/**
 * ============================================================================
 * 示例 2: Service 层迁移
 * ============================================================================
 */

interface User {
  id: string
  organization: {
    id: string
  }
}

// ❌ 旧代码 - 需要手动传递 orgId
class OldBugReportsService {
  constructor(private readonly repository: OldBugReportsRepository) {}

  async findAll(currentUser: User) {
    const orgId = currentUser.organization.id

    return this.repository.findAll(orgId)
  }

  async create(data: any, currentUser: User) {
    const orgId = currentUser.organization.id

    return this.repository.create(data, orgId)
  }
}

// ✅ 新代码 - 不需要传递 orgId
@Injectable()
class NewBugReportsService {
  constructor(private readonly repository: NewBugReportsRepository) {}

  async findAll() {
    // 自动过滤当前组织的数据
    return this.repository.findMany()
  }

  async create(data: any) {
    // 自动注入当前组织 ID
    return this.repository.create(data)
  }
}

/**
 * ============================================================================
 * 示例 3: Controller 层迁移
 * ============================================================================
 */

// ❌ 旧代码 - 需要手动传递 currentUser
class OldBugReportsController {
  constructor(private readonly service: OldBugReportsService) {}

  async findAll(currentUser: User) {
    return this.service.findAll(currentUser)
  }

  async create(data: any, currentUser: User) {
    return this.service.create(data, currentUser)
  }
}

// ✅ 新代码 - 不需要传递 currentUser
class NewBugReportsController {
  constructor(private readonly service: NewBugReportsService) {}

  async findAll() {
    // 租户上下文已自动注入
    return this.service.findAll()
  }

  async create(data: any) {
    return this.service.create(data)
  }
}

/**
 * ============================================================================
 * 示例 4: 跨组织访问
 * ============================================================================
 */

@Injectable()
class AdminBugReportsService {
  constructor(
    private readonly repository: NewBugReportsRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  /**
   * 管理员功能：获取所有组织的报告
   */
  async getAllReportsAcrossOrganizations() {
    return this.tenantContext.runWithoutTenantIsolation(
      {
        action: 'ADMIN_GET_ALL_REPORTS',
        reason: '管理员查询所有组织的漏洞报告',
        isSystemOperation: false,
      },
      async () => {
        return this.repository.findMany()
      },
    )
  }
}

/**
 * ============================================================================
 * 示例 5: 批量操作
 * ============================================================================
 */

class BatchOperationsExample {
  constructor(private readonly repository: NewBugReportsRepository) {}

  /**
   * 批量创建报告
   */
  async batchCreate(dataList: any[]) {
    // 自动注入 orgId 并记录审计日志
    return this.repository.createMany(dataList)
  }

  /**
   * 批量更新
   */
  async batchUpdateStatus(ids: string[], newStatus: string) {
    // 先验证所有报告都属于当前组织
    const reports = await this.repository.findMany({
      where: { id: { in: ids } },
    })

    if (reports.length !== ids.length) {
      throw new Error('Some reports not found or not accessible')
    }

    // 批量更新
    return Promise.all(
      ids.map((id) =>
        this.repository.update(id, { status: newStatus }),
      ),
    )
  }
}

/**
 * ============================================================================
 * 示例 6: 自定义 Repository 方法
 * ============================================================================
 */

@Injectable()
class ExtendedBugReportsRepository extends TenantAwareRepository<
    any, any, any, any, any, any
  > {
  constructor(
    prisma: PrismaService,
    tenantContext: TenantContext,
  ) {
    super(prisma, prisma.bugReport, tenantContext, 'BugReport')
  }

  /**
   * 查找即将过期的报告
   */
  async findExpiringSoon(days = 7) {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)

    return this.findMany({
      where: {
        dueDate: { lte: expiryDate, gte: new Date() },
        status: { not: 'CLOSED' },
      },
    })
  }

  /**
   * 软删除
   */
  async softDelete(id: string) {
    return this.update(id, { deletedAt: new Date() })
  }
}

/**
 * ============================================================================
 * 示例 7: 不需要租户隔离的模型
 * ============================================================================
 */

@Injectable()
class SystemConfigRepository extends TenantAwareRepository<
    any, any, any, any, any, any
  > {
  constructor(
    prisma: PrismaService,
    tenantContext: TenantContext,
  ) {
    // 注意：systemConfig 需要在您的 Prisma Schema 中定义
    super(prisma, (prisma as any).systemConfig, tenantContext, 'SystemConfig')
  }

  /**
   * 重写此方法表示该模型不需要租户隔离
   */
  protected hasTenantField(): boolean {
    return false
  }
}

/**
 * ============================================================================
 * 迁移步骤总结
 * ============================================================================
 *
 * 1. 创建新的 Repository，继承 TenantAwareRepository
 * 2. 注入 TenantContext 到构造函数
 * 3. 移除 Service 中所有手动的 orgId 处理
 * 4. 移除 Controller 中的 currentUser 参数传递
 * 5. 对于需要跨组织访问的场景，使用 runWithoutTenantIsolation
 * 6. 添加单元测试验证租户隔离功能
 *
 * ============================================================================
 */

export {
  AdminBugReportsService,
  BatchOperationsExample,
  ExtendedBugReportsRepository,
  NewBugReportsController,
  NewBugReportsRepository,
  NewBugReportsService,
  OldBugReportsController,
  OldBugReportsRepository,
  OldBugReportsService,
  SystemConfigRepository,
}
