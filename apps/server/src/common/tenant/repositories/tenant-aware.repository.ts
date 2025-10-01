import { BUSINESS_CODES } from '@mono/constants'
import { Injectable, Logger } from '@nestjs/common'

import { BusinessException } from '~/common/exceptions/business.exception'
import type { PrismaService } from '~/prisma/prisma.service'

import { TenantContext } from '../services/tenant-context.service'
import type {
  TenantCreateOptions,
  TenantDeleteOptions,
  TenantQueryOptions,
  TenantUpdateOptions,
} from '../types/tenant.types'

/**
 * Prisma 委托类型约束
 *
 * 用于约束所有 Prisma 生成的模型委托必须包含这些基础方法
 *
 * @template TModel - 模型类型
 * @template TWhereUniqueInput - 唯一查询条件
 * @template TWhereInput - 普通查询条件
 * @template TCreateInput - 创建数据类型
 * @template TUpdateInput - 更新数据类型
 * @template TInclude - 关联查询类型
 */
interface PrismaDelegate<
  TModel,
  TWhereUniqueInput,
  TWhereInput,
  TCreateInput,
  TUpdateInput,
  TInclude,
> {
  findUnique(args: {
    where: TWhereUniqueInput
    include?: TInclude
  }): Promise<TModel | null>

  findFirst(args: {
    where: TWhereInput
    include?: TInclude
  }): Promise<TModel | null>

  findMany(args: {
    where?: TWhereInput
    include?: TInclude
    orderBy?: unknown
    skip?: number
    take?: number
  }): Promise<TModel[]>

  create(args: {
    data: TCreateInput
    include?: TInclude
  }): Promise<TModel>

  update(args: {
    where: TWhereUniqueInput
    data: TUpdateInput
    include?: TInclude
  }): Promise<TModel>

  delete(args: {
    where: TWhereUniqueInput
  }): Promise<TModel>

  count(args: {
    where?: TWhereInput
  }): Promise<number>
}

