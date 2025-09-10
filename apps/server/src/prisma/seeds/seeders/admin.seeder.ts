import * as bcrypt from 'bcrypt'

import { BaseSeeder } from '../core/base-seeder'
import type { SeederResult } from '../core/types'

/**
 * 管理员账号种子脚本
 * 职责：创建系统初始管理员账号
 */
export class AdminSeeder extends BaseSeeder {
  readonly name = 'AdminSeeder'
  readonly dependencies: string[] = []

  protected async doSeed(): Promise<SeederResult> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123'
    const adminName = process.env.ADMIN_NAME ?? '系统管理员'

    try {
      // 检查管理员是否已存在
      const existingAdmin = await this.prisma.user.findUnique({
        where: { email: adminEmail },
      })

      if (existingAdmin) {
        this.log(`管理员账号已存在: ${adminEmail}`, 'warn')

        return {
          success: true,
          message: '管理员账号已存在',
          data: {
            created: 0,
            existing: 1,
          },
        }
      }

      // 创建管理员账号
      const passwordHash = await bcrypt.hash(adminPassword, 10)

      // 由于 User.orgId 为必填外键，需在创建时关联组织。
      // 这里使用 connectOrCreate 保证存在一个 ADMIN_ORG 组织；
      // 如果已存在则连接，否则创建后再连接，避免违反非空约束。
      const adminUser = await this.prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          name: adminName,
          isActive: true,
          organization: {
            connectOrCreate: {
              where: { code: 'ADMIN_ORG' },
              create: {
                name: '系统管理组织',
                code: 'ADMIN_ORG',
                remark: '系统管理员专用组织',
                isActive: true,
              },
            },
          },
        },
        select: {
          id: true,
          orgId: true,
          email: true,
        },
      })

      // 为管理员分配系统角色 super_admin（包含 admin:* 权限）
      // 若未先播种 Permissions/ Roles，记录警告并跳过，不阻断执行
      const superAdminRole = await this.prisma.role.findFirst({
        where: { slug: 'super_admin', system: true },
        select: { id: true },
      })

      if (superAdminRole && adminUser.orgId) {
        await this.prisma.userRole.create({
          data: {
            userId: adminUser.id,
            roleId: superAdminRole.id,
            orgId: adminUser.orgId,
          },
        })

        this.log('已为管理员分配角色: super_admin', 'success')
      }
      else {
        this.log('未找到系统角色 super_admin 或管理员 orgId 缺失，已跳过角色分配。请先执行 PermissionsSeeder/RolesSeeder', 'warn')
      }

      this.log(`管理员账号创建成功: ${adminEmail}`, 'success')

      return {
        success: true,
        message: '管理员账号创建成功',
        data: {
          created: 1,
          existing: 0,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`创建管理员账号失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '创建管理员账号失败',
        error: errorMessage,
      }
    }
  }

  protected async doClean(): Promise<SeederResult> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'

    try {
      const result = await this.prisma.user.deleteMany({
        where: { email: adminEmail },
      })

      this.log(`删除了 ${result.count} 个管理员账号`, 'info')

      return {
        success: true,
        message: '管理员账号清理完成',
        data: {
          created: 0,
          existing: result.count,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`清理管理员账号失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '清理管理员账号失败',
        error: errorMessage,
      }
    }
  }

  async getStats(): Promise<Record<string, number>> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'

    const adminCount = await this.prisma.user.count({
      where: { email: adminEmail },
    })

    return {
      adminUsers: adminCount,
    }
  }

  /**
   * 获取管理员信息
   */
  async getAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'

    return await this.prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        organization: true,
        department: true,
      },
    })
  }

  /**
   * 更新管理员的组织关系
   */
  async updateAdminOrganization(orgId: string): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'

    await this.prisma.user.update({
      where: { email: adminEmail },
      data: { orgId },
    })

    this.log(`更新管理员组织关系: ${orgId}`, 'info')
  }
}
