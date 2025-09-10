import { consola } from 'consola'

import { PrismaClient } from '#prisma/client'

import type { Environment } from './core/types'
import { SeedOrchestrator } from './orchestrator'
import { CliUtil } from './utils/cli.util'

const prisma = new PrismaClient()

/**
 * 执行管理员创建
 */
async function executeAdmin(
  orchestrator: SeedOrchestrator,
  options: Record<string, unknown>,
): Promise<void> {
  consola.start('创建管理员账号...')
  const result = await orchestrator.executeSingle('AdminSeeder', options)

  if (result.success) {
    consola.success(result.message)
  }
  else {
    consola.error(result.message)

    if (result.error) {
      consola.error(result.error)
    }
  }
}

/**
 * 执行组织创建
 */
async function executeOrganization(
  orchestrator: SeedOrchestrator,
  options: Record<string, unknown>,
): Promise<void> {
  consola.start('创建组织和部门...')

  // 确保管理员存在
  await orchestrator.executeSingle('AdminSeeder', options)

  const result = await orchestrator.executeSingle('OrganizationSeeder', options)

  if (result.success) {
    consola.success(result.message)
  }
  else {
    consola.error(result.message)

    if (result.error) {
      consola.error(result.error)
    }
  }
}

/**
 * 执行用户创建
 */
async function executeUser(
  orchestrator: SeedOrchestrator,
  options: Record<string, unknown>,
): Promise<void> {
  consola.start('创建用户数据...')

  // 确保依赖存在
  await orchestrator.executeSingle('AdminSeeder', options)
  await orchestrator.executeSingle('OrganizationSeeder', options)

  const result = await orchestrator.executeSingle('UserSeeder', options)

  if (result.success) {
    consola.success(result.message)
  }
  else {
    consola.error(result.message)

    if (result.error) {
      consola.error(result.error)
    }
  }
}

/**
 * 执行授权码创建
 */
async function executeLicense(
  orchestrator: SeedOrchestrator,
  options: Record<string, unknown>,
): Promise<void> {
  consola.start('创建授权码数据...')

  // 确保依赖存在
  await orchestrator.executeSingle('AdminSeeder', options)
  await orchestrator.executeSingle('OrganizationSeeder', options)
  await orchestrator.executeSingle('UserSeeder', options)

  const result = await orchestrator.executeSingle('LicenseSeeder', options)

  if (result.success) {
    consola.success(result.message)
  }
  else {
    consola.error(result.message)

    if (result.error) {
      consola.error(result.error)
    }
  }
}

/**
 * 执行权限创建
 */
async function executePermissions(
  orchestrator: SeedOrchestrator,
  options: Record<string, unknown>,
): Promise<void> {
  consola.start('创建权限数据...')

  const result = await orchestrator.executeSingle('PermissionsSeeder', options)

  if (result.success) {
    consola.success(result.message)
  }
  else {
    consola.error(result.message)

    if (result.error) {
      consola.error(result.error)
    }
  }
}

/**
 * 执行角色创建
 */
async function executeRoles(
  orchestrator: SeedOrchestrator,
  options: Record<string, unknown>,
): Promise<void> {
  consola.start('创建角色数据...')

  // 确保权限存在
  await orchestrator.executeSingle('PermissionsSeeder', options)

  const result = await orchestrator.executeSingle('RolesSeeder', options)

  if (result.success) {
    consola.success(result.message)
  }
  else {
    consola.error(result.message)

    if (result.error) {
      consola.error(result.error)
    }
  }
}

/**
 * 执行访问日志创建
 */
async function executeAccessLog(
  orchestrator: SeedOrchestrator,
  options: Record<string, unknown>,
): Promise<void> {
  consola.start('创建访问日志数据...')

  const result = await orchestrator.executeSingle('AccessLogSeeder', options)

  if (result.success) {
    consola.success(result.message)
  }
  else {
    consola.error(result.message)

    if (result.error) {
      consola.error(result.error)
    }
  }
}

/**
 * 执行完整流程
 */
async function executeFull(
  orchestrator: SeedOrchestrator,
  environment: Environment,
  options: Record<string, unknown>,
): Promise<void> {
  consola.start('执行完整的种子数据生成...')

  let result

  if (environment === 'production') {
    // 生产环境只创建最小必要数据
    result = await orchestrator.minimal()
  }
  else if (options.quick === true) {
    // 快速开发模式
    result = await orchestrator.quickDev(options)
  }
  else {
    // 完整模式
    const config = {
      environment,
      parallel: options.parallel === true,
      skipValidation: options.skipValidation === true,
    }

    result = await orchestrator.executeAll(config)
  }

  if (result.success) {
    consola.success(`完整流程执行成功，耗时: ${result.duration}ms`)
    CliUtil.displayResults(result.results)
  }
  else {
    consola.error(`完整流程执行失败，耗时: ${result.duration}ms`)

    if (result.error) {
      consola.error(result.error)
    }

    CliUtil.displayResults(result.results)
  }
}

