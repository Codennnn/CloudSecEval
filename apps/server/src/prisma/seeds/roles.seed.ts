import { consola } from 'consola'

import { PrismaClient } from '#prisma/client'

import { SYSTEM_ROLE_SEEDS } from './data/roles'

/**
 * 角色种子数据播种
 *
 * 创建系统内置角色和权限关联
 */
export async function seedRoles(prisma: PrismaClient): Promise<void> {
  consola.info('开始播种角色数据...')

  try {
    // 获取所有权限，建立slug到ID的映射
    const permissions = await prisma.permission.findMany({
      select: { id: true, slug: true },
    })

    const permissionMap = new Map(permissions.map((p) => [p.slug, p.id]))

    // 检查现有角色
    const existingRoles = await prisma.role.findMany({
      where: { system: true },
      select: { slug: true },
    })
    const existingSlugs = new Set(existingRoles.map((r) => r.slug))

    const rolesToCreate = SYSTEM_ROLE_SEEDS.filter(
      (role) => !existingSlugs.has(role.slug),
    )

    if (rolesToCreate.length === 0) {
      consola.success('所有系统角色已存在，跳过角色播种')

      return
    }

    // 创建角色和权限关联
    for (const roleData of rolesToCreate) {
      consola.info(`创建角色: ${roleData.name} (${roleData.slug})`)

      // 创建角色
      const role = await prisma.role.create({
        data: {
          name: roleData.name,
          slug: roleData.slug,
          description: roleData.description,
          system: roleData.system,
          isActive: roleData.isActive,
          orgId: null, // 系统角色不属于任何组织
        },
      })

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
        await prisma.rolePermission.createMany({
          data: validPermissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
          skipDuplicates: true,
        })

        consola.success(`角色 ${roleData.name} 已分配 ${validPermissionIds.length} 个权限`)
      }
    }

    consola.success(`成功创建 ${rolesToCreate.length} 个系统角色`)

    // 显示角色统计
    const totalRoles = await prisma.role.count()
    const systemRoles = await prisma.role.count({
      where: { system: true },
    })

    consola.info(`角色统计: 总计 ${totalRoles} 个，系统角色 ${systemRoles} 个`)
  }
  catch (error) {
    consola.error('角色播种失败:', error)
    throw error
  }
}

/**
 * 为现有组织创建默认角色分配
 * TODO: 后续可以实现为现有组织分配默认角色的功能
 */
export async function assignDefaultRolesToExistingUsers(prisma: PrismaClient): Promise<void> {
  consola.info('开始为现有用户分配默认角色...')

  try {
    // 获取超级管理员角色
    const superAdminRole = await prisma.role.findFirst({
      where: { slug: 'super_admin', system: true },
    })

    if (!superAdminRole) {
      consola.warn('未找到超级管理员角色，跳过角色分配')

      return
    }

    // 获取普通成员角色
    const memberRole = await prisma.role.findFirst({
      where: { slug: 'member', system: true },
    })

    if (!memberRole) {
      consola.warn('未找到普通成员角色，跳过角色分配')

      return
    }

    // TODO: 这里可以根据实际需求为现有用户分配角色
    // 例如：根据邮箱判断是否为管理员，或者给所有用户分配普通成员角色

    // 示例：为所有没有角色的用户分配普通成员角色
    const usersWithoutRoles = await prisma.user.findMany({
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

      await prisma.userRole.createMany({
        data: userRoleData,
        skipDuplicates: true,
      })

      consola.success(`为 ${usersWithoutRoles.length} 个用户分配了普通成员角色`)
    }
  }
  catch (error) {
    consola.error('角色分配失败:', error)
    throw error
  }
}

/**
 * 单独运行角色种子脚本
 */
if (require.main === module) {
  const prisma = new PrismaClient()

  async function main() {
    await seedRoles(prisma)
    await assignDefaultRolesToExistingUsers(prisma)
  }

  main()
    .then(() => {
      consola.success('角色播种完成')
    })
    .catch((error: unknown) => {
      consola.error('角色播种失败:', error)
      process.exit(1)
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
