import { defineConfig } from '@hey-api/openapi-ts'

const API_URL = 'http://[::1]:8007/api-docs-json'
const BASE_PATH = './src/lib/api'
const OUTPUT_PATH = `${BASE_PATH}/generated`
const LOG_PATH = `${BASE_PATH}/logs`
// const RUNTIME_CONFIG_PATH = `${BASE_PATH}/hey-api-config.ts`

/**
 * OpenAPI-TS 配置文件
 *
 * 基于 @hey-api/openapi-ts v0.80.5 的最佳实践配置
 * 使用现代插件架构，提供更好的类型安全性和开发体验
 */
export default defineConfig({
  // 输入配置 - 支持本地和远程 OpenAPI 规范
  input: {
    path: API_URL,
  },

  // 输出配置
  output: {
    path: OUTPUT_PATH,
    indexFile: false, // 禁用生成 index 文件，避免循环引用
  },

  // 插件配置 - 使用新的插件架构
  plugins: [
    // TypeScript 类型生成插件
    {
      name: '@hey-api/typescript',
      // 类型配置
      enums: 'typescript', // 生成 TypeScript 枚举而非联合类型
    },

    // SDK 客户端生成插件
    {
      name: '@hey-api/sdk',
      // 客户端配置
      asClass: false, // 不生成类，使用函数
      operationId: true, // 使用 operationId 作为函数名
      response: 'body', // 只返回响应数据，不包含元数据
      validator: false, // 禁用运行时验证，提升性能
    },

    // 客户端配置插件 - 使用现代 fetch API
    {
      name: '@hey-api/client-fetch',
      // 客户端实例配置
      bundle: true, // 将客户端代码打包
      exportFromIndex: false, // 不从 index 导出，保持模块独立性
      // runtimeConfigPath: RUNTIME_CONFIG_PATH, // 运行时配置文件路径
    },

    // JSON Schema 生成插件
    {
      name: '@hey-api/schemas',
      type: 'json', // 生成 JSON Schema
    },

    {
      name: '@tanstack/react-query',
      queryOptions: true,
      queryKeys: true,
    },
  ],

  // 开发配置
  dryRun: false, // 实际写入文件

  // 日志配置
  logs: {
    level: 'info', // 显示重要信息和错误
    path: LOG_PATH, // 日志输出目录
  },
})