/**
 * 租户感知的 Repository 抽象基类
 *
 * 泛型参数说明：
 * - TModel: Prisma 模型类型（如 BugReport）
 * - TWhereUniqueInput: 唯一查询条件类型（如 BugReportWhereUniqueInput）
 * - TWhereInput: 普通查询条件类型（如 BugReportWhereInput）
 * - TCreateInput: 创建数据类型（如 BugReportCreateInput）
 * - TUpdateInput: 更新数据类型（如 BugReportUpdateInput）
 * - TInclude: 关联查询类型（如 BugReportInclude）
 *
 * 核心功能：
 * 1. 自动在所有查询中注入组织 ID 过滤条件
 * 2. 自动在创建操作中注入组织 ID
 * 3. 自动验证更新/删除操作的资源归属
 * 4. 支持临时绕过租户隔离（用于系统级操作）
 *
 * 使用示例：
 * ```typescript
 * @Injectable()
 * export class BugReportsRepository extends TenantAwareRepository<
 *   BugReport,
 *   Prisma.BugReportWhereUniqueInput,
 *   Prisma.BugReportWhereInput,
 *   Prisma.BugReportCreateInput,
 *   Prisma.BugReportUpdateInput,
 *   Prisma.BugReportInclude
 * > {
 *   constructor(prisma: PrismaService, tenantContext: TenantContext) {
 *     super(prisma, prisma.bugReport, tenantContext, 'BugReport')
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class TenantAwareRepository<
  TModel,
  TWhereUniqueInput,
  TWhereInput,
  TCreateInput,
  TUpdateInput,
  TInclude,
> {
  protected readonly logger: Logger

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly delegate: PrismaDelegate<
      TModel,
      TWhereUniqueInput,
      TWhereInput,
      TCreateInput,
      TUpdateInput,
      TInclude
    >,
    protected readonly tenantContext: TenantContext,
    protected readonly modelName: string,
  ) {
    this.logger = new Logger(`${modelName}Repository`)
  }

  /**
   * 应用租户过滤条件
   *
   * 核心方法：在所有查询中自动注入 orgId 过滤条件
   *
   * @param where 原始查询条件
   * @returns 添加了租户过滤的查询条件
   */
  protected applyTenantFilter(where?: TWhereInput): TWhereInput {
    // 如果启用了绕过，则不添加租户过滤
    if (this.tenantContext.isBypassEnabled()) {
      return (where ?? {}) as TWhereInput
    }

    // 如果模型不支持租户隔离，直接返回原始条件
    if (!this.hasTenantField()) {
      return (where ?? {}) as TWhereInput
    }

    const orgId = this.tenantContext.getOrganizationId()

    // 合并租户过滤条件
    return {
      ...where,
      orgId,
    } as TWhereInput
  }

  /**
   * 检查模型是否有 orgId 字段
   *
   * 子类可以重写此方法来指定是否需要租户隔离
   * 默认返回 true，表示所有模型都需要租户隔离
   */
  protected hasTenantField(): boolean {
    return true
  }

  /**
   * 验证资源归属
   *
   * @param resource 资源对象
   * @throws {BusinessException} 如果资源不属于当前租户
   */
  protected verifyTenantOwnership(resource: TModel): void {
    // 如果启用了绕过，则跳过验证
    if (this.tenantContext.isBypassEnabled()) {
      return
    }

    // 如果模型不支持租户隔离，跳过验证
    if (!this.hasTenantField()) {
      return
    }

    const resourceOrgId = (resource as { orgId?: string }).orgId

    if (!resourceOrgId) {
      this.logger.warn(`${this.modelName} 资源缺少 orgId 字段`)

      return
    }

    this.tenantContext.verifyResourceOwnership(resourceOrgId, this.modelName)
  }

  /**
   * 根据 ID 查找资源
   *
   * @param id 资源 ID
   * @param options 查询选项
   * @returns 资源实例或 null
   */
  async findById(
    id: string,
    options?: TenantQueryOptions,
  ): Promise<TModel | null> {
    const where = this.applyTenantFilter({ id } as unknown as TWhereInput)

    const result = await this.delegate.findFirst({
      where,
      include: options?.include as TInclude,
    })

    // 如果找到了资源，验证归属
    if (result) {
      this.verifyTenantOwnership(result)
    }

    return result
  }

  /**
   * 根据 ID 查找资源（必须存在）
   *
   * @param id 资源 ID
   * @param options 查询选项
   * @returns 资源实例
   * @throws {BusinessException} 如果资源不存在
   */
  async findByIdOrThrow(
    id: string,
    options?: TenantQueryOptions,
  ): Promise<TModel> {
    const result = await this.findById(id, options)

    if (!result) {
      throw new BusinessException(
        BUSINESS_CODES.RESOURCE_NOT_FOUND,
        `${this.modelName} 不存在或无权访问`,
      )
    }

    return result
  }

  /**
   * 查找第一个匹配的资源
   *
   * @param where 查询条件
   * @param options 查询选项
   * @returns 资源实例或 null
   */
  async findFirst(
    where: TWhereInput,
    options?: TenantQueryOptions,
  ): Promise<TModel | null> {
    const filteredWhere = this.applyTenantFilter(where)

    const result = await this.delegate.findFirst({
      where: filteredWhere,
      include: options?.include as TInclude,
    })

    if (result) {
      this.verifyTenantOwnership(result)
    }

    return result
  }

  /**
   * 查找多个资源
   *
   * @param options 查询选项
   * @returns 资源列表
   */
  async findMany(
    options?: {
      where?: TWhereInput
    } & TenantQueryOptions,
  ): Promise<TModel[]> {
    const where = this.applyTenantFilter(options?.where)

    const results = await this.delegate.findMany({
      where,
      include: options?.include as TInclude,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
    })

    return results
  }

  /**
   * 统计资源数量
   *
   * @param where 查询条件
   * @returns 资源数量
   */
  async count(where?: TWhereInput): Promise<number> {
    const filteredWhere = this.applyTenantFilter(where)

    return this.delegate.count({ where: filteredWhere })
  }

  /**
   * 创建资源
   *
   * 自动注入组织 ID
   *
   * @param data 创建数据
   * @param options 创建选项
   * @returns 创建的资源实例
   */
  async create(
    data: TCreateInput,
    options?: TenantCreateOptions,
  ): Promise<TModel> {
    const shouldInjectOrgId = options?.autoInjectOrgId ?? true

    // 构造创建数据
    const createData = this.buildCreateData(data, shouldInjectOrgId)

    const result = await this.delegate.create({
      data: createData as TCreateInput,
      include: options?.include as TInclude,
    })

    this.logger.debug(
      `创建${this.modelName}成功: id=${(result as { id?: string }).id}, orgId=${(result as { orgId?: string }).orgId}`,
    )

    return result
  }

  /**
   * 更新资源
   *
   * 自动验证资源归属
   *
   * @param id 资源 ID
   * @param data 更新数据
   * @param options 更新选项
   * @returns 更新后的资源实例
   */
  async update(
    id: string,
    data: TUpdateInput,
    options?: TenantUpdateOptions,
  ): Promise<TModel> {
    const shouldVerify = options?.verifyOwnership ?? true

    // 验证资源归属
    if (shouldVerify) {
      await this.findByIdOrThrow(id)
    }

    // 执行更新
    const result = await this.delegate.update({
      where: { id } as TWhereUniqueInput,
      data,
      include: options?.include as TInclude,
    })

    this.logger.debug(
      `更新${this.modelName}成功: id=${id}`,
    )

    return result
  }

  /**
   * 删除资源
   *
   * 自动验证资源归属
   *
   * @param id 资源 ID
   * @param options 删除选项
   * @returns 删除的资源实例
   */
  async delete(
    id: string,
    options?: TenantDeleteOptions,
  ): Promise<TModel> {
    const shouldVerify = options?.verifyOwnership ?? true

    // 验证资源归属
    if (shouldVerify) {
      await this.findByIdOrThrow(id)
    }

    const result = await this.delegate.delete({
      where: { id } as TWhereUniqueInput,
    })

    this.logger.debug(
      `删除${this.modelName}成功: id=${id}`,
    )

    return result
  }

  /**
   * 批量创建资源（需要绕过租户隔离）
   *
   * @param dataList 创建数据列表
   * @returns 创建的资源数量
   */
  async createMany(dataList: TCreateInput[]): Promise<number> {
    return this.tenantContext.runWithoutTenantIsolation(
      {
        action: 'BATCH_CREATE',
        reason: `批量创建${this.modelName}`,
        isSystemOperation: true,
      },
      async () => {
        // 为每条数据注入组织 ID
        const dataWithOrgId = dataList.map((data) =>
          this.buildCreateData(data, true),
        )

        // 批量创建 - 使用 Promise.all 而不是 $transaction
        const results = await Promise.all(
          dataWithOrgId.map((data) =>
            this.delegate.create({ data: data as TCreateInput }),
          ),
        )

        return results.length
      },
    )
  }

  /**
   * 构造创建数据（注入组织 ID）
   *
   * @returns 注入了组织 ID 的数据对象
   */
  private buildCreateData(
    data: TCreateInput,
    shouldInjectOrgId: boolean,
  ): TCreateInput & { orgId?: string } {
    if (!shouldInjectOrgId || !this.hasTenantField()) {
      return data as TCreateInput & { orgId?: string }
    }

    const orgId = this.tenantContext.getOrganizationId()

    // 如果数据中已经包含 organization 连接，则不重复注入
    if ('organization' in (data as object)) {
      return data as TCreateInput & { orgId?: string }
    }

    // 注入 orgId
    return {
      ...data,
      orgId,
    } as TCreateInput & { orgId?: string }
  }
}
