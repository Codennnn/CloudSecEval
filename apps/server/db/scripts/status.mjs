#!/usr/bin/env node

import { consola } from 'consola'

import {
  checkDatabaseConnection,
  checkFileExists,
  checkPrismaStatus,
  formatTable,
  getDatabaseStats,
  print,
  withSpinner,
} from './utils.mjs'

async function main() {
  print.title('📊 数据库状态详细报告')
  print.title('═'.repeat(50))

  // 1. 项目基础检查
  print.step('📋 项目配置检查:')
  const configChecks = [
    ['环境配置文件', checkFileExists('.env') ? '✅ 存在' : '❌ 缺失'],
    ['Prisma Schema', checkFileExists('src/prisma/schema.prisma') ? '✅ 存在' : '❌ 缺失'],
    ['种子脚本', checkFileExists('src/prisma/seeds/main.ts') ? '✅ 存在' : '❌ 缺失'],
    ['Docker配置', checkFileExists('docker/docker-compose.yml') ? '✅ 存在' : '❌ 缺失'],
  ]

  consola.log(formatTable([
    ['配置项', '状态'],
    ...configChecks,
  ]))

  // 2. Prisma 状态检查
  print.step('🔧 Prisma 状态检查:')
  const prismaStatus = await withSpinner('检查 Prisma 组件...', checkPrismaStatus)

  const prismaChecks = [
    ['Schema 文件', prismaStatus.schemaExists ? '✅ 存在' : '❌ 缺失'],
    ['客户端代码', prismaStatus.clientGenerated ? '✅ 已生成' : '❌ 未生成'],
    ['环境变量', prismaStatus.envExists ? '✅ 配置完整' : '❌ 配置缺失'],
  ]

  consola.log(formatTable([
    ['Prisma 组件', '状态'],
    ...prismaChecks,
  ]))

  // 3. 数据库连接测试
  print.step('🌐 数据库连接测试:')
  const dbConnected = await withSpinner('测试数据库连接...', checkDatabaseConnection)

  consola.log(`   连接状态: ${dbConnected ? '✅ 连接正常' : '❌ 连接失败'}`)

  if (!dbConnected) {
    print.warning('数据库连接失败，请检查:')
    consola.log('   • 数据库服务是否启动 (pnpm db:dev:up)')
    consola.log('   • .env 文件中的 DATABASE_URL 是否正确')
    consola.log('   • 网络连接是否正常')
    consola.log('')
  }

  // 4. 数据库内容统计
  if (dbConnected) {
    print.step('📊 数据库内容统计:')
    const stats = await withSpinner('获取数据统计...', getDatabaseStats)

    if (stats.success) {
      // 解析统计输出并格式化
      const lines = stats.output.split('\n').filter((line) => line.trim())
      let currentSection = ''
      const sections = {}

      for (const line of lines) {
        if (line.includes(':') && !line.startsWith('   ')) {
          currentSection = line.replace(':', '').trim()
          sections[currentSection] = []
        }
        else if (line.startsWith('   ') && currentSection) {
          const [key, value] = line.trim().split(': ')

          if (key && value) {
            sections[currentSection].push([key, value])
          }
        }
      }

      // 显示各个部分的统计
      for (const [sectionName, items] of Object.entries(sections)) {
        if (items.length > 0) {
          consola.log(`\n📈 ${sectionName}:`)
          consola.log(formatTable([
            ['指标', '数值'],
            ...items,
          ]))
        }
      }
    }
    else {
      print.error('无法获取数据统计信息')
      consola.log(`   错误: ${stats.error}`)
    }
  }

  // 5. 健康检查总结
  print.step('🎯 健康检查总结:')
  const healthScore = calculateHealthScore({
    configExists: checkFileExists('.env'),
    schemaExists: prismaStatus.schemaExists,
    clientGenerated: prismaStatus.clientGenerated,
    dbConnected,
  })

  consola.log('')
  consola.log(`   总体健康度: ${getHealthEmoji(healthScore)} ${healthScore}/100`)

  if (healthScore < 100) {
    consola.log('')
    print.warning('🔧 建议的修复步骤:')

    if (!checkFileExists('.env')) {
      consola.log('   • 复制 .env.example 为 .env 并配置数据库连接')
    }

    if (!prismaStatus.clientGenerated) {
      consola.log('   • 运行 pnpm prisma:generate 生成客户端代码')
    }

    if (!dbConnected) {
      consola.log('   • 启动数据库服务: pnpm db:dev:up')
      consola.log('   • 初始化数据库: pnpm db:init')
    }
  }
  else {
    print.success('🎉 所有检查项都通过了！数据库状态良好。')
  }

  consola.log('')
  print.title('🛠️  常用命令:')
  const commands = [
    ['数据库管理 CLI', 'pnpm db:cli'],
    ['初始化数据库', 'pnpm db:init'],
    ['生成测试数据', 'pnpm db:quick'],
    ['查看数据统计', 'pnpm db:seed:stats'],
    ['启动 Prisma Studio', 'pnpm prisma:studio'],
    ['启动数据库服务', 'pnpm db:dev:up'],
  ]

  consola.log(formatTable([
    ['操作', '命令'],
    ...commands,
  ]))
}

function calculateHealthScore(checks) {
  const weights = {
    configExists: 20,
    schemaExists: 25,
    clientGenerated: 25,
    dbConnected: 30,
  }

  let score = 0

  for (const [check, weight] of Object.entries(weights)) {
    if (checks[check]) {
      score += weight
    }
  }

  return score
}

function getHealthEmoji(score) {
  if (score >= 90) {
    return '🟢'
  }

  if (score >= 70) {
    return '🟡'
  }

  if (score >= 50) {
    return '🟠'
  }

  return '🔴'
}

main().catch((error) => {
  print.error(`状态检查失败: ${error.message}`)
  process.exit(1)
})
