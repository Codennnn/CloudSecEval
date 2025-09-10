#!/usr/bin/env node

import { program } from 'commander'
import { consola } from 'consola'

import { confirm, docker, DOCKER_USERNAME, formatImagesTable, IMAGE_NAME, print, runCommand, select } from './utils.mjs'

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

// 检查命令是否存在
async function checkCommand(command) {
  const result = await runCommand(`which ${command}`)

  if (!result.success) {
    print.error(`${command} 命令未找到，请先安装 Docker`)
    process.exit(1)
  }
}

// 检查 Docker 登录状态
async function checkDockerLogin() {
  const infoResult = await docker.info()

  if (!infoResult.success || !infoResult.stdout.includes(`Username: ${DOCKER_USERNAME}`)) {
    print.warning('未登录到 Docker Hub 或登录用户不匹配')
    print.step('正在登录 Docker Hub...')

    try {
      await docker.login()
      print.success('已登录到 Docker Hub')
    }
    catch {
      print.error('Docker Hub 登录失败')
      process.exit(1)
    }
  }
  else {
    print.success(`已登录到 Docker Hub (用户: ${DOCKER_USERNAME})`)
  }
}

async function pushImage(tag) {
  print.step(`开始推送镜像：${tag}`)
  consola.log('')

  const startTime = Date.now()
  const result = await docker.push(tag)
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(1)

  if (result.success) {
    consola.log('')
    print.success(`✅ 镜像推送成功：${tag}`)
    print.info(`⏱️  推送耗时：${duration} 秒`)

    return true
  }
  else {
    consola.log('')
    print.error('❌ 镜像推送失败')
    print.error(`⏱️  失败耗时：${duration} 秒`)

    if (result.stderr) {
      consola.log(result.stderr)
    }

    return false
  }
}

