#!/usr/bin/env node

import { consola } from 'consola'
import { existsSync } from 'fs'
import { join } from 'path'

import { print, PROJECT_ROOT, runCommand } from './utils.mjs'

async function main() {
  print.title('🔧 检查 Docker 脚本环境...')

  // 检查 Node.js 版本
  const nodeVersionResult = await runCommand('node --version')

  if (nodeVersionResult.success) {
    const nodeVersion = nodeVersionResult.stdout.trim()
    print.info(`Node.js 版本：${nodeVersion}`)

    // 检查版本是否符合要求 (>=18.0.0)
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0])

    if (majorVersion < 18) {
      print.error('Node.js 版本过低，需要 18.0.0 或更高版本')
      process.exit(1)
    }
  }
  else {
    print.error('无法检查 Node.js 版本')
    process.exit(1)
  }

  // 检查根目录 package.json 是否存在
  if (!existsSync(join(PROJECT_ROOT, 'package.json'))) {
    print.error('根目录 package.json 文件不存在')
    process.exit(1)
  }

  print.step('检查依赖是否已安装...')

  // 检查根目录 node_modules 是否存在
  if (!existsSync(join(PROJECT_ROOT, 'node_modules'))) {
    print.warning('根目录依赖未安装，请先运行：pnpm install')
    process.exit(1)
  }

  // 检查必要的依赖是否存在
  const requiredDeps = ['consola', 'chalk', 'inquirer', 'commander', 'dotenv']
  const missingDeps = []

  for (const dep of requiredDeps) {
    if (!existsSync(join(PROJECT_ROOT, 'node_modules', dep))) {
      missingDeps.push(dep)
    }
  }

  if (missingDeps.length > 0) {
    print.error(`缺少必要依赖：${missingDeps.join(', ')}`)
    print.info('请运行：pnpm install')
    process.exit(1)
  }

  print.success('所有依赖已正确安装')

  // 设置脚本执行权限
  print.step('设置脚本执行权限...')

  const scripts = [
    'start.mjs',
    'stop.mjs',
    'status.mjs',
    'logs.mjs',
    'publish.mjs',
  ]

  for (const script of scripts) {
    const chmodResult = await runCommand(`chmod +x docker/${script}`)

    if (chmodResult.success) {
      print.success(`✓ ${script}`)
    }
    else {
      print.warning(`⚠ ${script} 权限设置失败`)
    }
  }

  consola.log('')
  print.title('🎉 环境检查完成！')
  consola.log('')
  print.info('可用的脚本：')
  consola.log('  pnpm docker:start          # 启动服务')
  consola.log('  pnpm docker:stop           # 停止服务')
  consola.log('  pnpm docker:status         # 查看状态')
  consola.log('  pnpm docker:logs           # 查看日志')
  consola.log('  pnpm docker:publish        # 发布镜像')
  consola.log('')
  print.info('或使用 pnpm 脚本（推荐）：')
  consola.log('  pnpm docker:start')
  consola.log('  pnpm docker:stop')
  consola.log('  pnpm docker:status')
  consola.log('  pnpm docker:logs')
  consola.log('  pnpm docker:publish')
}

main().catch((error) => {
  print.error(`环境检查失败：${error.message}`)
  process.exit(1)
})
