import { consola } from 'consola'

import { BaseSeeder } from '../core/base-seeder'
import type { SeederOptions, SeederResult } from '../core/types'
import { SYSTEM_ROLE_SEEDS } from '../data/roles'

/**
 * 角色种子数据播种器
 *
 * 负责创建系统内置角色和权限关联
 */
export class RolesSeeder extends BaseSeeder {
  readonly name = 'RolesSeeder'
  readonly dependencies = ['PermissionsSeeder']

  /**
   * 执行角色播种
   */
  protected async doSeed(): Promise<SeederResult> {
    // 获取所有权限，建立slug到ID的映射
    const permissions = await this.prisma.permission.findMany({
      select: { id: true, slug: true },
    })

    if (permissions.length === 0) {
      return {
        success: false,
        message: '权限数据不存在，请先执行权限播种',
      }
    }

    const permissionMap = new Map(permissions.map((p) => [p.slug, p.id]))

    // 检查现有角色
    const existingRoles = await this.prisma.role.findMany({
      where: { system: true },
      select: { slug: true },
    })
    const existingSlugs = new Set(existingRoles.map((r) => r.slug))

    const rolesToCreate = SYSTEM_ROLE_SEEDS.filter(
      (role) => !existingSlugs.has(role.slug),
    )

    if (rolesToCreate.length === 0) {
      return {
        success: true,
        message: '所有系统角色已存在，跳过角色播种',
      }
    }

    let createdRoles = 0
    let assignedPermissions = 0

    // 创建角色和权限关联
    for (const roleData of rolesToCreate) {
      consola.info(`创建角色: ${roleData.name} (${roleData.slug})`)

      // 创建角色
      const role = await this.prisma.role.create({
        data: {
          name: roleData.name,
          slug: roleData.slug,
          description: roleData.description,
          system: roleData.system,
          isActive: roleData.isActive,
          orgId: null, // 系统角色不属于任何组织
        },
      })

      createdRoles++

      // 解析权限并创建关联
      const validPermissionIds: string[] = []

      for (const permissionSlug of roleData.permissions) {
        const permissionId = permissionMap.get(permissionSlug)

        if (permissionId) {
          validPermissionIds.push(permissionId)
        }
        else {
          consola.warn(`权限 ${permissionSlug} 不存在，跳过`)
        }
      }

      // 批量创建角色权限关联
      if (validPermissionIds.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: validPermissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
          skipDuplicates: true,
        })

        assignedPermissions += validPermissionIds.length
      }
    }

    // 为现有用户分配默认角色（默认启用）
    await this.assignDefaultRolesToUsers()

    // 获取统计信息
    const totalRoles = await this.prisma.role.count()
    const systemRoles = await this.prisma.role.count({ where: { system: true } })

    const message = `成功创建 ${createdRoles} 个系统角色，分配 ${assignedPermissions} 个权限。总计: ${totalRoles} 个角色，系统角色: ${systemRoles} 个`

    return {
      success: true,
      message,
    }
  }

  /**
   * 为现有用户分配默认角色
   */
  private async assignDefaultRolesToUsers(): Promise<void> {
    try {
      // 获取普通成员角色
      const memberRole = await this.prisma.role.findFirst({
        where: { slug: 'member', system: true },
      })

      if (!memberRole) {
        consola.warn('未找到普通成员角色，跳过用户角色分配')

        return
      }

      // 获取所有没有角色的用户
      const usersWithoutRoles = await this.prisma.user.findMany({
        where: {
          userRoles: {
            none: {},
          },
        },
        select: { id: true, orgId: true, email: true },
      })

      if (usersWithoutRoles.length > 0) {
        const userRoleData = usersWithoutRoles.map((user) => ({
          userId: user.id,
          roleId: memberRole.id,
          orgId: user.orgId,
        }))

        await this.prisma.userRole.createMany({
          data: userRoleData,
          skipDuplicates: true,
        })

        consola.success(`为 ${usersWithoutRoles.length} 个用户分配了普通成员角色`)
      }
    }
    catch (error) {
      consola.warn('用户角色分配失败:', error)
    }
  }

  /**
   * 清理角色数据
   */
  protected async doClean(options: SeederOptions = {}): Promise<SeederResult> {
    const preserveSystem = options.preserveAdmin !== false

    if (preserveSystem) {
      // 只删除非系统角色
      const deleteUserRoles = await this.prisma.userRole.deleteMany({
        where: {
          role: { system: false },
        },
      })

      const deleteRolePermissions = await this.prisma.rolePermission.deleteMany({
        where: {
          role: { system: false },
        },
      })

      const deleteRoles = await this.prisma.role.deleteMany({
        where: { system: false },
      })

      const message = `清理完成，删除了 ${deleteRoles.count} 个非系统角色，${deleteRolePermissions.count} 个权限关联，${deleteUserRoles.count} 个用户角色分配`

      return {
        success: true,
        message,
      }
    }
    else {
      // 删除所有角色（包括系统角色）
      await this.prisma.userRole.deleteMany()
      await this.prisma.rolePermission.deleteMany()
      const result = await this.prisma.role.deleteMany()

      const message = `清理完成，删除了 ${result.count} 个角色`

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
    const totalRoles = await this.prisma.role.count()
    const systemRoles = await this.prisma.role.count({ where: { system: true } })
    const customRoles = await this.prisma.role.count({ where: { system: false } })
    const activeRoles = await this.prisma.role.count({ where: { isActive: true } })
    const totalUserRoles = await this.prisma.userRole.count()
    const totalRolePermissions = await this.prisma.rolePermission.count()

    return {
      总角色数: totalRoles,
      系统角色: systemRoles,
      自定义角色: customRoles,
      启用角色: activeRoles,
      用户角色分配: totalUserRoles,
      角色权限关联: totalRolePermissions,
    }
  }

  /**
   * 验证角色数据
   */
  async validate(): Promise<boolean> {
    try {
      // 检查是否有基础角色
      const roleCount = await this.prisma.role.count()

      if (roleCount === 0) {
        return false
      }

      // 检查关键系统角色是否存在
      const criticalRoles = ['super_admin', 'org_owner', 'member']

      for (const roleSlug of criticalRoles) {
        const role = await this.prisma.role.findFirst({
          where: { slug: roleSlug, system: true },
          include: {
            rolePermissions: true,
          },
        })

        if (!role) {
          return false
        }

        // 检查超级管理员是否有管理员权限
        if (roleSlug === 'super_admin' && role.rolePermissions.length === 0) {
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
