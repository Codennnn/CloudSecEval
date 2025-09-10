#!/usr/bin/env node

import { consola } from 'consola'

import { checkFileExists, dockerCompose, getPort, print } from './utils.mjs'

async function main() {
  print.title('📊 Nest API 服务状态检查')
  print.title('================================')

  // 获取端口号
  const envExists = checkFileExists('.env')
  const port = getPort()

  print.step('🔧 配置信息：')
  consola.log(`   端口：${port}`)
  consola.log(`   环境文件：${envExists ? '✅ 存在' : '❌ 缺失'}`)
  consola.log('')

  print.step('📦 Docker 容器状态：')
  const psResult = await dockerCompose.ps()

  if (psResult.success && psResult.stdout.includes('nest_api')) {
    consola.log(psResult.stdout)
    consola.log('')

    print.step('🌐 服务连接测试：')

    try {
      // 使用原生 fetch 替代 axios，设置 5 秒超时
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`http://localhost:${port}`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      print.success(`✅ 服务正常运行 - http://localhost:${port}`)

      // 尝试获取一些基本信息
      consola.log('')
      print.step('📡 API 响应测试：')
      consola.log(`   HTTP 状态码：${response.status}`)

      if (response.ok) {
        const data = await response.json()
        consola.log(`   响应数据：${JSON.stringify(data).substring(0, 100)}...`)
      }
    }
    catch {
      print.error('❌ 服务无法访问')
      print.info('建议查看日志：pnpm docker:logs')
    }
  }
  else {
    print.error('❌ 容器未运行')
    print.info('启动服务：pnpm docker:start')
  }

  consola.log('')
  print.title('🛠️  可用命令：')
  consola.log('   启动服务：pnpm docker:start')
  consola.log('   查看日志：pnpm docker:logs')
  consola.log('   停止服务：pnpm docker:stop')
  consola.log('   状态检查：pnpm docker:status')
  consola.log('   发布镜像：pnpm docker:publish')
}

main().catch((error) => {
  print.error(`状态检查失败：${error.message}`)
  process.exit(1)
})