/**
 * 执行清理
 */
async function executeClean(
  orchestrator: SeedOrchestrator,
  options: Record<string, unknown>,
): Promise<void> {
  const preserveAdmin = options.preserveAdmin !== false

  if (preserveAdmin) {
    consola.start('清理所有测试数据（保留管理员）...')
  }
  else {
    consola.start('清理所有数据（包括管理员）...')
  }

  const confirmed = await CliUtil.confirm('确定要清理数据吗？此操作不可恢复。')

  if (!confirmed) {
    consola.info('已取消清理操作')

    return
  }

  const result = await orchestrator.cleanAll(preserveAdmin)

  if (result.success) {
    consola.success(`数据清理完成，耗时: ${result.duration}ms`)
    CliUtil.displayResults(result.results)
  }
  else {
    consola.error(`数据清理失败，耗时: ${result.duration}ms`)

    if (result.error) {
      consola.error(result.error)
    }
  }
}

/**
 * 执行统计显示
 */
async function executeStats(orchestrator: SeedOrchestrator): Promise<void> {
  consola.start('获取数据统计信息...')

  try {
    const stats = await orchestrator.getAllStats()
    CliUtil.displayStats(stats)
  }
  catch (error) {
    consola.error('获取统计信息失败:', error)
  }
}

/**
 * 执行数据验证
 */
async function executeValidate(orchestrator: SeedOrchestrator): Promise<void> {
  consola.start('验证数据完整性...')

  try {
    const results = await orchestrator.validateAll()

    consola.info('=== 数据验证结果 ===')
    Object.entries(results).forEach(([seederName, isValid]) => {
      const cleanName = seederName.replace('Seeder', '')
      const status = isValid ? '✅ 有效' : '❌ 无效'
      consola.info(`${cleanName}: ${status}`)
    })

    const allValid = Object.values(results).every(Boolean)

    if (allValid) {
      consola.success('所有数据验证通过')
    }
    else {
      consola.warn('部分数据验证失败')
    }
  }
  catch (error) {
    consola.error('数据验证失败:', error)
  }
}

/**
 * 执行具体命令
 */
async function executeCommand(
  orchestrator: SeedOrchestrator,
  command: string | undefined,
  options: Record<string, unknown>,
): Promise<void> {
  const environment = options.env ?? CliUtil.getEnvironment()
  const silent = options.silent === true

  if (!silent) {
    consola.info(`执行环境: ${environment as Environment}`)
  }

  switch (command) {
    case 'admin':
      await executeAdmin(orchestrator, options)
      break

    case 'organization':
      await executeOrganization(orchestrator, options)
      break

    case 'user':
      await executeUser(orchestrator, options)
      break

    case 'permissions':
      await executePermissions(orchestrator, options)
      break

    case 'roles':
      await executeRoles(orchestrator, options)
      break

    case 'license':
      await executeLicense(orchestrator, options)
      break

    case 'access-log':
      await executeAccessLog(orchestrator, options)
      break

    case 'clean':
      await executeClean(orchestrator, options)
      break

    case 'stats':
      await executeStats(orchestrator)
      break

    case 'validate':
      await executeValidate(orchestrator)
      break

    case 'full':
      // fall through

    case undefined:
      // 默认执行完整流程
      await executeFull(orchestrator, environment as Environment, options)
      break

    default:
      consola.error(`未知命令: ${command}`)
      consola.info('使用 --help 查看可用命令')
      process.exit(1)
  }
}

/**
 * 主种子脚本入口
 * 提供统一的命令行界面和执行逻辑
 */
async function main(): Promise<void> {
  try {
    // 解析命令行参数
    const { command, options, flags } = CliUtil.parseArgs()

    // 显示帮助信息
    if (flags.includes('help') || flags.includes('h') || command === 'help' || command === '--help') {
      CliUtil.showHelp()

      return
    }

    // 创建编排器
    const orchestrator = new SeedOrchestrator(prisma)

    // 根据命令执行相应操作
    await executeCommand(orchestrator, command, options)
  }
  catch (error) {
    consola.error('种子脚本执行失败:', error)
    process.exit(1)
  }
  finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  void main()
}

export { main }
