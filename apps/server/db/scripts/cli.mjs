#!/usr/bin/env node

import { program } from 'commander'
import { consola } from 'consola'

import {
  checkDatabaseConnection,
  checkPrismaStatus,
  colors,
  confirm,
  DB_COMMANDS,
  getDatabaseStats,
  getPackageInfo,
  input,
  multiSelect,
  print,
  runCommand,
  select,
  setupSignalHandlers,
  withSpinner,
} from './utils.mjs'

// 设置信号处理
setupSignalHandlers()

// 主菜单选项
const MAIN_MENU_OPTIONS = [
  { name: '🗄️  数据库管理', value: 'database' },
  { name: '🌱 种子数据管理', value: 'seeds' },
  { name: '🔧 Prisma 工具', value: 'prisma' },
  { name: '📊 数据库状态检查', value: 'status' },
  { name: '❌ 退出', value: 'exit' },
]

// 数据库管理选项
const DATABASE_OPTIONS = [
  { name: '🚀 初始化数据库', value: 'init', description: '格式化 + 生成客户端 + 推送架构' },
  { name: '📊 查看数据统计', value: 'stats', description: '显示数据库中的数据统计信息' },
  { name: '✅ 验证数据完整性', value: 'validate', description: '检查数据完整性' },
  { name: '🔙 返回主菜单', value: 'back' },
]

// 种子数据选项
const SEED_OPTIONS = [
  { name: '🎯 快速开发数据', value: 'quick', description: '快速生成开发环境测试数据' },
  { name: '📋 完整数据集', value: 'full', description: '生成完整的测试数据' },
  { name: '👤 仅管理员账号', value: 'admin', description: '只创建系统管理员账号' },
  { name: '🏢 仅组织架构', value: 'org', description: '只创建组织和部门结构' },
  { name: '👥 仅用户数据', value: 'user', description: '只创建用户测试数据' },
  { name: '🎫 仅授权码数据', value: 'license', description: '只创建授权码数据' },
  { name: '📝 仅访问日志', value: 'logs', description: '只创建访问日志数据' },
  { name: '🧹 清理测试数据', value: 'clean', description: '清理所有测试数据' },
  { name: '🔙 返回主菜单', value: 'back' },
]

// 环境选项
const ENVIRONMENT_OPTIONS = [
  { name: '🛠️  开发环境 (Development)', value: 'development' },
  { name: '🧪 测试环境 (Test)', value: 'test' },
  { name: '🚀 生产环境 (Production)', value: 'production' },
]

// Prisma工具选项
const PRISMA_OPTIONS = [
  { name: '🎨 格式化架构文件', value: 'format', description: '格式化 schema.prisma 文件' },
  { name: '⚡ 生成客户端', value: 'generate', description: '生成 Prisma 客户端代码' },
  { name: '📦 生成生产客户端', value: 'generate:prod', description: '生成不包含查询引擎的客户端' },
  { name: '📤 推送架构', value: 'push', description: '将架构推送到数据库' },
  { name: '🎛️  Prisma Studio', value: 'studio', description: '启动 Prisma Studio 数据库管理界面' },
  { name: '🔄 重置数据库', value: 'reset', description: '重置数据库并应用迁移' },
  { name: '🔙 返回主菜单', value: 'back' },
]

// 显示欢迎信息
function showWelcome() {
  consola.clear()
  print.title('🗄️  数据库管理 CLI 工具')
  print.title('═'.repeat(40))
  print.info('这个工具帮助您管理数据库相关的操作')
  print.divider()
}

// 显示状态检查
async function showDatabaseStatus() {
  print.title('📊 数据库状态检查')
  print.divider()

  // 检查基础文件
  print.step('检查项目文件:')
  const prismaStatus = await withSpinner('检查 Prisma 状态...', checkPrismaStatus)

  consola.log(`   Schema 文件: ${prismaStatus.schemaExists ? '✅ 存在' : '❌ 缺失'}`)
  consola.log(`   Prisma 客户端: ${prismaStatus.clientGenerated ? '✅ 已生成' : '❌ 未生成'}`)
  consola.log(`   环境配置: ${prismaStatus.envExists ? '✅ 存在' : '❌ 缺失'}`)

  consola.log('')

  // 检查数据库连接
  print.step('检查数据库连接:')
  const dbConnected = await withSpinner('测试数据库连接...', checkDatabaseConnection)
  consola.log(`   数据库连接: ${dbConnected ? '✅ 正常' : '❌ 失败'}`)

  consola.log('')

  // 获取数据统计
  if (dbConnected) {
    print.step('数据库统计信息:')
    const stats = await withSpinner('获取数据统计...', getDatabaseStats)

    if (stats.success) {
      consola.log(stats.output)
    }
    else {
      print.error('无法获取数据统计信息')
    }
  }

  print.divider()
  await input('按 Enter 键返回主菜单...')
}

