#!/usr/bin/env node

import { program } from 'commander'
import { consola } from 'consola'
import { join } from 'path'

import {
  checkFileExists,
  confirm,
  DOCKER_COMPOSE_FILE,
  dockerCompose,
  formatImagesListTable,
  getLocalImages,
  getPort,
  healthCheck,
  print,
  PROJECT_ROOT,
  runCommand,
  select,
  sleep,
} from './utils.mjs'

// 全局信号处理 - 确保 Ctrl+C 能立即退出
let isExiting = false

function setupSignalHandlers() {
  const gracefulExit = () => {
    if (isExiting) {
      return
    }

    isExiting = true

    consola.log('')
    print.info('👋 检测到用户中断，正在退出...')
    process.exit(0)
  }

  // 捕获 SIGINT (Ctrl+C)
  process.on('SIGINT', gracefulExit)

  // 捕获 SIGTERM
  process.on('SIGTERM', gracefulExit)

  // 捕获未处理的异常
  process.on('uncaughtException', (error) => {
    if (error.message && error.message.includes('SIGINT')) {
      gracefulExit()
    }
    else {
      consola.error('未捕获的异常:', error)
      process.exit(1)
    }
  })
}

// 选择镜像
async function selectImage() {
  const images = await getLocalImages()

  if (images.length === 0) {
    print.warning('没有找到可用的镜像')
    print.info('请先构建镜像：pnpm docker:build')

    const shouldBuild = await confirm('是否使用 Docker Compose 构建模式启动？')

    if (shouldBuild) {
      return null // 返回 null 表示使用构建模式
    }

    process.exit(1)
  }

  // 添加构建选项
  const choices = [
    {
      name: '🔨 使用 Docker Compose 构建模式 (推荐)',
      value: 'build',
    },
    ...images.map((img) => ({
      name: `📦 ${img.display}`,
      value: img.name,
    })),
  ]

  const selectedImage = await select('请选择启动方式：', choices)

  return selectedImage === 'build' ? null : selectedImage
}

// 使用指定镜像启动服务
async function startWithImage(imageName) {
  print.step(`🚀 使用镜像启动服务：${imageName}`)

  // 获取端口号
  const port = getPort()

  // 停止现有容器
  print.step('📦 停止现有容器...')
  await runCommand('docker stop nest-api-container 2>/dev/null || true')
  await runCommand('docker rm nest-api-container 2>/dev/null || true')

  // 使用绝对路径指定环境变量文件
  const envFilePath = join(PROJECT_ROOT, '.env')

  // 启动容器
  const dockerRunCommand = `docker run -d --name nest-api-container -p ${port}:${port} --env-file "${envFilePath}" ${imageName}`

  print.info(`执行命令：${dockerRunCommand}`)
  print.info(`环境变量文件：${envFilePath}`)

  const result = await runCommand(dockerRunCommand)

  if (!result.success) {
    print.error('容器启动失败')
    consola.log(result.stderr)

    return false
  }

  print.success('容器启动成功')

  return true
}

// 使用构建模式启动服务
async function startWithBuild() {
  print.step('🔨 使用 Docker Compose 构建模式启动服务')

  // 停止现有服务
  print.step('📦 停止现有服务...')
  await dockerCompose.down()

  // 构建并启动服务
  print.step('🔨 构建并启动服务...')
  const upResult = await dockerCompose.up()

  if (!upResult.success) {
    print.error('服务启动失败')
    consola.log(upResult.stderr)

    return false
  }

  return true
}

// 主菜单选择
async function selectMainAction() {
  const action = await select('请选择操作：', [
    {
      name: '🚀 启动服务 - 选择镜像或构建模式',
      value: 'start',
    },
    {
      name: '📋 列出镜像 - 查看可用的镜像',
      value: 'list',
    },
    {
      name: '❓ 显示帮助 - 查看命令行选项',
      value: 'help',
    },
  ])

  return action
}

// 显示帮助信息
function showHelp() {
  consola.log(`
${print.title('Docker 服务启动脚本')}

用法：node docker/scripts/start.mjs [选项]

选项：
  -i, --image <image>            指定要使用的镜像
  --build                        使用构建模式启动
  --list                         列出可用的镜像
  -h, --help                     显示帮助信息

启动示例：
  node docker/scripts/start.mjs                              # 主菜单选择
node docker/scripts/start.mjs --list                       # 列出可用镜像
node docker/scripts/start.mjs -i leokuchon/nest-api:1.2.3  # 使用指定镜像启动
node docker/scripts/start.mjs --build                      # 使用构建模式启动

npm 脚本：
  pnpm docker:start                           # 主菜单选择
  `)
}

// 列出镜像
async function listImages() {
  const images = await getLocalImages()

  if (images.length === 0) {
    print.info('没有找到可用的镜像')
    print.info('请先构建镜像：pnpm docker:build')
  }
  else {
    const tableOutput = formatImagesListTable(images, '可用镜像')

    if (tableOutput) {
      consola.log(tableOutput)
    }
  }
}

