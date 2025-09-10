import type { PrismaClient } from '#prisma/client'

import { BaseSeeder } from '../core/base-seeder'
import type { SeederOptions, SeederResult } from '../core/types'
import { UserFactory } from '../factories/user.factory'

/**
 * 用户种子脚本
 * 职责：创建测试用户数据
 */
export class UserSeeder extends BaseSeeder {
  readonly name = 'UserSeeder'
  readonly dependencies: string[] = ['OrganizationSeeder']

  private userFactory: UserFactory

  constructor(prisma: PrismaClient) {
    super(prisma)
    this.userFactory = new UserFactory(prisma)
  }

  protected async doSeed(options: SeederOptions = {}): Promise<SeederResult> {
    try {
      const count = typeof options.count === 'number' ? options.count : 20
      const includePresets = options.includePresets !== false

      let created = 0
      let existing = 0

      // 1. 创建预设用户
      if (includePresets) {
        const presetUsers = await this.userFactory.createPresetUsers()
        existing += presetUsers.length
        this.log(`创建预设用户: ${presetUsers.length} 个`, 'info')
      }

      // 2. 创建随机用户
      if (count > 0) {
        const randomUsers = await this.userFactory.createBatch(count)
        created += randomUsers.length
        this.log(`创建随机用户: ${randomUsers.length} 个`, 'info')
      }

      // 3. 为用户分配组织和部门
      await this.assignUsersToOrganizations()

      this.log(`用户数据创建完成: 创建 ${created} 个，已存在 ${existing} 个`, 'success')

      return {
        success: true,
        message: '用户数据创建完成',
        data: {
          created,
          existing,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`创建用户数据失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '创建用户数据失败',
        error: errorMessage,
      }
    }
  }

  protected async doClean(options: SeederOptions = {}): Promise<SeederResult> {
    try {
      const preserveAdmin = options.preserveAdmin !== false
      const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'

      let result

      if (preserveAdmin) {
        result = await this.prisma.user.deleteMany({
          where: {
            email: { not: adminEmail },
          },
        })
      }
      else {
        result = await this.prisma.user.deleteMany({})
      }

      this.log(`删除了 ${result.count} 个用户`, 'info')

      return {
        success: true,
        message: '用户数据清理完成',
        data: {
          created: 0,
          existing: result.count,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`清理用户数据失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '清理用户数据失败',
        error: errorMessage,
      }
    }
  }

  async getStats(): Promise<Record<string, number>> {
    return await this.userFactory.getStats()
  }

  /**
   * 为用户分配组织和部门
   */
  private async assignUsersToOrganizations(): Promise<void> {
    // 获取所有需要分配的用户（排除管理员）
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'
    const users = await this.prisma.user.findMany({
      where: {
        email: { not: adminEmail },
        orgId: undefined, // 只处理未分配组织的用户
      },
      select: { id: true, name: true, email: true },
    })

    if (users.length === 0) {
      this.log('没有需要分配组织的用户', 'info')

      return
    }

    // 获取所有组织（排除管理员组织）
    const organizations = await this.prisma.organization.findMany({
      where: { code: { not: 'ADMIN_ORG' } },
      select: { id: true, name: true },
    })

    if (organizations.length === 0) {
      this.log('没有可分配的组织', 'warn')

      return
    }

    // 获取所有部门
    const departments = await this.prisma.department.findMany({
      select: { id: true, name: true, orgId: true },
    })

    // 按组织分组部门
    const deptsByOrg = departments.reduce<Record<string, typeof departments>>((acc, dept) => {
      acc[dept.orgId] = acc[dept.orgId] ?? []
      acc[dept.orgId].push(dept)

      return acc
    }, {})

    let assigned = 0

    for (const user of users) {
      // 随机选择组织
      const randomOrg = organizations[Math.floor(Math.random() * organizations.length)]
      const orgDepts = deptsByOrg[randomOrg.id] ?? []

      // 80%的概率分配部门，20%的概率不分配部门
      const shouldAssignDept = Math.random() < 0.8
      let departmentId: string | null = null

      if (shouldAssignDept && orgDepts.length > 0) {
        const randomDept = orgDepts[Math.floor(Math.random() * orgDepts.length)]
        departmentId = randomDept.id
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          orgId: randomOrg.id,
          departmentId,
        },
      })

      assigned++
    }

    this.log(`为 ${assigned} 个用户分配了组织和部门`, 'success')
  }
}
