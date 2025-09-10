#!/usr/bin/env node

import { spawn } from 'child_process'
import { program } from 'commander'
import { consola } from 'consola'

import { confirm, docker, DOCKER_USERNAME, formatImagesTable, getPackageVersion, IMAGE_NAME, input, print, runCommand, runCommandWithProgressOutput, select, showBuildProgress } from './utils.mjs'

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

// 构建模式枚举
const BUILD_MODES = {
  LOCAL: 'local',
  TAGGED: 'tagged',
  MULTI: 'multi',
}

// 支持的平台架构
const PLATFORMS = {
  'linux/amd64': 'AMD64 (x86_64) - 标准服务器架构',
  'linux/arm64': 'ARM64 (aarch64) - Apple Silicon, ARM 服务器',
  'linux/arm/v7': 'ARM v7 - 树莓派等 ARM 设备',
  'linux/amd64,linux/arm64': '多架构 - AMD64 + ARM64',
  'linux/amd64,linux/arm64,linux/arm/v7': '全平台 - 支持所有主流架构',
}

// 检查命令是否存在
async function checkCommand(command) {
  const result = await runCommand(`which ${command}`)

  if (!result.success) {
    print.error(`${command} 命令未找到，请先安装 Docker`)
    process.exit(1)
  }
}

// 检查 Docker Buildx 支持
async function checkBuildx() {
  const result = await runCommand('docker buildx version')

  if (result.success) {
    print.success('Docker Buildx 可用，支持多平台构建')

    return true
  }

  print.warning('Docker Buildx 未安装，将使用传统构建方式')

  return false
}

// 构建镜像 - 静默模式
async function buildImage(tag, options = {}) {
  // 检查是否正在退出
  if (isExiting) {
    throw new Error('User interrupted')
  }

  const { platform, dockerfile = 'docker/Dockerfile', push = false, buildx = false } = options

  print.step(`构建镜像：${tag}`)

  if (platform) {
    print.info(`目标平台：${platform}`)
  }

  let command

  if (buildx && platform) {
    // 使用 buildx 进行多平台构建
    command = `docker buildx build --platform ${platform} -t ${tag} -f ${dockerfile} ${push ? '--push' : '--load'} .`
  }
  else {
    // 传统构建方式
    command = `docker build -t ${tag} -f ${dockerfile} .`
  }

  print.info(`执行命令：${command}`)

  // 显示构建进度指示器
  const progressSpinner = showBuildProgress('Docker 镜像构建中')

  try {
    const result = await runCommand(command)
    progressSpinner.stop()

    if (result.success) {
      print.success(`镜像构建成功：${tag}`)

      return true
    }
    else {
      print.error('镜像构建失败')
      consola.log(result.stderr)

      return false
    }
  }
  catch (error) {
    progressSpinner.stop()

    if (error.message && error.message.includes('User interrupted')) {
      throw error // 重新抛出中断错误
    }

    print.error('镜像构建失败')
    consola.error(error.message)

    return false
  }
}

// 构建镜像 - 实时输出模式
async function buildImageWithRealtime(tag, options = {}) {
  // 检查是否正在退出
  if (isExiting) {
    throw new Error('User interrupted')
  }

  const { platform, dockerfile = 'docker/Dockerfile', push = false, buildx = false } = options

  print.step(`构建镜像：${tag}`)

  if (platform) {
    print.info(`目标平台：${platform}`)
  }

  let command
  let args

  if (buildx && platform) {
    // 使用 buildx 进行多平台构建
    command = 'docker'
    args = ['buildx', 'build', '--platform', platform, '-t', tag, '-f', dockerfile, push ? '--push' : '--load', '.']
  }
  else {
    // 传统构建方式
    command = 'docker'
    args = ['build', '-t', tag, '-f', dockerfile, '.']
  }

  print.info(`执行命令：${command} ${args.join(' ')}`)

  // 显示构建开始提示
  print.step('开始构建，请稍候...')
  consola.log('')

  try {
    // 使用带实时输出的命令执行
    await runCommandWithProgressOutput(command, args)

    consola.log('')
    print.success(`镜像构建成功：${tag}`)

    return true
  }
  catch (error) {
    if (error.message && error.message.includes('User interrupted')) {
      throw error // 重新抛出中断错误
    }

    consola.log('')
    print.error('镜像构建失败')

    if (error.message) {
      consola.error(error.message)
    }

    return false
  }
}

