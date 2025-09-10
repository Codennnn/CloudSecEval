#!/usr/bin/env node

import { dockerCompose, print } from './utils.mjs'

async function main() {
  print.title('📝 查看 Nest API 服务日志...')

  // 检查服务是否运行
  const psResult = await dockerCompose.ps()

  if (!psResult.success || !psResult.stdout.includes('nest_api')) {
    print.error('❌ 服务未运行，请先启动服务：')
    print.info('pnpm docker:start')
    process.exit(1)
  }

  print.success('实时查看日志 (按 Ctrl+C 退出)：')
  print.title('----------------------------------------')

  // 实时查看日志
  try {
    await dockerCompose.logs()
  }
  catch (error) {
    print.error(`查看日志失败：${error.message}`)
    process.exit(1)
  }
}

main().catch((error) => {
  print.error(`日志查看失败：${error.message}`)
  process.exit(1)
})
