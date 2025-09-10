import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcrypt'
import { consola } from 'consola'

import type { Prisma, User } from '#prisma/client'

import { BaseFactory } from '../core/base-factory'

/**
 * 用户数据工厂 - 生成高质量的测试用户数据
 * 特点：
 * - 确保邮箱唯一性
 * - 提供多种预设用户类型
 * - 支持批量生成和增量添加
 * - 完整的错误处理和数据验证
 */
export class UserFactory extends BaseFactory<User> {
  /**
   * 生成单个用户数据
   */
  protected async generateSingle(overrides: Partial<User> = {}): Promise<User> {
    // 确保数据库连接正常
    await this.checkDatabaseConnection()

    // 生成唯一邮箱
    const email = overrides.email ?? await this.generateUniqueEmail()

    // 生成安全的密码哈希
    const password = overrides.passwordHash ?? await this.generatePasswordHash('Test@123')

    // 获取组织ID（如果未提供）
    const orgId = overrides.orgId ?? await this.getDefaultOrganizationId()

    // 构建用户数据
    const userData = {
      email,
      passwordHash: password,
      name: overrides.name ?? this.generateRealisticName(),
      phone: overrides.phone ?? this.generatePhone(),
      avatarUrl: overrides.avatarUrl ?? this.generateAvatarUrl(),
      isActive: overrides.isActive ?? true,
      orgId,
      departmentId: overrides.departmentId ?? null,
    }

    // 使用事务创建用户
    return await this.withTransaction(async (tx: Prisma.TransactionClient) => {
      return await tx.user.create({
        data: userData,
      })
    })
  }

