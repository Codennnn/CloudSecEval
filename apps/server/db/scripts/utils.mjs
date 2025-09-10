#!/usr/bin/env node

import chalk from 'chalk'
import { exec } from 'child_process'
import { consola } from 'consola'
import { existsSync, readFileSync } from 'fs'
import inquirer from 'inquirer'
import { dirname, join } from 'path'
import { table } from 'table'
import { fileURLToPath } from 'url'
import { promisify } from 'util'

const execAsync = promisify(exec)

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..', '..')

// 导出项目根目录路径
export const PROJECT_ROOT = projectRoot

// 数据库相关常量
export const DB_COMMANDS = {
  // Prisma 相关
  prisma: {
    format: 'prisma format',
    generate: 'prisma generate',
    'generate:prod': 'prisma generate --no-engine',
    push: 'prisma db push',
    studio: 'prisma studio',
    reset: 'prisma migrate reset',
  },

  // 数据库初始化
  init: 'pnpm prisma:format && pnpm prisma:generate && pnpm prisma:push',

  // 种子脚本
  seed: {
    main: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts',
    admin: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts admin',
    org: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts organization',
    user: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts user',
    license: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts license',
    logs: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts access-log',
    dev: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts full --env development',
    test: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts full --env test',
    prod: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts minimal --env production',
    clean: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts clean',
    stats: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts stats',
    validate: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts validate',
    quick: 'ts-node -r tsconfig-paths/register src/prisma/seeds/main.ts full --quick',
  },
}

// 彩色输出函数
export const colors = {
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  title: chalk.cyan,
  step: chalk.magenta,
  dim: chalk.dim,
  highlight: chalk.bgBlue.white,
  code: chalk.gray,
}

// 打印函数
export const print = {
  success: (msg) => consola.success(msg),
  error: (msg) => consola.error(msg),
  warning: (msg) => consola.warn(msg),
  info: (msg) => consola.info(msg),
  title: (msg) => consola.log(colors.title(msg)),
  step: (msg) => consola.log(colors.step(`→ ${msg}`)),
  dim: (msg) => consola.log(colors.dim(msg)),
  highlight: (msg) => consola.log(colors.highlight(` ${msg} `)),
  code: (msg) => consola.log(colors.code(msg)),
  divider: () => consola.log(colors.dim('─'.repeat(50))),
}

// 命令执行函数
export async function runCommand(command, options = {}) {
  const {
    cwd = PROJECT_ROOT,
    silent = false,
    showCommand = true,
    timeout = 300000, // 5分钟超时
  } = options

  if (showCommand && !silent) {
    print.step(`执行命令: ${colors.code(command)}`)
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout,
      env: { ...process.env, FORCE_COLOR: '1' },
    })

    if (!silent && stdout) {
      consola.log(stdout)
    }

    if (!silent && stderr) {
      console.error(stderr)
    }

    return { success: true, stdout, stderr }
  }
  catch (error) {
    if (!silent) {
      print.error(`命令执行失败: ${error.message}`)

      if (error.stdout) {
        consola.log(error.stdout)
      }

      if (error.stderr) {
        console.error(error.stderr)
      }
    }

    return {
      success: false,
      error: error.message,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    }
  }
}

// 交互式选择
export async function select(message, choices, options = {}) {
  const {
    type = 'list',
    pageSize = 10,
    loop = false,
  } = options

  try {
    const answer = await inquirer.prompt([
      {
        type,
        name: 'choice',
        message,
        choices,
        pageSize,
        loop,
      },
    ])

    return answer.choice
  }
  catch (error) {
    if (error.isTtyError || error.name === 'ExitPromptError') {
      print.info('操作已取消')
      process.exit(0)
    }

    throw error
  }
}

// 多选
export async function multiSelect(message, choices, options = {}) {
  const {
    pageSize = 10,
    loop = false,
    validate,
  } = options

  try {
    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'choices',
        message,
        choices,
        pageSize,
        loop,
        validate,
      },
    ])

    return answer.choices
  }
  catch (error) {
    if (error.isTtyError || error.name === 'ExitPromptError') {
      print.info('操作已取消')
      process.exit(0)
    }

    throw error
  }
}

// 确认对话框
export async function confirm(message, defaultValue = false) {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: defaultValue,
      },
    ])

    return answer.confirmed
  }
  catch (error) {
    if (error.isTtyError || error.name === 'ExitPromptError') {
      print.info('操作已取消')
      process.exit(0)
    }

    throw error
  }
}

