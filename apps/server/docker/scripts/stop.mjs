#!/usr/bin/env node

import { consola } from 'consola'

import { dockerCompose, print, runCommand } from './utils.mjs'

async function main() {
  print.title('🔴 停止 Nest API 服务...')

  // 检查服务是否运行
  const psResult = await dockerCompose.ps()

  if (!psResult.success || !psResult.stdout.includes('nest_api')) {
    print.warning('ℹ️  服务未运行')
  }
  else {
    // 停止服务
    const downResult = await dockerCompose.down()

    if (downResult.success) {
      print.success('✅ 服务已停止')
    }
    else {
      print.error('停止服务失败')
      consola.log(downResult.stderr)
    }
  }

  consola.log('')
  print.step('📊 当前运行的容器：')
  const dockerPsResult = await runCommand('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}" | head -10')

  if (dockerPsResult.success) {
    consola.log(dockerPsResult.stdout)
  }

  // 检查是否还有相关容器
  const remainingResult = await runCommand('docker ps -q --filter "name=nest"')

  if (remainingResult.success && remainingResult.stdout.trim()) {
    consola.log('')
    print.warning('⚠️  发现其他相关容器仍在运行：')

    const remainingContainersResult = await runCommand('docker ps --filter "name=nest" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"')

    if (remainingContainersResult.success) {
      consola.log(remainingContainersResult.stdout)
    }
  }
}

main().catch((error) => {
  print.error(`停止失败：${error.message}`)
  process.exit(1)
})