  /**
   * 验证用户数据完整性
   */
  protected async validateData(user: User): Promise<boolean> {
    try {
      // 检查必需字段
      if (!user.id || !user.email || !user.passwordHash) {
        consola.error('用户缺少必需字段', { userId: user.id, email: user.email })

        return false
      }

      // 检查邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailRegex.test(user.email)) {
        consola.error('用户邮箱格式无效', { email: user.email })

        return false
      }

      // 检查密码哈希是否有效（bcrypt格式）
      if (!user.passwordHash.startsWith('$2b$') && !user.passwordHash.startsWith('$2a$')) {
        consola.error('用户密码哈希格式无效', { userId: user.id })

        return false
      }

      // 验证数据库中的唯一性
      const existingUser = await this.prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      })

      if (existingUser && existingUser.id !== user.id) {
        consola.error('用户邮箱重复', { email: user.email })

        return false
      }

      return true
    }
    catch (error) {
      consola.error('用户数据验证失败', error)

      return false
    }
  }

  /**
   * 创建预设用户类型
   */
  async createPresetUsers(): Promise<User[]> {
    consola.info('创建预设测试用户...')

    const presetConfigs = [
      {
        email: 'test.active@example.com',
        name: '活跃测试用户',
        isActive: true,
        phone: '13800138001',
      },
      {
        email: 'test.inactive@example.com',
        name: '非活跃测试用户',
        isActive: false,
        phone: '13800138002',
      },
      {
        email: 'test.nophone@example.com',
        name: '无手机号用户',
        isActive: true,
        phone: null,
      },
      {
        email: 'test.noname@example.com',
        name: null,
        isActive: true,
        phone: '13800138004',
      },
      {
        email: 'test.complete@example.com',
        name: '完整信息用户',
        isActive: true,
        phone: '13800138005',
      },
    ]

    const users: User[] = []

    for (const config of presetConfigs) {
      try {
        // 检查是否已存在
        const existingUser = await this.prisma.user.findUnique({
          where: { email: config.email },
        })

        if (existingUser) {
          consola.warn(`预设用户 ${config.email} 已存在，跳过创建`)
          users.push(existingUser)
          continue
        }

        // 创建新用户
        const user = await this.generateSingle(config)
        users.push(user)
        consola.debug(`创建预设用户: ${config.email}`)
      }
      catch (error) {
        consola.error(`创建预设用户 ${config.email} 失败:`, error)
      }
    }

    consola.success(`预设用户创建完成，成功: ${users.length}/${presetConfigs.length}`)

    return users
  }

  /**
   * 增量创建用户（检查现有数量，只创建需要的数量）
   */
  async ensureMinimumUsers(minimumCount: number): Promise<User[]> {
    const currentCount = await this.prisma.user.count()
    const needed = Math.max(0, minimumCount - currentCount)

    if (needed === 0) {
      consola.info(`当前已有 ${currentCount} 个用户，无需创建更多`)

      return []
    }

    consola.info(`当前 ${currentCount} 个用户，需要创建 ${needed} 个用户达到最小数量 ${minimumCount}`)

    return await this.createBatch(needed)
  }

  /**
   * 生成唯一邮箱
   */
  private async generateUniqueEmail(): Promise<string> {
    return await this.generateUniqueValue(
      () => faker.internet.email(),
      async (email) => {
        const existing = await this.prisma.user.findUnique({
          where: { email },
          select: { id: true },
        })

        return !!existing
      },
    )
  }

  /**
   * 生成密码哈希
   */
  private async generatePasswordHash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`密码哈希生成失败：${errorMessage}`)
    }
  }

  /**
   * 获取默认组织ID
   */
  private async getDefaultOrganizationId(): Promise<string> {
    const organization = await this.prisma.organization.findFirst({
      where: { isActive: true },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    })

    if (!organization) {
      throw new Error('没有找到可用的组织，请先创建组织数据')
    }

    return organization.id
  }

  /**
   * 生成真实的中文姓名
   */
  private generateRealisticName(): string | null {
    // 30% 概率返回 null（模拟未填写姓名的用户）
    if (Math.random() < 0.3) {
      return null
    }

    // 70% 概率生成中文姓名，30% 概率生成英文姓名
    if (Math.random() < 0.7) {
      const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '朱', '马', '胡', '郭', '林', '何', '高', '梁']
      const givenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平']

      const surname = surnames[Math.floor(Math.random() * surnames.length)]
      const givenName = givenNames[Math.floor(Math.random() * givenNames.length)]

      return `${surname}${givenName}`
    }
    else {
      return faker.person.fullName()
    }
  }

  /**
   * 生成手机号
   */
  private generatePhone(): string | null {
    // 40% 概率没有手机号
    if (Math.random() < 0.4) {
      return null
    }

    // 生成中国手机号格式
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = faker.string.numeric(8)

    return `${prefix}${suffix}`
  }

  /**
   * 生成头像URL
   */
  private generateAvatarUrl(): string | null {
    // 50% 概率没有头像
    if (Math.random() < 0.5) {
      return null
    }

    // 使用 DiceBear API 生成头像
    const styles = ['avataaars', 'big-smile', 'bottts', 'identicon', 'initials', 'personas']
    const style = styles[Math.floor(Math.random() * styles.length)]
    const seed = faker.string.alphanumeric(10)

    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`
  }

  /**
   * 获取用户统计信息
   */
  async getStats(): Promise<{
    total: number
    active: number
    inactive: number
    withPhone: number
    withAvatar: number
    withName: number
  }> {
    const [
      total,
      active,
      withPhone,
      withAvatar,
      withName,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { phone: { not: null } } }),
      this.prisma.user.count({ where: { avatarUrl: { not: null } } }),
      this.prisma.user.count({ where: { name: { not: null } } }),
    ])

    return {
      total,
      active,
      inactive: total - active,
      withPhone,
      withAvatar,
      withName,
    }
  }

  /**
   * 清理测试用户（保留管理员）
   */
  async cleanupTestUsers(): Promise<number> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'

    const result = await this.prisma.user.deleteMany({
      where: {
        email: { not: adminEmail },
      },
    })

    consola.info(`清理了 ${result.count} 个测试用户（保留管理员 ${adminEmail}）`)

    return result.count
  }
}
