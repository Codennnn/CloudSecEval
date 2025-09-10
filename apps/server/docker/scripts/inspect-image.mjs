#!/usr/bin/env node

import { program } from 'commander'
import { consola } from 'consola'
import inquirer from 'inquirer'

import { formatImagesTable, print, runCommand } from './utils.mjs'

// 获取所有镜像列表
async function getImageList() {
  const result = await runCommand('docker images --format "{{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}"')

  if (!result.success) {
    print.error('❌ 无法获取镜像列表')

    return []
  }

  const lines = result.stdout.trim().split('\n')
  const images = []

  for (const line of lines) {
    const parts = line.split('\t')
    const imageName = parts[0]
    const imageId = parts[1]
    const size = parts[2]

    if (imageName && !imageName.includes('<none>')) {
      // 获取架构信息
      const archResult = await runCommand(`docker inspect "${imageName}" --format='{{.Os}}/{{.Architecture}}'`)
      const arch = archResult.success ? archResult.stdout.trim() : 'unknown'

      images.push({
        name: imageName,
        id: imageId,
        size: size,
        arch: arch,
        display: `${imageName} (${arch}, ${size})`,
      })
    }
  }

  return images
}

// 交互式选择镜像
async function selectImage() {
  print.step('🔍 获取镜像列表...')

  const images = await getImageList()

  if (images.length === 0) {
    print.info('没有找到本地镜像')

    return null
  }

  consola.log('')
  print.info('📋 找到以下镜像：')

  const choices = images.map((img) => ({
    name: img.display,
    value: img.name,
  }))

  // 添加退出选项
  choices.push({
    name: '🚪 退出',
    value: null,
  })

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedImage',
      message: '请选择要查看的镜像：',
      choices: choices,
      pageSize: 10,
    },
  ])

  return answers.selectedImage
}

// 交互式模式主循环
async function interactiveMode() {
  while (true) {
    const selectedImage = await selectImage()

    if (!selectedImage) {
      print.info('👋 已退出程序')
      break
    }

    await inspectImage(selectedImage)

    // 询问是否继续
    consola.log('')
    const continueAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: '是否继续查看其他镜像?',
        default: true,
      },
    ])

    if (!continueAnswer.continue) {
      print.info('👋 已退出程序')
      break
    }

    consola.log('')
  }
}

// 查看镜像架构信息
async function inspectImage(imageName) {
  print.step(`🔍 查看镜像架构信息：${imageName}`)

  // 检查镜像是否存在
  const existsResult = await runCommand(`docker inspect ${imageName} > /dev/null 2>&1`)

  if (!existsResult.success) {
    print.error(`❌ 镜像不存在：${imageName}`)

    return false
  }

  // 获取基本信息
  const archResult = await runCommand(`docker inspect ${imageName} --format='{{.Architecture}}'`)
  const osResult = await runCommand(`docker inspect ${imageName} --format='{{.Os}}'`)
  const platformResult = await runCommand(`docker inspect ${imageName} --format='{{.Os}}/{{.Architecture}}'`)
  const sizeResult = await runCommand(`docker inspect ${imageName} --format='{{.Size}}'`)
  const createdResult = await runCommand(`docker inspect ${imageName} --format='{{.Created}}'`)

  if (archResult.success && osResult.success) {
    print.success('✅ 镜像架构信息：')
    consola.log('')

    // 基本信息
    print.info('📋 基本信息：')
    consola.log(`  镜像名称：${imageName}`)
    consola.log(`  平台架构：${platformResult.stdout.trim()}`)
    consola.log(`  操作系统：${osResult.stdout.trim()}`)
    consola.log(`  CPU 架构：${archResult.stdout.trim()}`)

    if (sizeResult.success) {
      const sizeBytes = parseInt(sizeResult.stdout.trim())
      const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2)
      consola.log(`  镜像大小：${sizeMB} MB`)
    }

    if (createdResult.success) {
      const created = new Date(createdResult.stdout.trim()).toLocaleString()
      consola.log(`  创建时间：${created}`)
    }

    consola.log('')

    // 详细信息
    print.info('🔧 详细信息：')
    const detailResult = await runCommand(`docker inspect ${imageName} --format='{{json .Config}}'`)

    if (detailResult.success) {
      try {
        const config = JSON.parse(detailResult.stdout)

        if (config.ExposedPorts) {
          const ports = Object.keys(config.ExposedPorts).join(', ')
          consola.log(`  暴露端口：${ports}`)
        }

        if (config.Env) {
          const envCount = config.Env.length
          consola.log(`  环境变量：${envCount} 个`)
        }

        if (config.Cmd) {
          consola.log(`  启动命令：${config.Cmd.join(' ')}`)
        }

        if (config.WorkingDir) {
          consola.log(`  工作目录：${config.WorkingDir}`)
        }
      }
      catch {
        print.warning('⚠️  无法解析详细配置信息')
      }
    }

    consola.log('')

    // 架构兼容性提示
    print.info('💡 架构兼容性提示：')
    const arch = archResult.stdout.trim()

    if (arch === 'amd64') {
      consola.log('  ✅ 兼容 x86_64 服务器和大多数云平台')
    }
    else if (arch === 'arm64') {
      consola.log('  ✅ 兼容 Apple Silicon (M1/M2) 和 ARM64 服务器')
    }
    else if (arch === 'arm') {
      consola.log('  ✅ 兼容树莓派和 ARM 嵌入式设备')
    }
    else {
      consola.log(`  ℹ️  架构：${arch}`)
    }

    return true
  }
  else {
    print.error('❌ 无法获取镜像架构信息')

    return false
  }
}

// 列出所有镜像及其架构
async function listImagesWithArch() {
  const result = await runCommand('docker images')

  if (!result.success) {
    print.error('❌ 无法获取镜像列表')

    return false
  }

  if (!result.stdout.trim()) {
    print.info('没有找到本地镜像')

    return true
  }

  // 使用表格格式化显示镜像列表
  const formattedTable = formatImagesTable(result.stdout, '所有镜像及其架构')

  if (formattedTable) {
    consola.log(formattedTable)
  }
  else {
    // 回退到原始显示方式
    print.step('📋 列出所有镜像及其架构')
    consola.log(result.stdout)
  }

  return true
}

// 主函数
async function main() {
  print.title('==========================================')
  print.title('           Docker 镜像架构查看工具')
  print.title('==========================================')
  consola.log('')

  program
    .version('1.0.0')
    .argument('[image]', '要查看的镜像名称')
    .option('-l, --list', '列出所有镜像及其架构')
    .helpOption('-h, --help', '显示帮助信息')

  program.parse()

  const options = program.opts()
  const imageName = program.args[0]

  if (options.list) {
    await listImagesWithArch()

    return
  }

  // 如果没有指定镜像名称，则进入交互式选择模式
  if (!imageName) {
    await interactiveMode()
  }
  else {
    await inspectImage(imageName)
  }
}

main().catch((error) => {
  print.error(`查看失败：${error.message}`)
  process.exit(1)
})