// 执行数据库操作
async function executeDatabaseOperation(operation) {
  switch (operation) {
    case 'init': {
      print.title('🚀 初始化数据库')
      print.warning('这将格式化架构、生成客户端并推送到数据库')

      const confirmed = await confirm('确定要继续吗？', true)

      if (!confirmed) {
        print.info('操作已取消')

        return
      }

      await runCommand(DB_COMMANDS.init)
      print.success('数据库初始化完成！')
      break
    }

    case 'stats': {
      print.title('📊 数据库统计信息')
      await runCommand(DB_COMMANDS.seed.stats)
      break
    }

    case 'validate': {
      print.title('✅验证数据完整性')
      await runCommand(DB_COMMANDS.seed.validate)
      break
    }
  }

  await input('按 Enter 键继续...')
}

// 执行种子数据操作
async function executeSeedOperation(operation) {
  let command = ''
  let needsEnvironment = false
  let needsOptions = false

  switch (operation) {
    case 'quick':
      command = DB_COMMANDS.seed.quick
      print.title('🎯 快速生成开发数据')
      break

    case 'full':
      needsEnvironment = true
      needsOptions = true
      print.title('📋 生成完整数据集')
      break

    case 'admin':
      command = DB_COMMANDS.seed.admin
      print.title('👤 创建管理员账号')
      break

    case 'org':
      command = DB_COMMANDS.seed.org
      print.title('🏢 创建组织架构')
      break

    case 'user':
      command = DB_COMMANDS.seed.user
      needsOptions = true
      print.title('👥 创建用户数据')
      break

    case 'license':
      command = DB_COMMANDS.seed.license
      needsOptions = true
      print.title('🎫 创建授权码数据')
      break

    case 'logs':
      command = DB_COMMANDS.seed.logs
      needsOptions = true
      print.title('📝 创建访问日志')
      break

    case 'clean':{
      command = DB_COMMANDS.seed.clean
      print.title('🧹 清理测试数据')
      print.warning('这将删除所有测试数据（可选保留管理员）')

      const preserveAdmin = await confirm('保留管理员账号？', true)

      if (!preserveAdmin) {
        command += ' --no-preserve-admin'
      }

      const confirmed = await confirm('确定要清理数据吗？', false)

      if (!confirmed) {
        print.info('操作已取消')

        return
      }

      break
    }
  }

  // 选择环境
  if (needsEnvironment) {
    const environment = await select('选择目标环境:', ENVIRONMENT_OPTIONS)

    if (operation === 'full') {
      if (environment === 'production') {
        command = DB_COMMANDS.seed.prod
      }
      else {
        command = `${DB_COMMANDS.seed.main} full --env ${environment}`
      }
    }
  }

  // 选择额外选项
  if (needsOptions) {
    const additionalOptions = await multiSelect(
      '选择额外选项 (可多选):',
      [
        { name: '🚀 强制执行 (忽略已存在数据)', value: '--force' },
        { name: '🎯 不创建预设数据', value: '--no-presets' },
        { name: '📈 生成真实访问模式', value: '--realistic' },
        { name: '🔢 自定义数量', value: '--custom-count' },
        { name: '🔇 静默模式', value: '--silent' },
      ],
      {
        validate: () => true, // 允许不选择任何选项
      },
    )

    // 处理自定义数量
    if (additionalOptions.includes('--custom-count')) {
      const count = await input('请输入数据数量:', {
        validate: (input) => {
          const num = parseInt(input)

          return !isNaN(num) && num > 0 ? true : '请输入有效的正整数'
        },
      })

      additionalOptions.push(`--count ${count}`)
      additionalOptions.splice(additionalOptions.indexOf('--custom-count'), 1)
    }

    if (additionalOptions.length > 0) {
      command += ' ' + additionalOptions.join(' ')
    }
  }

  // 执行命令
  if (command) {
    print.step(`执行命令: ${colors.code(command)}`)
    await runCommand(command)
    print.success('操作完成！')
  }

  await input('按 Enter 键继续...')
}