// 执行健康检查
async function performHealthCheck() {
  const port = getPort()

  // 等待容器启动
  print.step('⏳ 等待容器启动...')
  await sleep(3000)

  // 显示服务状态
  print.step('📊 服务状态：')

  // 检查 Docker Compose 服务状态
  const psResult = await dockerCompose.ps()

  if (psResult.success && psResult.stdout.trim()) {
    consola.log(psResult.stdout)
  }
  else {
    // 如果是使用镜像启动的，检查容器状态
    const containerResult = await runCommand('docker ps --filter name=nest-api-container --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"')

    if (containerResult.success) {
      consola.log(containerResult.stdout)
    }
  }

  // 健康检查 - 等待应用完全启动
  print.step('🔍 等待应用完全启动...')
  const healthResult = await healthCheck(`http://localhost:${port}`)

  if (healthResult.success) {
    consola.log('')
    print.success(`✅ 服务启动成功！访问地址：http://localhost:${port}`)
    consola.log('')
    print.title('🎉 部署成功！')
    print.info('📝 查看实时日志：')
    consola.log(`  Docker Compose：docker compose -f ${DOCKER_COMPOSE_FILE} logs -f app`)
    consola.log('  容器模式：docker logs -f nest-api-container')
    print.info('🛑 停止服务：pnpm docker:stop')
    print.info('📊 查看状态：pnpm docker:status')
  }
  else {
    // 如果超时，显示错误信息和日志
    consola.log('')
    print.error('❌ 服务启动超时，请检查以下信息：')
    consola.log('')

    print.step('📊 容器状态：')
    const psResult = await dockerCompose.ps()

    if (psResult.success && psResult.stdout.trim()) {
      consola.log(psResult.stdout)
    }

    const containerResult = await runCommand('docker ps -a --filter name=nest-api-container --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"')

    if (containerResult.success && containerResult.stdout.trim()) {
      consola.log(containerResult.stdout)
    }

    consola.log('')
    print.step('📝 最近的应用日志：')

    // 尝试获取 Docker Compose 日志
    const logsResult = await runCommand(`docker compose -f ${DOCKER_COMPOSE_FILE} logs --tail=20 app`)

    if (logsResult.success && logsResult.stdout.trim()) {
      consola.log(logsResult.stdout)
    }
    else {
      // 尝试获取容器日志
      const containerLogsResult = await runCommand('docker logs --tail=20 nest-api-container 2>/dev/null || echo "无法获取容器日志"')

      if (containerLogsResult.success) {
        consola.log(containerLogsResult.stdout)
      }
    }

    consola.log('')
    print.title('🔧 故障排除建议：')
    consola.log(`1. 检查端口是否被占用：lsof -i :${port}`)
    consola.log('2. 查看完整日志：')
    consola.log(`   - Docker Compose：docker compose -f ${DOCKER_COMPOSE_FILE} logs app`)
    consola.log('   - 容器模式：docker logs nest-api-container')
    consola.log(`3. 检查环境变量：docker compose -f ${DOCKER_COMPOSE_FILE} config`)
    consola.log(`4. 重新构建：docker compose -f ${DOCKER_COMPOSE_FILE} build --no-cache`)

    process.exit(1)
  }
}

async function main() {
  // 首先设置信号处理
  setupSignalHandlers()

  print.title('==========================================')
  print.title('            Docker 服务启动脚本')
  print.title('==========================================')
  consola.log('')

  // 配置命令行选项
  program
    .version('2.0.0')
    .option('-i, --image <image>', '指定要使用的镜像')
    .option('--build', '使用构建模式启动')
    .option('--list', '列出可用的镜像')
    .helpOption('-h, --help', '显示帮助信息')

  program.parse()
  const options = program.opts()

  // 检查根目录 .env 文件是否存在
  if (!checkFileExists('.env')) {
    print.error('❌ 错误：未找到根目录 .env 文件')
    consola.log('请确保项目根目录存在 .env 文件，或者从 .env.example 复制：')
    consola.log('cp .env.example .env')
    process.exit(1)
  }

  print.success('✅ 找到环境变量文件：.env')

  // 如果没有提供任何选项，显示主菜单
  // 检查用户是否提供了任何实际选项（排除默认值）
  const userOptions = { ...options }
  // 这里目前没有默认选项，但为了保持一致性和未来扩展性

  const hasUserOptions = Object.keys(userOptions).length > 0

  if (!hasUserOptions) {
    const action = await selectMainAction()

    if (action === 'start') {
      const selectedImage = await selectImage()

      let success = false

      if (selectedImage === null) {
        // 使用构建模式
        success = await startWithBuild()
      }
      else {
        // 使用指定镜像
        success = await startWithImage(selectedImage)
      }

      if (success) {
        await performHealthCheck()
      }
    }
    else if (action === 'list') {
      await listImages()
    }
    else if (action === 'help') {
      showHelp()
    }

    return
  }

  // 如果只是列出镜像
  if (options.list) {
    await listImages()

    return
  }

  // 如果指定了镜像
  if (options.image) {
    const success = await startWithImage(options.image)

    if (success) {
      await performHealthCheck()
    }

    return
  }

  // 如果使用构建模式
  if (options.build) {
    const success = await startWithBuild()

    if (success) {
      await performHealthCheck()
    }

    return
  }

  // 默认显示主菜单
  const selectedImage = await selectImage()

  let success = false

  if (selectedImage === null) {
    success = await startWithBuild()
  }
  else {
    success = await startWithImage(selectedImage)
  }

  if (success) {
    await performHealthCheck()
  }
}

main().catch((error) => {
  // 如果是用户中断（Ctrl+C），优雅退出
  if (error.message.includes('SIGINT') || error.message.includes('canceled')) {
    print.info('启动已取消')
    process.exit(0)
  }

  print.error(`启动失败：${error.message}`)
  consola.error(error.stack)
  process.exit(1)
})