// 输入框
export async function input(message, options = {}) {
  const {
    defaultValue,
    validate,
    filter,
  } = options

  try {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message,
        default: defaultValue,
        validate,
        filter,
      },
    ])

    return answer.input
  }
  catch (error) {
    if (error.isTtyError || error.name === 'ExitPromptError') {
      print.info('操作已取消')
      process.exit(0)
    }

    throw error
  }
}

// 检查文件是否存在
export function checkFileExists(filePath) {
  const fullPath = join(PROJECT_ROOT, filePath)

  return existsSync(fullPath)
}

// 读取包信息
export function getPackageInfo() {
  try {
    const packagePath = join(PROJECT_ROOT, 'package.json')
    const packageContent = readFileSync(packagePath, 'utf-8')

    return JSON.parse(packageContent)
  }
  catch {
    print.warning('无法读取 package.json')

    return {}
  }
}

// 检查数据库连接
export async function checkDatabaseConnection() {
  try {
    const result = await runCommand('pnpm prisma db push --accept-data-loss', {
      silent: true,
      showCommand: false,
    })

    return result.success
  }
  catch {
    return false
  }
}

// 检查Prisma状态
export async function checkPrismaStatus() {
  const status = {
    schemaExists: checkFileExists('src/prisma/schema.prisma'),
    clientGenerated: checkFileExists('generated/client'),
    envExists: checkFileExists('.env'),
  }

  return status
}

// 获取数据库统计信息
export async function getDatabaseStats() {
  try {
    const result = await runCommand(DB_COMMANDS.seed.stats, {
      silent: true,
      showCommand: false,
    })

    if (result.success) {
      return { success: true, output: result.stdout }
    }

    return { success: false, error: result.error }
  }
  catch (error) {
    return { success: false, error: error.message }
  }
}

// 格式化表格输出
export function formatTable(data, options = {}) {
  const {
    border = true,
    padding = 1,
  } = options

  const config = {
    border: border
      ? {
          topBody: '─',
          topJoin: '┬',
          topLeft: '┌',
          topRight: '┐',
          bottomBody: '─',
          bottomJoin: '┴',
          bottomLeft: '└',
          bottomRight: '┘',
          bodyLeft: '│',
          bodyRight: '│',
          bodyJoin: '│',
          joinBody: '─',
          joinLeft: '├',
          joinRight: '┤',
          joinJoin: '┼',
        }
      : {},
    columnDefault: {
      paddingLeft: padding,
      paddingRight: padding,
    },
  }

  return table(data, config)
}

// 睡眠函数
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 显示加载动画
export async function withSpinner(message, fn) {
  const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  let i = 0

  const interval = setInterval(() => {
    process.stdout.write(`\r${spinner[i]} ${message}`)
    i = (i + 1) % spinner.length
  }, 100)

  try {
    const result = await fn()
    clearInterval(interval)
    process.stdout.write('\r' + ' '.repeat(message.length + 2) + '\r')

    return result
  }
  catch (error) {
    clearInterval(interval)
    process.stdout.write('\r' + ' '.repeat(message.length + 2) + '\r')
    throw error
  }
}

// 显示进度条
export function showProgress(current, total, message = '') {
  const percent = Math.round(current / total * 100)
  const barLength = 20
  const filledLength = Math.round(barLength * current / total)
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength)

  process.stdout.write(`\r${message} [${bar}] ${percent}% (${current}/${total})`)

  if (current === total) {
    process.stdout.write('\n')
  }
}

// 全局信号处理
let isExiting = false

export function setupSignalHandlers() {
  const gracefulExit = () => {
    if (isExiting) {
      return
    }

    isExiting = true
    consola.log('')
    print.info('👋 检测到用户中断，正在退出...')
    process.exit(0)
  }

  process.on('SIGINT', gracefulExit)
  process.on('SIGTERM', gracefulExit)

  process.on('uncaughtException', (error) => {
    if (error.message && error.message.includes('SIGINT')) {
      gracefulExit()
    }
    else {
      print.error(`未捕获的异常: ${error.message}`)
      process.exit(1)
    }
  })
}

// 命令行参数解析辅助函数
export function parseArguments() {
  const args = process.argv.slice(2)
  const options = {}
  const flags = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg.startsWith('--')) {
      const key = arg.slice(2)

      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[key] = args[i + 1]
        i++
      }
      else {
        flags.push(key)
        options[key] = true
      }
    }
    else if (arg.startsWith('-')) {
      flags.push(arg.slice(1))
      options[arg.slice(1)] = true
    }
  }

  return { options, flags, args }
}
