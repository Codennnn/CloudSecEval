import chalk from 'chalk'
import { exec, spawn } from 'child_process'
import { consola } from 'consola'
import { existsSync, readFileSync } from 'fs'
import inquirer from 'inquirer'
import { dirname, join } from 'path'
import stringWidth from 'string-width'
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

// Docker 相关常量
export const DOCKER_USERNAME = 'leokuchon'
export const IMAGE_NAME = 'nest-api'

// Docker Compose 文件路径常量
export const DOCKER_COMPOSE_FILE = 'docker/docker-compose.yml'
export const DOCKER_COMPOSE_PROD_FILE = 'docker/docker-compose.prod.yml'

// 彩色输出函数
export const colors = {
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  title: chalk.cyan,
  step: chalk.magenta,
  dim: chalk.dim,
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
}

// 执行命令
export async function runCommand(command, options = {}) {
  try {
    const { stdout, stderr } = await execAsync(command, options)

    return {
      success: true,
      stdout, stderr,
    }
  }
  catch (err) {
    return {
      success: false,
      error: err.message,
      stdout: err.stdout,
      stderr: err.stderr,
    }
  }
}

// 执行带实时输出的命令
export function runCommandWithOutput(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    })

    // 处理用户中断信号
    const handleSigint = () => {
      if (child && !child.killed) {
        child.kill('SIGINT')
      }

      reject(new Error('User interrupted'))
    }

    // 监听 SIGINT 信号
    process.on('SIGINT', handleSigint)

    child.on('close', (code) => {
      process.removeListener('SIGINT', handleSigint)

      if (code === 0) {
        resolve({ success: true, code })
      }
      else {
        reject(new Error(`Command failed with code ${code}`))
      }
    })

    child.on('error', (error) => {
      process.removeListener('SIGINT', handleSigint)
      reject(error)
    })
  })
}

// 执行带实时输出和进度提示的命令
export function runCommandWithProgressOutput(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      ...options,
    })

    let lastOutputTime = Date.now()
    let isFirstOutput = true

    // 创建一个简单的进度指示器
    const progressIndicator = setInterval(() => {
      const now = Date.now()
      const timeSinceLastOutput = now - lastOutputTime

      // 如果超过 3 秒没有输出，显示等待提示
      if (timeSinceLastOutput > 3000) {
        process.stdout.write('\r' + colors.dim('构建中，请稍候...') + ' ' + getSpinner())
      }
    }, 500)

    // 处理用户中断信号
    const handleSigint = () => {
      clearInterval(progressIndicator)
      process.stdout.write('\r' + ' '.repeat(50) + '\r')

      if (child && !child.killed) {
        child.kill('SIGINT')
      }

      reject(new Error('User interrupted'))
    }

    // 监听 SIGINT 信号
    process.on('SIGINT', handleSigint)

    // 处理标准输出
    child.stdout.on('data', (data) => {
      if (isFirstOutput) {
        clearInterval(progressIndicator)
        process.stdout.write('\r' + ' '.repeat(50) + '\r') // 清除进度提示
        isFirstOutput = false
      }

      lastOutputTime = Date.now()
      process.stdout.write(data.toString())
    })

    // 处理错误输出
    child.stderr.on('data', (data) => {
      if (isFirstOutput) {
        clearInterval(progressIndicator)
        process.stdout.write('\r' + ' '.repeat(50) + '\r') // 清除进度提示
        isFirstOutput = false
      }

      lastOutputTime = Date.now()
      process.stderr.write(data.toString())
    })

    child.on('close', (code) => {
      clearInterval(progressIndicator)
      process.stdout.write('\r' + ' '.repeat(50) + '\r') // 清除进度提示
      process.removeListener('SIGINT', handleSigint)

      if (code === 0) {
        resolve({ success: true, code })
      }
      else {
        reject(new Error(`Command failed with code ${code}`))
      }
    })

    child.on('error', (error) => {
      clearInterval(progressIndicator)
      process.stdout.write('\r' + ' '.repeat(50) + '\r') // 清除进度提示
      process.removeListener('SIGINT', handleSigint)
      reject(error)
    })
  })
}

// 检查文件是否存在
export function checkFileExists(filePath) {
  return existsSync(join(PROJECT_ROOT, filePath))
}

// 读取环境变量文件
export function readEnvFile(filePath = '.env') {
  try {
    const envPath = join(PROJECT_ROOT, filePath)
    const envContent = readFileSync(envPath, 'utf8')
    const envVars = {}

    envContent.split('\n').forEach((line) => {
      const [key, value] = line.split('=')

      if (key && value) {
        envVars[key.trim()] = value.trim()
      }
    })

    return envVars
  }
  catch {
    return null
  }
}

