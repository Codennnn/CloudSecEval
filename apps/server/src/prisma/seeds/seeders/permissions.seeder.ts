import { PERMISSIONS, SYSTEM_PERMISSIONS } from '@mono/constants'

import { BaseSeeder } from '../core/base-seeder'
import type { SeederOptions, SeederResult } from '../core/types'
import { PERMISSION_SEEDS } from '../data/permissions'

/**
 * 权限种子数据播种器
 *
 * 负责创建系统中所有的权限定义
 */
export class PermissionsSeeder extends BaseSeeder {
  readonly name = 'PermissionsSeeder'
  readonly dependencies: string[] = []

  /**
   * 执行权限播种
   */
  protected async doSeed(): Promise<SeederResult> {
    // 检查现有权限
    const existingPermissions = await this.prisma.permission.findMany({
      select: { slug: true },
    })
    const existingSlugs = new Set(existingPermissions.map((p) => p.slug))

    const permissionsToCreate = PERMISSION_SEEDS.filter(
      (permission) => !existingSlugs.has(`${permission.resource}:${permission.action}`),
    )

    if (permissionsToCreate.length === 0) {
      return {
        success: true,
        message: '所有权限已存在，跳过权限播种',
      }
    }

    // 批量创建权限
    const createData = permissionsToCreate.map((permission) => ({
      resource: permission.resource,
      action: permission.action,
      slug: `${permission.resource}:${permission.action}`,
      description: permission.description,
      system: true, // 所有种子权限都是系统权限
    }))

    await this.prisma.permission.createMany({
      data: createData,
      skipDuplicates: true,
    })

    // 获取统计信息
    const totalPermissions = await this.prisma.permission.count()
    const systemPermissions = await this.prisma.permission.count({
      where: { system: true },
    })

    const message = `成功创建 ${createData.length} 个权限。总计: ${totalPermissions} 个，系统权限: ${systemPermissions} 个`

    return {
      success: true,
      message,
    }
  }

  /**
   * 清理权限数据
   */
  protected async doClean(options: SeederOptions = {}): Promise<SeederResult> {
    const preserveSystem = options.preserveAdmin !== false

    if (preserveSystem) {
      // 只删除非系统权限
      const result = await this.prisma.permission.deleteMany({
        where: { system: false },
      })

      const message = `清理完成，删除了 ${result.count} 个非系统权限`

      return {
        success: true,
        message,
      }
    }
    else {
      // 删除所有权限（需要先删除关联的角色权限）
      await this.prisma.rolePermission.deleteMany()
      const result = await this.prisma.permission.deleteMany()

      const message = `清理完成，删除了 ${result.count} 个权限`

      return {
        success: true,
        message,
      }
    }
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<Record<string, number>> {
    const total = await this.prisma.permission.count()
    const system = await this.prisma.permission.count({ where: { system: true } })
    const custom = await this.prisma.permission.count({ where: { system: false } })

    // 按资源分组统计
    const groupedStats = await this.prisma.permission.groupBy({
      by: ['resource'],
      _count: true,
    })

    const stats: Record<string, number> = {
      总权限数: total,
      系统权限: system,
      自定义权限: custom,
    }

    // 添加资源分组统计
    groupedStats.forEach((group) => {
      stats[`${group.resource} 权限`] = group._count
    })

    return stats
  }

  /**
   * 验证权限数据
   */
  async validate(): Promise<boolean> {
    try {
      // 检查是否有基础权限
      const permissionCount = await this.prisma.permission.count()

      if (permissionCount === 0) {
        return false
      }

      // 检查关键权限是否存在
      const criticalPermissions = [
        SYSTEM_PERMISSIONS.SUPER_ADMIN,
        PERMISSIONS.users.read,
        PERMISSIONS.roles.read,
      ]

      for (const permissionSlug of criticalPermissions) {
        const permission = await this.prisma.permission.findUnique({
          where: { slug: permissionSlug },
        })

        if (!permission) {
          return false
        }
      }

      return true
    }
    catch {
      return false
    }
  }
}
