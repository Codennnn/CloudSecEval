import { consola } from 'consola'

import { PrismaClient } from '#prisma/client'

import { PERMISSION_SEEDS } from './data/permissions'

/**
 * 权限种子数据播种
 *
 * 创建系统中所有的权限定义
 */
export async function seedPermissions(prisma: PrismaClient): Promise<void> {
  consola.info('开始播种权限数据...')

  try {
    // 清理现有的非系统权限（如果需要重置）
    // await prisma.permission.deleteMany({
    //   where: { system: false }
    // })

    const existingPermissions = await prisma.permission.findMany({
      select: { slug: true },
    })
    const existingSlugs = new Set(existingPermissions.map((p) => p.slug))

    const permissionsToCreate = PERMISSION_SEEDS.filter(
      (permission) => !existingSlugs.has(`${permission.resource}:${permission.action}`),
    )

    if (permissionsToCreate.length === 0) {
      consola.success('所有权限已存在，跳过权限播种')

      return
    }

    // 批量创建权限
    const createData = permissionsToCreate.map((permission) => ({
      resource: permission.resource,
      action: permission.action,
      slug: `${permission.resource}:${permission.action}`,
      description: permission.description,
      system: true, // 所有种子权限都是系统权限
    }))

    await prisma.permission.createMany({
      data: createData,
      skipDuplicates: true,
    })

    consola.success(`成功创建 ${createData.length} 个权限`)

    // 显示权限统计
    const totalPermissions = await prisma.permission.count()
    const systemPermissions = await prisma.permission.count({
      where: { system: true },
    })

    consola.info(`权限统计: 总计 ${totalPermissions} 个，系统权限 ${systemPermissions} 个`)
  }
  catch (error) {
    consola.error('权限播种失败:', error)
    throw error
  }
}

/**
 * 单独运行权限种子脚本
 */
if (require.main === module) {
  const prisma = new PrismaClient()

  seedPermissions(prisma)
    .then(() => {
      consola.success('权限播种完成')
    })
    .catch((error: unknown) => {
      consola.error('权限播种失败:', error)
      process.exit(1)
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