// 执行Prisma操作
async function executePrismaOperation(operation) {
  let command = ''
  let confirmMessage = ''

  switch (operation) {
    case 'format':
      command = DB_COMMANDS.prisma.format
      print.title('🎨 格式化 Prisma 架构文件')
      break

    case 'generate':
      command = DB_COMMANDS.prisma.generate
      print.title('⚡ 生成 Prisma 客户端')
      break

    case 'generate:prod':
      command = DB_COMMANDS.prisma['generate:prod']
      print.title('📦 生成生产环境客户端')
      break

    case 'push':
      command = DB_COMMANDS.prisma.push
      confirmMessage = '这将推送架构变更到数据库，可能会丢失数据。确定继续？'
      print.title('📤 推送架构到数据库')
      break

    case 'studio':
      command = DB_COMMANDS.prisma.studio
      print.title('🎛️  启动 Prisma Studio')
      print.info('Prisma Studio 将在浏览器中打开，按 Ctrl+C 停止')
      break

    case 'reset':
      command = DB_COMMANDS.prisma.reset
      confirmMessage = '这将重置整个数据库并重新应用迁移。所有数据将丢失！确定继续？'
      print.title('🔄 重置数据库')
      print.warning('⚠️  这是一个危险操作，将删除所有数据！')
      break
  }

  // 确认对话框
  if (confirmMessage) {
    const confirmed = await confirm(confirmMessage, false)

    if (!confirmed) {
      print.info('操作已取消')

      return
    }
  }

  // 执行命令
  if (command) {
    await runCommand(command)

    if (operation !== 'studio') {
      print.success('操作完成！')
      await input('按 Enter 键继续...')
    }
  }
}

// 主程序逻辑
async function main() {
  showWelcome()

  while (true) {
    try {
      const choice = await select('请选择操作:', MAIN_MENU_OPTIONS)

      switch (choice) {
        case 'database': {
          while (true) {
            const dbChoice = await select('数据库管理:', DATABASE_OPTIONS)

            if (dbChoice === 'back') {
              break
            }

            await executeDatabaseOperation(dbChoice)
          }

          break
        }

        case 'seeds': {
          while (true) {
            const seedChoice = await select('种子数据管理:', SEED_OPTIONS)

            if (seedChoice === 'back') {
              break
            }

            await executeSeedOperation(seedChoice)
          }

          break
        }

        case 'prisma': {
          while (true) {
            const prismaChoice = await select('Prisma 工具:', PRISMA_OPTIONS)

            if (prismaChoice === 'back') {
              break
            }

            await executePrismaOperation(prismaChoice)
          }

          break
        }

        case 'status': {
          await showDatabaseStatus()
          break
        }

        case 'exit': {
          print.success('👋 再见！')
          process.exit(0)
        }
      }
    }
    catch (error) {
      if (error.message && error.message.includes('User force closed')) {
        print.info('👋 操作已取消，再见！')
        process.exit(0)
      }

      print.error(`发生错误: ${error.message}`)
      await input('按 Enter 键继续...')
    }
  }
}

// 命令行模式支持
program
  .name('db-cli')
  .description('数据库管理 CLI 工具')
  .version(getPackageInfo().version || '1.0.0')

program
  .option('-i, --interactive', '交互模式 (默认)')
  .option('-s, --status', '显示数据库状态')
  .option('--init', '初始化数据库')
  .option('--seed <type>', '执行种子脚本')
  .option('--clean', '清理测试数据')
  .option('--stats', '显示数据统计')
  .parse()

const options = program.opts()

// 根据命令行参数执行相应操作
if (options.status) {
  await showDatabaseStatus()
  process.exit(0)
}
else if (options.init) {
  await executeDatabaseOperation('init')
  process.exit(0)
}
else if (options.seed) {
  await executeSeedOperation(options.seed)
  process.exit(0)
}
else if (options.clean) {
  await executeSeedOperation('clean')
  process.exit(0)
}
else if (options.stats) {
  await executeDatabaseOperation('stats')
  process.exit(0)
}
else {
  // 默认进入交互模式
  await main()
}