// 构建镜像 - 进度模式
async function buildImageWithProgress(tag, options = {}) {
  const { platform, dockerfile = 'docker/Dockerfile', push = false, buildx = false } = options

  print.step(`构建镜像：${tag}`)

  if (platform) {
    print.info(`目标平台: ${platform}`)
  }

  let command
  let args

  if (buildx && platform) {
    command = 'docker'
    args = ['buildx', 'build', '--platform', platform, '-t', tag, '-f', dockerfile, '--progress=plain', push ? '--push' : '--load', '.']
  }
  else {
    command = 'docker'
    args = ['build', '-t', tag, '-f', dockerfile, '--progress=plain', '.']
  }

  print.info(`执行命令：${command} ${args.join(' ')}`)

  // 显示构建开始提示
  print.step('开始构建，请稍候...')
  consola.log('')

  // 创建进度指示器
  const progressSpinner = showBuildProgress('Docker 镜像构建中')
  let hasOutput = false

  try {
    await new Promise((resolve, reject) => {
      // 检查是否正在退出
      if (isExiting) {
        reject(new Error('User interrupted'))

        return
      }

      const child = spawn(command, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
      })

      let buildSteps = []
      let currentStep = 0

      // 处理用户中断
      const handleInterrupt = () => {
        if (child && !child.killed) {
          child.kill('SIGINT')
        }

        reject(new Error('User interrupted'))
      }

      // 监听全局中断状态
      const checkExitInterval = setInterval(() => {
        if (isExiting) {
          clearInterval(checkExitInterval)
          handleInterrupt()
        }
      }, 100)

      child.stdout.on('data', (data) => {
        if (!hasOutput) {
          progressSpinner.stop()
          hasOutput = true
        }

        const output = data.toString()

        // 解析构建步骤
        const stepMatch = output.match(/^#(\d+) (.+)$/m)

        if (stepMatch) {
          currentStep = parseInt(stepMatch[1])
          const stepDescription = stepMatch[2]
          buildSteps[currentStep] = stepDescription

          print.step(`步骤 ${currentStep}：${stepDescription}`)
        }

        // 显示其他重要信息
        if (output.includes('COPY') || output.includes('RUN') || output.includes('FROM')) {
          process.stdout.write(output)
        }
      })

      child.stderr.on('data', (data) => {
        if (!hasOutput) {
          progressSpinner.stop()
          hasOutput = true
        }

        process.stderr.write(data.toString())
      })

      child.on('close', (code) => {
        clearInterval(checkExitInterval)

        if (!hasOutput) {
          progressSpinner.stop()
        }

        if (code === 0) {
          resolve({ success: true, code })
        }
        else {
          reject(new Error(`Command failed with code ${code}`))
        }
      })

      child.on('error', (error) => {
        clearInterval(checkExitInterval)

        if (!hasOutput) {
          progressSpinner.stop()
        }

        reject(error)
      })
    })

    consola.log('')
    print.success(`镜像构建成功: ${tag}`)

    return true
  }
  catch (error) {
    if (!hasOutput) {
      progressSpinner.stop()
    }

    consola.log('')
    print.error('镜像构建失败')

    if (error.message) {
      consola.error(error.message)
    }

    return false
  }
}

// 获取版本号
async function getVersionInteractive(currentVersion) {
  const useDefault = await confirm(`使用当前版本 ${currentVersion}？`)

  if (useDefault) {
    return currentVersion
  }

  const customVersion = await input('请输入版本号：', currentVersion)

  if (!customVersion.trim()) {
    print.error('版本号不能为空')
    process.exit(1)
  }

  return customVersion.trim()
}

// 选择平台架构
async function selectPlatform() {
  const platformChoices = Object.entries(PLATFORMS).map(([value, name]) => ({
    name: `${value} - ${name}`,
    value,
  }))

  const platform = await select('请选择目标平台：', platformChoices)

  return platform
}

// 输入自定义标签
async function getCustomTags() {
  const tags = []

  while (true) {
    const tag = await input('请输入自定义标签 (回车结束):', '')

    if (!tag.trim()) {
      break
    }

    tags.push(tag.trim())
    print.success(`已添加标签：${tag.trim()}`)
  }

  return tags
}

