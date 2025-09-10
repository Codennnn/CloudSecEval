// 导入环境变量配置
import 'dotenv/config'

import path from 'node:path'

import { defineConfig } from 'prisma/config'

/**
 * Prisma 配置文件
 *
 * 用于配置 Prisma CLI 的各种选项，包括 schema 位置、
 * 迁移文件路径等。相比在 package.json 中配置，
 * 这种方式提供了更大的灵活性和类型安全。
 *
 * @see https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */
export default defineConfig({
  // Prisma schema 文件路径
  schema: path.join('src', 'prisma', 'schema.prisma'),

  // 迁移文件配置
  migrations: {
    // 迁移文件存储路径
    path: path.join('src', 'prisma', 'migrations'),
  },

  // 如果将来需要使用 Prisma Views 功能
  views: {
    // 视图定义文件存储路径
    path: path.join('src', 'prisma', 'views'),
  },

  // 如果将来需要使用 typedSql 功能
  typedSql: {
    // SQL 查询文件存储路径
    path: path.join('src', 'prisma', 'queries'),
  },
})