// 获取端口号
export function getPort() {
  const envVars = readEnvFile()

  return envVars?.PORT || '8000'
}

// 进度条显示函数
function showProgress(current, total, message = '等待中') {
  const percentage = Math.round(current / total * 100)
  const progressBarLength = 20
  const filledLength = Math.round(progressBarLength * current / total)
  const bar = colors.info('█'.repeat(filledLength)) + colors.dim('░'.repeat(progressBarLength - filledLength))

  // 清除当前行并显示进度条
  process.stdout.write(`\r${colors.step('→')} ${message}... [${bar}] ${colors.info(percentage + '%')} (${current}/${total})`)
}

// 清除进度条
function clearProgress() {
  process.stdout.write('\r' + ' '.repeat(80) + '\r')
}

// 导出进度条工具
export const progressBar = {
  show: showProgress,
  clear: clearProgress,
}

// HTTP 健康检查
export async function healthCheck(url, maxAttempts = 30, interval = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // 使用原生 fetch 替代 axios，设置 5 秒超时
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.status === 200) {
        // 清除进度条并显示成功信息
        clearProgress()

        return { success: true, attempt }
      }
    }
    catch {
      if (attempt < maxAttempts) {
        showProgress(attempt, maxAttempts, '等待服务启动')
        await sleep(interval)
      }
    }
  }

  // 清除进度条
  clearProgress()

  return { success: false, attempts: maxAttempts }
}

// 延迟函数
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 确认提示
export async function confirm(message, defaultValue = true) {
  try {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: defaultValue,
      },
    ])

    return confirmed
  }
  catch (err) {
    // 如果是用户中断（Ctrl+C），直接退出程序
    if (err.message.includes('User force closed the prompt')
      || err.message.includes('SIGINT')
      || err.name === 'ExitPromptError') {
      consola.log('')
      print.info('👋 检测到用户中断，正在退出...')
      process.exit(0)
    }

    // 如果是非交互式环境，返回默认值
    if (err.message.includes('non-interactive')) {
      print.warning('检测到非交互式环境，使用默认值')

      return defaultValue
    }

    throw err
  }
}

// 输入提示
export async function input(message, defaultValue = '') {
  try {
    const { value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message,
        default: defaultValue,
      },
    ])

    return value
  }
  catch (err) {
    // 如果是用户中断（Ctrl+C），直接退出程序
    if (err.message.includes('User force closed the prompt')
      || err.message.includes('SIGINT')
      || err.name === 'ExitPromptError') {
      consola.log('')
      print.info('👋 检测到用户中断，正在退出...')
      process.exit(0)
    }

    // 如果是非交互式环境，返回默认值
    if (err.message.includes('non-interactive')) {
      print.warning('检测到非交互式环境，使用默认值')

      return defaultValue
    }

    throw err
  }
}

// 选择提示
export async function select(message, choices) {
  try {
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message,
        choices,
      },
    ])

    return selected
  }
  catch (err) {
    // 如果是用户中断（Ctrl+C），直接退出程序
    if (err.message.includes('User force closed the prompt')
      || err.message.includes('SIGINT')
      || err.name === 'ExitPromptError') {
      consola.log('')
      print.info('👋 检测到用户中断，正在退出...')
      process.exit(0)
    }

    // 如果是非交互式环境，返回第一个选项
    if (err.message.includes('non-interactive')) {
      print.warning('检测到非交互式环境，使用第一个选项')

      return choices[0]?.value || choices[0]
    }

    throw err
  }
}

// 获取包版本
export function getPackageVersion(packagePath = 'package.json') {
  try {
    const pkgPath = join(PROJECT_ROOT, packagePath)
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

    return pkg.version
  }
  catch {
    return null
  }
}

// Docker Compose 相关命令
export const dockerCompose = {
  async up(file = DOCKER_COMPOSE_FILE, options = '--build -d') {
    return await runCommand(`docker compose -f ${file} up ${options}`)
  },

  async down(file = DOCKER_COMPOSE_FILE) {
    return await runCommand(`docker compose -f ${file} down`)
  },

  async ps(file = DOCKER_COMPOSE_FILE) {
    return await runCommand(`docker compose -f ${file} ps`)
  },

  async logs(file = DOCKER_COMPOSE_FILE, service = 'app', options = '-f') {
    return await runCommandWithOutput('docker', ['compose', '-f', file, 'logs', options, service])
  },

  async config(file = DOCKER_COMPOSE_FILE) {
    return await runCommand(`docker compose -f ${file} config`)
  },
}