// 本地构建模式
async function localBuild(options = {}) {
  print.info('🏠 本地构建模式')

  let tag = options.tag

  if (!tag) {
    tag = await input('请输入镜像标签：', `${IMAGE_NAME}:local`)
  }

  const buildOptions = {
    dockerfile: options.dockerfile,
    platform: options.platform,
    buildx: options.buildx,
  }

  // 选择构建函数
  const buildFunction = options.buildFunction || buildImage
  const success = await buildFunction(tag, buildOptions)

  if (success) {
    print.success('🎉 本地构建完成！')
    print.info(`本地镜像：${tag}`)
    print.info(`运行方法：docker run -p 8000:8000 --env-file .env ${tag}`)
  }

  return success
}

// 带标签构建模式
async function taggedBuild(version, options = {}) {
  print.info(`🏷️  带标签构建模式 - 版本：${version}`)

  const versionTag = `${DOCKER_USERNAME}/${IMAGE_NAME}:${version}`
  const tags = [versionTag]

  // 如果需要构建 latest 标签
  if (options.latest) {
    const latestTag = `${DOCKER_USERNAME}/${IMAGE_NAME}:latest`
    tags.push(latestTag)
  }

  print.info(`将构建标签：${tags.join(', ')}`)

  const buildOptions = {
    dockerfile: options.dockerfile,
    platform: options.platform,
    buildx: options.buildx,
  }

  // 选择构建函数
  const buildFunction = options.buildFunction || buildImage
  const results = []

  for (const tag of tags) {
    const success = await buildFunction(tag, buildOptions)
    results.push({ tag, success })
  }

  const successCount = results.filter((r) => r.success).length
  const failedTags = results.filter((r) => !r.success).map((r) => r.tag)

  if (successCount === tags.length) {
    print.success('🎉 所有镜像构建完成！')
    results.forEach(({ tag }) => {
      print.info(`✅ ${tag}`)
    })
  }
  else {
    print.error(`❌ 部分镜像构建失败：${failedTags.join(', ')}`)

    return false
  }

  return true
}

// 多标签构建模式
async function multiBuild(version, customTags, options = {}) {
  print.info('🎯 多标签构建模式')

  const versionTag = `${DOCKER_USERNAME}/${IMAGE_NAME}:${version}`
  const tags = [versionTag, ...customTags]

  print.info(`将构建标签：${tags.join(', ')}`)

  const buildOptions = {
    dockerfile: options.dockerfile,
    platform: options.platform,
    buildx: options.buildx,
  }

  // 选择构建函数
  const buildFunction = options.buildFunction || buildImage
  const results = []

  for (const tag of tags) {
    const success = await buildFunction(tag, buildOptions)
    results.push({ tag, success })
  }

  const successCount = results.filter((r) => r.success).length
  const failedTags = results.filter((r) => !r.success).map((r) => r.tag)

  if (successCount === tags.length) {
    print.success('🎉 所有镜像构建完成！')
    results.forEach(({ tag }) => {
      print.info(`✅ ${tag}`)
    })
  }
  else {
    print.error(`❌ 部分镜像构建失败：${failedTags.join(', ')}`)

    return false
  }

  return true
}

// 交互式模式选择
async function selectBuildMode() {
  const mode = await select('请选择构建模式：', [
    {
      name: '🏠 本地构建 - 构建本地测试镜像',
      value: BUILD_MODES.LOCAL,
    },
    {
      name: '🏷️  带标签构建 - 构建带版本标签的镜像',
      value: BUILD_MODES.TAGGED,
    },
    {
      name: '🎯 多标签构建 - 构建多个自定义标签',
      value: BUILD_MODES.MULTI,
    },
  ])

  return mode
}

