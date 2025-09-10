import { consola } from 'consola'

import type { SeederResult } from '../core/types'

/**
 * 命令行工具类
 * 提供统一的命令行参数解析和用户交互功能
 */
export abstract class CliUtil {
  /**
   * 解析命令行参数
   */
  static parseArgs(): {
    command?: string
    options: Record<string, unknown>
    flags: string[]
  } {
    const args = process.argv.slice(2)
    const command = args[0]
    const options: Record<string, unknown> = {}
    const flags: string[] = []

    for (let i = 1; i < args.length; i++) {
      const arg = args[i]

      if (arg.startsWith('--')) {
        const key = arg.slice(2)

        // 检查是否有值
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          const value = args[i + 1]
          // 尝试解析为数字或布尔值
          options[key] = this.parseValue(value)
          i++ // 跳过值
        }
        else {
          // 无值的标志
          flags.push(key)
          options[key] = true
        }
      }
    }

    return { command, options, flags }
  }

  /**
   * 解析值的类型
   */
  private static parseValue(value: string): unknown {
    // 布尔值
    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }

    // 数字
    if (/^\d+$/.test(value)) {
      return parseInt(value, 10)
    }

    if (/^\d+\.\d+$/.test(value)) {
      return parseFloat(value)
    }

    // 字符串
    return value
  }

  /**
   * 显示帮助信息
   */
  static showHelp(): void {
    consola.info(`
数据库种子脚本工具

使用方法:
  pnpm db:seed [命令] [选项]

命令:
  admin                   仅创建管理员账号
  organization           仅创建组织和部门
  user                    仅创建用户数据
  license                 仅创建授权码数据
  access-log              仅创建访问日志数据
  full                    创建完整数据集（默认）
  clean                   清理所有测试数据
  stats                   显示数据统计

选项:
  --count <数量>          指定数据数量
  --env <环境>            指定环境 (development|test|production)
  --force                 强制执行（忽略已存在数据）
  --no-presets           不创建预设数据
  --realistic            生成真实访问模式
  --preserve-admin       清理时保留管理员账号
  --parallel             并行执行（适用于full命令）
  --silent               静默模式
  --help, -h             显示帮助信息

示例:
  pnpm db:seed                                # 创建完整数据集
  pnpm db:seed admin                          # 仅创建管理员
  pnpm db:seed user --count 50                # 创建50个用户
  pnpm db:seed full --env test --no-presets   # 测试环境不含预设数据
  pnpm db:seed clean --preserve-admin         # 清理数据但保留管理员
  pnpm db:seed stats                          # 查看数据统计

环境变量:
  ADMIN_EMAIL             管理员邮箱 (默认: admin@example.com)
  ADMIN_PASSWORD          管理员密码 (默认: Admin@123)
  ADMIN_NAME              管理员名称 (默认: 系统管理员)
    `)
  }

  /**
   * 显示统计信息表格
   */
  static displayStats(stats: Record<string, Record<string, number>>): void {
    consola.info('=== 数据库统计信息 ===')

    Object.entries(stats).forEach(([seederName, seederStats]) => {
      const cleanName = seederName.replace('Seeder', '')
      consola.info(`\n${cleanName}:`)

      Object.entries(seederStats).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase()
        consola.info(`  ${formattedKey}: ${value}`)
      })
    })
  }

  /**
   * 显示执行结果表格
   */
  static displayResults(results: Record<string, SeederResult>): void {
    consola.info('\n=== 执行结果 ===')

    Object.entries(results).forEach(([seederName, result]) => {
      const cleanName = seederName.replace('Seeder', '')
      const status = result.success ? '✅ 成功' : '❌ 失败'

      consola.info(`\n${cleanName}: ${status}`)
      consola.info(`  消息: ${result.message}`)

      if (result.data) {
        if (result.data.created > 0) {
          consola.info(`  创建: ${result.data.created}`)
        }

        if (result.data.existing > 0) {
          consola.info(`  已存在: ${result.data.existing}`)
        }
      }

      if (result.error) {
        consola.info(`  错误: ${result.error}`)
      }
    })
  }

  /**
   * 确认用户操作
   */
  static confirm(message: string): Promise<boolean> {
    // 在实际项目中，这里可以使用 inquirer 等库实现交互式确认
    // 目前直接返回 true，或根据环境变量决定
    const autoConfirm = process.env.AUTO_CONFIRM === 'true'

    if (autoConfirm) {
      consola.info(`${message} (自动确认)`)

      return Promise.resolve(true)
    }

    consola.info(`${message} (默认: 是)`)

    return Promise.resolve(true)
  }

  /**
   * 获取环境配置
   */
  static getEnvironment(): 'development' | 'production' | 'test' {
    const nodeEnv = process.env.NODE_ENV?.toLowerCase()

    if (nodeEnv === 'production') {
      return 'production'
    }

    if (nodeEnv === 'test') {
      return 'test'
    }

    return 'development'
  }
}