// 获取本地镜像列表
async function getLocalImages() {
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
        const size = parts[6]

        images.push({
          name: `${repository}:${tag}`,
          repository,
          tag,
          imageId,
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
        const size = parts[6]

        if (repository === IMAGE_NAME) {
          images.push({
            name: `${repository}:${tag}`,
            repository,
            tag,
            imageId,
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

// 显示可发布镜像的表格
async function displayPublishableImages() {
  const images = await getLocalImages()

  if (images.length === 0) {
    print.info('没有找到可发布的镜像')
    print.info('请先构建镜像：pnpm docker:build')

    return
  }

  // 获取所有相关镜像的完整 Docker 输出
  const allResult = await docker.images()

  if (allResult.success) {
    const lines = allResult.stdout.split('\n')
    const imageNames = images.map((img) => img.name)

    // 过滤出可发布的镜像行
    const publishableLines = lines.filter((line, index) => {
      if (index === 0) {
        return true
      } // 保留表头

      const parts = line.split(/\s+/)

      if (parts.length >= 2) {
        const fullName = `${parts[0]}:${parts[1]}`

        return imageNames.includes(fullName)
      }

      return false
    })

    if (publishableLines.length > 1) {
      const formattedTable = formatImagesTable(publishableLines.join('\n'), '可发布的镜像')

      if (formattedTable) {
        consola.log(formattedTable)

        return
      }
    }
  }

  // 回退到原始显示方式
  print.step('📋 可发布的镜像：')
  images.forEach((img) => {
    consola.log(`  • ${img.display}`)
  })
}

// 选择要发布的镜像
async function selectImages() {
  const images = await getLocalImages()

  if (images.length === 0) {
    print.error('没有找到可发布的镜像')
    print.info('请先构建镜像：pnpm docker:build')
    process.exit(1)
  }

  print.step('📋 可发布的镜像：')
  images.forEach((img, index) => {
    consola.log(`  ${index + 1}. ${img.display}`)
  })

  const choices = images.map((img) => ({
    name: img.display,
    value: img.name,
  }))

  const selectedImages = await select('请选择要发布的镜像 (支持多选)：', choices)

  return Array.isArray(selectedImages) ? selectedImages : [selectedImages]
}

// 为本地镜像创建远程标签
async function tagLocalImage(localImage, remoteTag) {
  print.step(`为本地镜像创建远程标签：${localImage} -> ${remoteTag}`)

  const result = await runCommand(`docker tag ${localImage} ${remoteTag}`)

  if (result.success) {
    print.success(`标签创建成功：${remoteTag}`)

    return true
  }
  else {
    print.error(`标签创建失败：${result.stderr}`)

    return false
  }
}

// 清理本地镜像
async function cleanupImages(imagesToClean) {
  print.step('🗑️  清理本地镜像')

  const shouldCleanup = await confirm('是否删除本地构建的镜像？')

  if (shouldCleanup) {
    const results = []

    for (const image of imagesToClean) {
      const result = await docker.rmi([image])
      results.push({ image, success: result.success })
    }

    const successCount = results.filter((r) => r.success).length

    if (successCount > 0) {
      print.success(`已清理 ${successCount} 个镜像`)
    }

    const failedImages = results.filter((r) => !r.success).map((r) => r.image)

    if (failedImages.length > 0) {
      print.warning(`清理失败的镜像：${failedImages.join(', ')}`)
    }
  }
}

// 快速发布模式
async function quickPublish(images) {
  print.info('🚀 快速发布模式')

  const results = []

  for (const image of images) {
    const success = await pushImage(image)
    results.push({ image, success })
  }

  const successCount = results.filter((r) => r.success).length
  const failedImages = results.filter((r) => !r.success).map((r) => r.image)

  if (successCount === images.length) {
    print.success('🎉 所有镜像发布成功！')
    results.forEach(({ image }) => {
      print.info(`✅ ${image}`)
    })
  }
  else {
    print.error(`❌ 部分镜像发布失败：${failedImages.join(', ')}`)

    return false
  }

  return true
}

// 完整发布模式
async function fullPublish(images, options) {
  print.info('🔧 完整发布模式')
  print.info(`清理本地镜像：${options.cleanup ? '是' : '否'}`)
  consola.log('')

  // 显示要发布的镜像
  print.step('📋 将发布以下镜像：')
  images.forEach((image) => {
    consola.log(`  • ${image}`)
  })
  consola.log('')

  // 确认操作
  if (!options.force) {
    const shouldContinue = await confirm('确认发布这些镜像？')

    if (!shouldContinue) {
      print.warning('操作已取消')
      process.exit(0)
    }
  }

  // 检查 Docker 登录状态
  await checkDockerLogin()

  // 发布镜像
  const results = []

  for (const image of images) {
    const success = await pushImage(image)
    results.push({ image, success })
  }

  const successCount = results.filter((r) => r.success).length
  const failedImages = results.filter((r) => !r.success).map((r) => r.image)

  if (successCount === images.length) {
    print.success('🎉 所有镜像发布成功！')
    results.forEach(({ image }) => {
      print.info(`✅ ${image}`)
    })
  }
  else {
    print.error(`❌ 部分镜像发布失败：${failedImages.join(', ')}`)

    return false
  }

  // 清理本地镜像
  if (options.cleanup) {
    await cleanupImages(images)
  }

  consola.log('')
  print.title('🎉 发布完成！')
  print.info('使用方法：')
  results.forEach(({ image }) => {
    consola.log(`  docker pull ${image}`)
  })

  return true
}

// 交互式发布流程
async function interactivePublish() {
  print.title('🎯 交互式发布流程')

  // 1. 选择镜像
  const selectedImages = await selectImages()

  // 2. 处理本地镜像（需要创建远程标签）
  const imagesToPublish = []
  const localImages = await getLocalImages()

  for (const imageName of selectedImages) {
    const imageInfo = localImages.find((img) => img.name === imageName)

    if (imageInfo && imageInfo.isLocal) {
      // 本地镜像需要创建远程标签
      const remoteTag = `${DOCKER_USERNAME}/${IMAGE_NAME}:${imageInfo.tag}`
      const tagSuccess = await tagLocalImage(imageName, remoteTag)

      if (tagSuccess) {
        imagesToPublish.push(remoteTag)
      }
    }
    else {
      // 已经是远程标签
      imagesToPublish.push(imageName)
    }
  }

  if (imagesToPublish.length === 0) {
    print.error('没有可发布的镜像')

    return false
  }

  // 3. 选择发布模式
  const publishMode = await select('请选择发布模式：', [
    {
      name: '🚀 快速发布 - 直接推送，无额外确认',
      value: 'quick',
    },
    {
      name: '🔧 完整发布 - 包含确认和清理选项',
      value: 'full',
    },
  ])

  // 4. 执行发布
  if (publishMode === 'quick') {
    return await quickPublish(imagesToPublish)
  }
  else {
    const cleanup = await confirm('发布后是否清理本地镜像？')

    return await fullPublish(imagesToPublish, {
      cleanup,
      force: false,
    })
  }
}

// 主菜单选择
async function selectMainAction() {
  const action = await select('请选择要执行的操作：', [
    {
      name: '🚀 发布镜像 - 交互式发布流程',
      value: 'publish',
    },
    {
      name: '📋 列出镜像 - 查看可发布的镜像',
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
${print.title('Docker 镜像发布脚本')}

用法：node docker/scripts/publish.mjs [选项]

发布模式：
  --quick                        快速发布模式
  --full                         完整发布模式

选项：
  -i, --image <image>            指定要发布的镜像
  -c, --cleanup                  发布后清理本地镜像
  -f, --force                    跳过确认提示
  --list                         列出可发布的镜像
  --interactive                  交互式发布
  -h, --help                     显示帮助信息

发布示例：
  node docker/scripts/publish.mjs                                    # 主菜单选择
node docker/scripts/publish.mjs --list                             # 列出可发布的镜像
node docker/scripts/publish.mjs -i leokuchon/nest-api:1.2.3       # 发布指定镜像
node docker/scripts/publish.mjs --quick -i leokuchon/nest-api:1.2.3  # 快速发布
node docker/scripts/publish.mjs --full -i leokuchon/nest-api:1.2.3 -c  # 完整发布并清理

npm 脚本：
  pnpm docker:publish                                 # 主菜单选择
  pnpm docker:publish --list                          # 列出可发布的镜像
  `)
}

async function main() {
  // 首先设置信号处理
  setupSignalHandlers()

  print.title('==========================================')
  print.title('             Docker 镜像发布脚本')
  print.title('==========================================')
  consola.log('')

  // 配置命令行选项
  program
    .version('3.0.0')
    .option('--quick', '快速发布模式')
    .option('--full', '完整发布模式')
    .option('-i, --image <image>', '指定要发布的镜像', (value, previous) => {
      return previous ? previous.concat([value]) : [value]
    })
    .option('-c, --cleanup', '发布后清理本地镜像')
    .option('-f, --force', '跳过确认提示')
    .option('--list', '列出可发布的镜像')
    .option('--interactive', '交互式发布')
    .helpOption('-h, --help', '显示帮助信息')

  program.parse()
  const options = program.opts()

  // 检查必要命令
  await checkCommand('docker')
  await checkCommand('node')

  // 如果没有提供任何选项，显示主菜单
  // 检查用户是否提供了任何实际选项（排除默认值）
  const userOptions = { ...options }
  // 这里目前没有默认选项，但为了保持一致性和未来扩展性

  const hasUserOptions = Object.keys(userOptions).length > 0

  if (!hasUserOptions) {
    const action = await selectMainAction()

    if (action === 'publish') {
      const success = await interactivePublish()

      if (success) {
        print.title('🎉 发布完成！')

        // 显示后续操作建议
        print.info('后续操作：')
        consola.log('  📋 查看镜像：pnpm docker:build --list')
        consola.log('  🧪 拉取镜像：docker pull <镜像名>')
        consola.log('  🚀 运行镜像：docker run -p 8000:8000 --env-file .env <镜像名>')
      }
    }
    else if (action === 'list') {
      await displayPublishableImages()
    }
    else if (action === 'help') {
      showHelp()
    }

    return
  }

  // 如果只是列出镜像
  if (options.list) {
    await displayPublishableImages()

    return
  }

  // 如果是交互式模式
  if (options.interactive) {
    const success = await interactivePublish()

    if (success) {
      print.title('🎉 发布完成！')
    }

    return
  }

  // 确定要发布的镜像
  let imagesToPublish = options.image || []

  if (imagesToPublish.length === 0) {
    print.error('请指定要发布的镜像')
    print.info('使用 --list 查看可发布的镜像')
    process.exit(1)
  }

  // 验证镜像是否存在
  const localImages = await getLocalImages()
  const availableImages = localImages.map((img) => img.name)

  const invalidImages = imagesToPublish.filter((img) => !availableImages.includes(img))

  if (invalidImages.length > 0) {
    print.error(`镜像不存在：${invalidImages.join(', ')}`)
    print.info('使用 --list 查看可发布的镜像')
    process.exit(1)
  }

  // 处理本地镜像标签
  const finalImages = []

  for (const imageName of imagesToPublish) {
    const imageInfo = localImages.find((img) => img.name === imageName)

    if (imageInfo && imageInfo.isLocal) {
      // 本地镜像需要创建远程标签
      const remoteTag = `${DOCKER_USERNAME}/${IMAGE_NAME}:${imageInfo.tag}`
      const tagSuccess = await tagLocalImage(imageName, remoteTag)

      if (tagSuccess) {
        finalImages.push(remoteTag)
      }
    }
    else {
      finalImages.push(imageName)
    }
  }

  // 确定发布模式
  const publishMode = options.quick ? 'quick' : 'full'

  // 执行发布
  let success = false

  if (publishMode === 'quick') {
    success = await quickPublish(finalImages)
  }
  else {
    success = await fullPublish(finalImages, {
      cleanup: options.cleanup || false,
      force: options.force || false,
    })
  }

  if (success) {
    consola.log('')
    print.title('🎉 发布完成！')

    // 显示后续操作建议
    print.info('后续操作：')
    consola.log('  📋 查看镜像：pnpm docker:build --list')
    consola.log('  🧪 拉取镜像：docker pull <镜像名>')
    consola.log('  🚀 运行镜像：docker run -p 8000:8000 --env-file .env <镜像名>')
  }
  else {
    process.exit(1)
  }
}

main().catch((error) => {
  // 如果是用户中断（Ctrl+C），优雅退出
  if (error.message.includes('SIGINT') || error.message.includes('canceled')) {
    print.info('发布已取消')
    process.exit(0)
  }

  print.error(`发布失败：${error.message}`)
  consola.error(error.stack)
  process.exit(1)
})