// 列出本地镜像
async function listImages() {
  const result = await docker.images(`reference=${DOCKER_USERNAME}/${IMAGE_NAME}`)

  if (result.success && result.stdout.trim()) {
    const formattedTable = formatImagesTable(result.stdout, '远程标签镜像')

    if (formattedTable) {
      consola.log(formattedTable)
    }
    else {
      print.step('📋 项目相关镜像列表：')
      consola.log(result.stdout)
    }
  }
  else {
    print.info('没有找到远程标签镜像')
  }

  // 也显示本地构建的镜像
  const localResult = await docker.images(`reference=${IMAGE_NAME}`)

  if (localResult.success && localResult.stdout.trim()) {
    const formattedTable = formatImagesTable(localResult.stdout, '本地构建镜像')

    if (formattedTable) {
      consola.log(formattedTable)
    }
    else {
      consola.log('')
      print.step('📋 本地构建镜像：')
      consola.log(localResult.stdout)
    }
  }

  // 显示所有 nest-api 相关的镜像
  const allResult = await docker.images()

  if (allResult.success) {
    const lines = allResult.stdout.split('\n')
    const nestApiImages = lines.filter((line) =>
      line.includes('nest-api') || line.includes('nest_api'),
    )

    if (nestApiImages.length > 0) {
      const nestApiOutput = [lines[0], ...nestApiImages].join('\n') // 包含表头
      const formattedTable = formatImagesTable(nestApiOutput, '所有相关镜像')

      if (formattedTable) {
        consola.log(formattedTable)
      }
      else {
        consola.log('')
        print.step('📋 所有相关镜像：')
        consola.log(nestApiImages.join('\n'))
      }
    }
  }
}

// 清理镜像
async function cleanupImages() {
  print.step('🗑️  清理镜像')

  const shouldCleanup = await confirm('是否清理未使用的镜像？')

  if (shouldCleanup) {
    print.step('清理悬空镜像...')
    const pruneResult = await runCommand('docker image prune -f')

    if (pruneResult.success) {
      print.success('悬空镜像已清理')
    }

    const shouldCleanupAll = await confirm('是否清理所有未使用的镜像？')

    if (shouldCleanupAll) {
      print.step('清理所有未使用的镜像...')
      const pruneAllResult = await runCommand('docker image prune -a -f')

      if (pruneAllResult.success) {
        print.success('所有未使用的镜像已清理')
      }
    }
  }
}

// 交互式构建流程
async function interactiveBuild() {
  print.title('🎯 交互式构建流程')

  // 1. 选择构建模式
  const buildMode = await selectBuildMode()

  // 2. 选择输出模式
  const outputMode = await select('请选择构建输出模式：', [
    {
      name: '📺 实时输出 - 显示完整的构建日志',
      value: 'realtime',
    },
    {
      name: '📊 进度模式 - 显示构建步骤和进度',
      value: 'progress',
    },
    {
      name: '🔇 静默模式 - 最小化输出，仅显示旋转指示器',
      value: 'silent',
    },
  ])

  // 3. 获取版本号（如果需要）
  let version

  if (buildMode !== BUILD_MODES.LOCAL) {
    const currentVersion = getPackageVersion()

    if (currentVersion) {
      version = await getVersionInteractive(currentVersion)
    }
    else {
      version = await input('请输入版本号：', '1.0.0')
    }
  }

  // 4. 选择平台架构
  const usePlatform = await confirm('是否指定目标平台架构？')
  let platform

  if (usePlatform) {
    platform = await selectPlatform()
  }

  // 5. 其他选项
  const options = {
    platform,
    buildx: usePlatform, // 只要指定了平台就使用 buildx
  }

  // 根据输出模式选择构建函数
  if (outputMode === 'progress') {
    options.buildFunction = buildImageWithProgress
  }
  else if (outputMode === 'realtime') {
    options.buildFunction = buildImageWithRealtime
  }
  else {
    options.buildFunction = buildImage // 静默模式
  }

  if (buildMode === BUILD_MODES.TAGGED) {
    options.latest = await confirm('是否同时构建 latest 标签？')
  }

  // 6. 执行构建
  let success = false

  if (buildMode === BUILD_MODES.LOCAL) {
    success = await localBuild(options)
  }
  else if (buildMode === BUILD_MODES.TAGGED) {
    success = await taggedBuild(version, options)
  }
  else if (buildMode === BUILD_MODES.MULTI) {
    const customTags = await getCustomTags()

    if (customTags.length === 0) {
      print.error('多标签构建需要至少一个自定义标签')

      return false
    }

    success = await multiBuild(version, customTags, options)
  }

  return success
}

// 主菜单选择
async function selectMainAction() {
  const action = await select('请选择要执行的操作：', [
    {
      name: '🏗️  构建镜像 - 交互式构建流程',
      value: 'build',
    },
    {
      name: '📋 列出镜像 - 查看本地镜像列表',
      value: 'list',
    },
    {
      name: '🗑️  清理镜像 - 清理未使用的镜像',
      value: 'cleanup',
    },
    {
      name: '❓ 显示帮助 - 查看命令行选项',
      value: 'help',
    },
    {
      name: '🚪 退出程序',
      value: 'exit',
    },
  ])

  return action
}