// Docker 相关命令
export const docker = {
  async build(tag, dockerfile = 'docker/Dockerfile') {
    try {
      await runCommandWithOutput('docker', ['build', '-t', tag, '-f', dockerfile, '.'])

      return { success: true }
    }
    catch (err) {
      return {
        success: false,
        stderr: err.message,
      }
    }
  },

  async push(tag) {
    try {
      await runCommandWithOutput('docker', ['push', tag])

      return { success: true }
    }
    catch (err) {
      return {
        success: false,
        stderr: err.message,
      }
    }
  },

  async images(filter = '') {
    const command = filter ? `docker images --filter="${filter}"` : 'docker images'

    return await runCommand(command)
  },

  async rmi(tags) {
    if (Array.isArray(tags)) {
      return await runCommand(`docker rmi ${tags.join(' ')}`)
    }

    return await runCommand(`docker rmi ${tags}`)
  },

  async login() {
    return await runCommandWithOutput('docker', ['login'])
  },

  async info() {
    return await runCommand('docker info')
  },
}

// 简单的旋转器动画
function getSpinner() {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  const index = Math.floor(Date.now() / 100) % frames.length

  return colors.info(frames[index])
}

// 更简洁的构建进度显示
export function showBuildProgress(message = '构建中') {
  let frame = 0
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

  const interval = setInterval(() => {
    process.stdout.write(`\r${colors.info(frames[frame])} ${colors.dim(message)}...`)
    frame = (frame + 1) % frames.length
  }, 100)

  return {
    stop: () => {
      clearInterval(interval)
      process.stdout.write('\r' + ' '.repeat(50) + '\r')
    },
  }
}

// 格式化镜像表格显示
export function formatImagesTable(imagesOutput, title = '镜像列表') {
  if (!imagesOutput || !imagesOutput.trim()) {
    return null
  }

  // 解析 docker images 输出
  const lines = imagesOutput.split('\n').filter((line) => line.trim())

  if (lines.length <= 1) {
    return null
  }

  // 提取表头和数据行
  const headers = ['仓库', '标签', '镜像ID', '创建时间', '大小']
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      continue
    }

    // 使用正则表达式分割，处理空格和制表符
    const parts = line.split(/\s+/)

    if (parts.length >= 5) {
      // 处理创建时间和大小字段，Docker 输出格式可能变化
      let created = ''
      let size = ''

      if (parts.length >= 6) {
        // 标准格式：REPOSITORY TAG IMAGE_ID CREATED AGO SIZE
        created = parts[3] + ' ' + parts[4]
        size = parts[parts.length - 1] // 最后一个字段是大小
      }
      else if (parts.length === 5) {
        // 简化格式：REPOSITORY TAG IMAGE_ID CREATED SIZE
        created = parts[3]
        size = parts[4]
      }

      // 应用颜色格式化
      const coloredRow = [
        colors.success(parts[0]), // 仓库名 - 绿色
        colors.warning(parts[1]), // 标签 - 黄色
        colors.dim(parts[2].substring(0, 12)), // 镜像ID - 灰色（截取前12位）
        colors.dim(created), // 创建时间 - 灰色
        colors.info(size), // 大小 - 蓝色
      ]

      rows.push(coloredRow)
    }
  }

  if (rows.length === 0) {
    return null
  }

  // 使用 table 库创建表格
  const tableData = [headers, ...rows]

  // 计算字符串显示宽度（使用 string-width 库）
  const getDisplayWidth = (str) => {
    return stringWidth(str)
  }

  // 计算动态列宽
  const calculateColumnWidth = (columnIndex, minWidth = 8) => {
    const headerWidth = getDisplayWidth(headers[columnIndex])
    const maxDataWidth = Math.max(...rows.map((row) => {
      return getDisplayWidth(row[columnIndex])
    }))

    return Math.max(headerWidth, maxDataWidth, minWidth)
  }

  const config = {
    columns: {
      0: {
        alignment: 'left',
        width: Math.max(calculateColumnWidth(0), 20), // 仓库
      },
      1: {
        alignment: 'left',
        width: Math.max(calculateColumnWidth(1), 10), // 标签
      },
      2: {
        alignment: 'left',
        width: Math.max(calculateColumnWidth(2), 14), // 镜像ID
      },
      3: {
        alignment: 'left',
        width: Math.max(calculateColumnWidth(3), 16), // 创建时间
      },
      4: {
        alignment: 'right',
        width: Math.max(calculateColumnWidth(4), 10), // 大小
      },
    },
  }

  const tableOutput = table(tableData, config)

  // 添加标题
  return `${colors.step(`📋 ${title}`)}\n\n${tableOutput}`
}