// 交互式模式主循环
async function runInteractiveMode() {
  while (true) {
    consola.log('')
    const action = await selectMainAction()

    if (action === 'build') {
      const success = await interactiveBuild()

      if (success) {
        print.title('🎉 构建完成！')

        // 显示后续操作建议
        print.info('后续操作：')
        consola.log('  📋 查看镜像：pnpm docker:build --list')
        consola.log('  🚀 发布镜像：pnpm docker:publish')
        consola.log('  🧪 本地测试：docker run -p 8000:8000 --env-file .env <镜像名>')
        consola.log('  🗑️  清理镜像：pnpm docker:build --cleanup')
      }
    }
    else if (action === 'list') {
      await listImages()
    }
    else if (action === 'cleanup') {
      await cleanupImages()
    }
    else if (action === 'help') {
      showHelp()
    }
    else if (action === 'exit') {
      print.info('👋 再见！')
      break
    }

    // 如果不是退出，则继续循环显示主菜单
    if (action !== 'exit') {
      consola.log('')
      print.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      print.info('✨ 操作完成，请继续选择下一步操作')
    }
  }
}

// 显示帮助信息
function showHelp() {
  consola.log(`
${print.title('Docker 镜像构建脚本')}

用法：node docker/scripts/build.mjs [选项]

🎯 交互式模式 (推荐)：
  node docker/scripts/build.mjs                             # 进入交互式主菜单
  - 支持连续执行多个操作
  - 执行完成后自动回到主菜单
  - 包含构建、列出、清理、帮助等功能

构建模式：
  --local                        本地构建模式
  --tagged                       带标签构建模式
  --multi                        多标签构建模式

选项：
  -v, --ver <version>        指定版本号
  -t, --tag <tag>                指定自定义标签
  -l, --latest                   同时构建 latest 标签
  -p, --platform <platform>      指定目标平台架构
  -f, --dockerfile <dockerfile>  指定 Dockerfile 路径
  --list                         列出本地镜像
  --cleanup                      清理未使用的镜像
  --interactive                  交互式构建
  -h, --help                     显示帮助信息

支持的平台架构：
  linux/amd64                    AMD64 (x86_64) - 标准服务器架构
  linux/arm64                    ARM64 (aarch64) - Apple Silicon, ARM 服务器
  linux/arm/v7                   ARM v7 - 树莓派等 ARM 设备
  linux/amd64,linux/arm64        多架构 - AMD64 + ARM64
  linux/amd64,linux/arm64,linux/arm/v7  全平台 - 支持所有主流架构

构建示例：
  node docker/scripts/build.mjs                             # 交互式主菜单 (推荐)
node docker/scripts/build.mjs --local                     # 本地构建
node docker/scripts/build.mjs --tagged -v 1.2.3          # 带标签构建
node docker/scripts/build.mjs --tagged -v 1.2.3 -l       # 构建版本和 latest 标签
node docker/scripts/build.mjs --tagged -v 1.2.3 -p linux/amd64,linux/arm64  # 多平台构建
node docker/scripts/build.mjs --list                      # 列出镜像
node docker/scripts/build.mjs --cleanup                   # 清理镜像

npm 脚本：
  pnpm docker:build                          # 交互式主菜单 (推荐)
  pnpm docker:build --local                  # 本地构建
  pnpm docker:build --tagged                 # 带标签构建
  pnpm docker:build --list                   # 列出镜像

✨ 新功能特点：
  • 🔄 连续操作：执行完一个操作后自动回到主菜单
  • 🚪 简洁退出：只需选择"退出程序"即可退出
  • 📋 无缝切换：在列出镜像、清理镜像、显示帮助间自由切换
  • 💡 流畅体验：无需额外确认，操作更加流畅
  • 📺 多种输出模式：支持实时输出、进度模式、静默模式
  • ⚡ 构建进度提示：不再担心程序卡顿，清晰显示构建状态
  `)
}