// 获取本地镜像列表
export async function getLocalImages() {
  const images = []

  // 获取项目相关镜像
  const result = await docker.images(`reference=${DOCKER_USERNAME}/${IMAGE_NAME}`)

  if (result.success && result.stdout.trim()) {
    const lines = result.stdout.split('\n').slice(1) // 跳过表头

    lines.forEach((line) => {
      if (line.trim()) {
        const parts = line.split(/\s+/)
        const repository = parts[0]
        const tag = parts[1]
        const imageId = parts[2]
        const created = parts.length >= 6 ? `${parts[3]} ${parts[4]}` : parts[3]
        const size = parts[parts.length - 1]

        images.push({
          name: `${repository}:${tag}`,
          repository,
          tag,
          imageId,
          created,
          size,
          display: `${repository}:${tag} (${size})`,
        })
      }
    })
  }

  // 也获取本地构建的镜像
  const localResult = await docker.images(`reference=${IMAGE_NAME}`)

  if (localResult.success && localResult.stdout.trim()) {
    const lines = localResult.stdout.split('\n').slice(1)

    lines.forEach((line) => {
      if (line.trim()) {
        const parts = line.split(/\s+/)
        const repository = parts[0]
        const tag = parts[1]
        const imageId = parts[2]
        const created = parts.length >= 6 ? `${parts[3]} ${parts[4]}` : parts[3]
        const size = parts[parts.length - 1]

        if (repository === IMAGE_NAME) {
          images.push({
            name: `${repository}:${tag}`,
            repository,
            tag,
            imageId,
            created,
            size,
            display: `${repository}:${tag} (${size}) - 本地构建`,
            isLocal: true,
          })
        }
      }
    })
  }

  return images
}

// 格式化镜像列表表格显示
export function formatImagesListTable(images, title = '可用镜像') {
  if (!images || images.length === 0) {
    return null
  }

  // 表头
  const headers = ['镜像名称', '标签', '镜像ID', '创建时间', '大小', '类型']
  const rows = []

  // 处理镜像数据
  images.forEach((img) => {
    const coloredRow = [
      colors.success(img.repository), // 镜像名称 - 绿色
      colors.warning(img.tag), // 标签 - 黄色
      colors.dim(img.imageId.substring(0, 12)), // 镜像ID - 灰色（截取前12位）
      colors.dim(img.created || '未知'), // 创建时间 - 灰色
      colors.info(img.size), // 大小 - 蓝色
      img.isLocal ? colors.dim('本地构建') : colors.dim('远程'), // 类型 - 灰色
    ]
    rows.push(coloredRow)
  })

  // 使用 table 库创建表格
  const tableData = [headers, ...rows]

  // 计算字符串显示宽度（使用 string-width 库）
  const getDisplayWidth = (str) => {
    return stringWidth(str)
  }

  // 计算动态列宽
  const calculateColumnWidth = (columnIndex, minWidth = 8) => {
    const headerWidth = getDisplayWidth(headers[columnIndex])
    const maxDataWidth = Math.max(...rows.map((row) => {
      return getDisplayWidth(row[columnIndex])
    }))

    return Math.max(headerWidth, maxDataWidth, minWidth)
  }

  const config = {
    columns: {
      0: {
        alignment: 'left',
        width: Math.max(calculateColumnWidth(0), 16), // 镜像名称
      },
      1: {
        alignment: 'left',
        width: Math.max(calculateColumnWidth(1), 8), // 标签
      },
      2: {
        alignment: 'left',
        width: Math.max(calculateColumnWidth(2), 12), // 镜像ID
      },
      3: {
        alignment: 'left',
        width: Math.max(calculateColumnWidth(3), 14), // 创建时间
      },
      4: {
        alignment: 'right',
        width: Math.max(calculateColumnWidth(4), 8), // 大小
      },
      5: {
        alignment: 'center',
        width: Math.max(calculateColumnWidth(5), 10), // 类型
      },
    },
  }

  const tableOutput = table(tableData, config)

  // 添加标题
  return `${colors.step(`📋 ${title}`)}\n\n${tableOutput}`
}

// 便捷的 Docker Compose 操作函数
export const composeUtils = {
  // 使用开发环境配置启动
  async startDev(options = '--build -d') {
    return await dockerCompose.up(DOCKER_COMPOSE_FILE, options)
  },

  // 使用生产环境配置启动
  async startProd(options = '-d') {
    return await dockerCompose.up(DOCKER_COMPOSE_PROD_FILE, options)
  },

  // 获取当前使用的 Docker Compose 文件路径
  getDevFile() {
    return DOCKER_COMPOSE_FILE
  },

  getProdFile() {
    return DOCKER_COMPOSE_PROD_FILE
  },

  // 检查 Docker Compose 文件是否存在
  checkFiles() {
    const devExists = checkFileExists(DOCKER_COMPOSE_FILE)
    const prodExists = checkFileExists(DOCKER_COMPOSE_PROD_FILE)

    return {
      dev: devExists,
      prod: prodExists,
      devFile: DOCKER_COMPOSE_FILE,
      prodFile: DOCKER_COMPOSE_PROD_FILE,
    }
  },
}