async function main() {
  // 首先设置信号处理
  setupSignalHandlers()

  print.title('==========================================')
  print.title('            Docker 镜像构建脚本')
  print.title('==========================================')
  consola.log('')

  // 配置命令行选项
  program
    .version('1.0.0')
    .option('--local', '本地构建模式')
    .option('--tagged', '带标签构建模式')
    .option('--multi', '多标签构建模式')
    .option('-v, --ver <version>', '指定版本号')
    .option('-t, --tag <tag>', '指定自定义标签')
    .option('-l, --latest', '同时构建 latest 标签')
    .option('-p, --platform <platform>', '指定目标平台架构')
    .option('-f, --dockerfile <dockerfile>', '指定 Dockerfile 路径', 'docker/Dockerfile')
    .option('--list', '列出本地镜像')
    .option('--cleanup', '清理未使用的镜像')
    .option('--interactive', '交互式构建')
    .helpOption('-h, --help', '显示帮助信息')

  program.parse()
  const options = program.opts()

  // 检查必要命令
  await checkCommand('docker')
  await checkCommand('node')

  // 检查 buildx 支持
  const buildxSupported = await checkBuildx()

  // 如果没有提供任何选项，显示主菜单
  // 排除默认选项，只检查用户显式提供的选项
  const userOptions = { ...options }
  delete userOptions.dockerfile // 这是默认选项

  const hasUserOptions = Object.keys(userOptions).length > 0

  if (!hasUserOptions) {
    await runInteractiveMode()

    return
  }

  // 如果只是列出镜像
  if (options.list) {
    await listImages()

    return
  }

  // 如果只是清理镜像
  if (options.cleanup) {
    await cleanupImages()

    return
  }

  // 如果是交互式模式
  if (options.interactive) {
    const success = await interactiveBuild()

    if (success) {
      print.title('🎉 构建完成！')
    }

    return
  }

  // 获取版本号
  let version = options.ver

  if (!version && (options.tagged || options.multi)) {
    version = getPackageVersion()

    if (!version) {
      print.error('无法获取版本号，请手动指定')
      process.exit(1)
    }
  }

  // 确定构建模式
  let buildMode

  const modeCount = [options.local, options.tagged, options.multi].filter(Boolean).length

  if (modeCount > 1) {
    print.error('不能同时指定多个构建模式')
    process.exit(1)
  }
  else if (options.local) {
    buildMode = BUILD_MODES.LOCAL
  }
  else if (options.tagged) {
    buildMode = BUILD_MODES.TAGGED
  }
  else if (options.multi) {
    buildMode = BUILD_MODES.MULTI
  }

  // 构建选项
  const buildOptions = {
    platform: options.platform,
    dockerfile: options.dockerfile,
    buildx: buildxSupported && options.platform, // 只要指定了平台且支持 buildx 就使用
  }

  // 根据模式执行构建
  let success = false

  if (buildMode === BUILD_MODES.LOCAL) {
    success = await localBuild({ ...buildOptions, tag: options.tag })
  }
  else if (buildMode === BUILD_MODES.TAGGED) {
    if (!version) {
      print.error('带标签构建需要指定版本号')
      process.exit(1)
    }

    success = await taggedBuild(version, { ...buildOptions, latest: options.latest })
  }
  else if (buildMode === BUILD_MODES.MULTI) {
    if (!version) {
      print.error('多标签构建需要指定版本号')
      process.exit(1)
    }

    const customTags = options.tag ? [options.tag] : []

    if (customTags.length === 0) {
      print.error('多标签构建需要至少指定一个自定义标签 (-t)')
      process.exit(1)
    }

    success = await multiBuild(version, customTags, buildOptions)
  }

  if (success) {
    consola.log('')
    print.title('🎉 构建完成！')

    // 显示后续操作建议
    print.info('后续操作：')
    consola.log('  📋 查看镜像：pnpm docker:build --list')
    consola.log('  🚀 发布镜像：pnpm docker:publish')
    consola.log('  🧪 本地测试：docker run -p 8000:8000 --env-file .env <镜像名>')
    consola.log('  🗑️  清理镜像：pnpm docker:build --cleanup')
  }
  else {
    process.exit(1)
  }
}

main().catch((error) => {
  // 如果是用户中断（Ctrl+C），优雅退出
  if (error.message.includes('SIGINT') || error.message.includes('canceled')) {
    print.info('构建已取消')
    process.exit(0)
  }

  print.error(`构建失败：${error.message}`)
  consola.error(error.stack)
  process.exit(1)
})
