# NestJS 中文文档优化 TODO 清单

> 本清单根据 `src/lib/data/nav.ts` 中的文档目录结构生成，用于跟踪文档优化进度。

## 使用说明

- [ ] 待优化
- [x] 已完成
- [!] 需要重点关注
- [?] 需要进一步确认

---

## 1. 入门指南 (Getting Started)

- [x] `/introduction` - 介绍
- [x] `/first-steps` - 快速上手
- [x] `/controllers` - 控制器
- [x] `/providers` - 提供者
- [x] `/modules` - 模块

## 2. 核心机制 (Core Mechanisms)

- [x] `/middleware` - 中间件
- [x] `/exception-filters` - 异常过滤器
- [x] `/pipes` - 管道
- [x] `/guards` - 守卫
- [x] `/interceptors` - 拦截器
- [x] `/custom-decorators` - 自定义装饰器

## 3. 进阶原理 (Advanced Fundamentals)

- [x] `/fundamentals/custom-providers` - 自定义提供者
- [x] `/fundamentals/async-providers` - 异步提供者
- [x] `/fundamentals/dynamic-modules` - 动态模块
- [x] `/fundamentals/injection-scopes` - 依赖注入作用域
- [x] `/fundamentals/circular-dependency` - 循环依赖
- [x] `/fundamentals/module-ref` - 模块引用
- [x] `/fundamentals/lazy-loading-modules` - 懒加载模块
- [x] `/fundamentals/execution-context` - 执行上下文
- [x] `/fundamentals/lifecycle-events` - 生命周期事件
- [x] `/fundamentals/discovery-service` - 发现服务
- [x] `/fundamentals/platform-agnosticism` - 跨平台无关性
- [x] `/fundamentals/testing` - 测试

## 4. 功能扩展 (Feature Extensions)

- [x] `/techniques/configuration` - 配置
- [x] `/techniques/validation` - 数据验证
- [x] `/techniques/caching` - 缓存机制
- [x] `/techniques/serialization` - 序列化
- [ ] `/techniques/versioning` - 版本控制
- [ ] `/techniques/task-scheduling` - 任务调度
- [ ] `/techniques/queues` - 队列
- [ ] `/techniques/logger` - 日志
- [x] `/techniques/cookies` - Cookie
- [x] `/techniques/events` - 事件
- [x] `/techniques/compression` - 压缩
- [ ] `/techniques/file-upload` - 文件上传
- [ ] `/techniques/streaming-files` - 文件流
- [x] `/techniques/http-module` - HTTP 模块
- [x] `/techniques/session` - Session 支持
- [x] `/techniques/mvc` - MVC 模式
- [ ] `/techniques/performance` - 性能优化（Fastify）
- [x] `/techniques/server-sent-events` - 服务端推送事件

## 5. 数据库集成 (Database Integration)

- [ ] `/techniques/database` - 数据库概述
- [ ] `/techniques/mongodb` - MongoDB

## 6. 安全实践 (Security Practices)

- [ ] `/security/authentication` - 认证
- [ ] `/security/authorization` - 授权
- [x] `/security/encryption-and-hashing` - 加密与哈希
- [x] `/security/helmet` - Helmet
- [x] `/security/cors` - CORS
- [ ] `/security/csrf` - CSRF 防护
- [ ] `/security/rate-limiting` - 请求频率限制

## 7. GraphQL 支持

- [ ] `/graphql/quick-start` - 快速入门
- [ ] `/graphql/resolvers` - 解析器
- [ ] `/graphql/mutations` - 变更（Mutation）
- [ ] `/graphql/subscriptions` - 订阅
- [ ] `/graphql/scalars` - 标量类型
- [ ] `/graphql/directives` - 指令
- [ ] `/graphql/interfaces` - 接口
- [ ] `/graphql/unions-and-enums` - 联合类型和枚举
- [ ] `/graphql/field-middleware` - 字段中间件
- [ ] `/graphql/mapped-types` - 类型映射
- [ ] `/graphql/plugins` - 插件
- [ ] `/graphql/complexity` - 复杂度
- [ ] `/graphql/extensions` - 扩展
- [ ] `/graphql/cli-plugin` - CLI 插件
- [ ] `/graphql/generating-sdl` - 生成 SDL
- [ ] `/graphql/sharing-models` - 共享模型
- [ ] `/graphql/other-features` - 其他功能
- [ ] `/graphql/federation` - 联邦

## 8. WebSocket 通信

- [ ] `/websockets/gateways` - 网关
- [ ] `/websockets/exception-filters` - 异常过滤器
- [ ] `/websockets/pipes` - 管道
- [ ] `/websockets/guards` - 守卫
- [ ] `/websockets/interceptors` - 拦截器
- [ ] `/websockets/adapter` - 适配器

## 9. 微服务架构

- [ ] `/microservices/basics` - 概述
- [ ] `/microservices/redis` - Redis
- [ ] `/microservices/mqtt` - MQTT
- [ ] `/microservices/nats` - NATS
- [ ] `/microservices/rabbitmq` - RabbitMQ
- [ ] `/microservices/kafka` - Kafka
- [ ] `/microservices/grpc` - gRPC
- [ ] `/microservices/custom-transport` - 自定义传输器
- [ ] `/microservices/exception-filters` - 异常过滤器
- [ ] `/microservices/pipes` - 管道
- [ ] `/microservices/guards` - 守卫
- [ ] `/microservices/interceptors` - 拦截器

## 10. CLI 工具

- [x] `/cli/overview` - 概述
- [x] `/cli/monorepo` - 工作空间
- [x] `/cli/libraries` - 库
- [x] `/cli/usages` - 使用方法
- [x] `/cli/scripts` - CLI 与构建脚本

## 11. OpenAPI

- [ ] `/openapi/introduction` - 介绍
- [ ] `/openapi/types-and-parameters` - 类型和参数
- [ ] `/openapi/operations` - 操作
- [ ] `/openapi/security` - 安全
- [ ] `/openapi/mapped-types` - 映射类型
- [ ] `/openapi/decorators` - 装饰器
- [ ] `/openapi/cli-plugin` - CLI 插件
- [ ] `/openapi/other-features` - 其他功能

## 12. 实用案例

- [ ] `/recipes/repl` - REPL
- [ ] `/recipes/crud-generator` - CRUD 生成器
- [ ] `/recipes/swc` - SWC
- [ ] `/recipes/passport` - Passport（认证）
- [ ] `/recipes/hot-reload` - 热重载
- [ ] `/recipes/mikroorm` - MikroORM
- [ ] `/recipes/sql-typeorm` - TypeORM
- [ ] `/recipes/mongodb` - Mongoose
- [ ] `/recipes/sql-sequelize` - SQL（Sequelize）
- [ ] `/recipes/router-module` - 路由模块
- [ ] `/recipes/swagger` - Swagger
- [ ] `/recipes/terminus` - 健康检查
- [ ] `/recipes/cqrs` - CQRS
- [ ] `/recipes/documentation` - Compodoc
- [ ] `/recipes/prisma` - Prisma
- [ ] `/recipes/sentry` - Sentry
- [ ] `/recipes/serve-static` - 静态资源服务
- [ ] `/recipes/nest-commander` - Nest 命令行工具
- [ ] `/recipes/async-local-storage` - 异步本地存储
- [ ] `/recipes/necord` - Necord
- [ ] `/recipes/suites` - Suites（原 Automock）

## 13. 部署与发布

- [ ] `/deployment` - 部署指南
- [ ] `/standalone-applications` - 独立应用模式

## 14. 常见问题

- [x] `/faq/serverless` - Serverless
- [x] `/faq/http-adapter` - HTTP 适配器
- [x] `/faq/keep-alive-connections` - HTTP 长连接
- [x] `/faq/global-prefix` - 全局路由前缀
- [x] `/faq/raw-body` - 原始请求体
- [x] `/faq/hybrid-application` - 混合应用
- [x] `/faq/multiple-servers` - HTTPS 和多服务器
- [x] `/faq/request-lifecycle` - 请求生命周期
- [x] `/faq/common-errors` - 常见错误排查

## 15. 开发者工具

- [ ] `/devtools/overview` - 概述
- [ ] `/devtools/ci-cd-integration` - CI/CD 集成

## 16. 独立页面

- [ ] `/migration-guide` - 迁移指南

## 17. 社区与支持

- [x] `/discover/companies` - 谁在使用 Nest？
- [x] `/support` - 支持我们

## 外部链接（无需优化）

- API 参考: https://api-references-nestjs.netlify.app/
- 官方课程: https://courses.nestjs.com/
- 示例代码: https://github.com/nestjs/nest/tree/master/sample

---

## 优化统计

- **总计文档数量**: 119 个
- **已完成优化**: 42 个（入门指南、核心机制、进阶原理、部分功能扩展、部分安全实践、CLI 工具、常见问题、社区与支持）
- **待优化文档**: 77 个
- **完成进度**: 35.3%

### 主要完成的模块

1. 入门指南 (5/5) - 100% 完成
2. 核心机制 (6/6) - 100% 完成
3. 进阶原理 (12/12) - 100% 完成
4. 功能扩展 (7/17) - 41% 完成
5. 安全实践 (3/7) - 43% 完成
6. CLI 工具 (5/5) - 100% 完成
7. 常见问题 (9/9) - 100% 完成
8. 社区与支持 (2/2) - 100% 完成

## 优化重点

根据访问频率和重要性，建议优先优化以下文档：

### 高优先级 (P0) - 已完成

- [x] 介绍
- [x] 快速上手
- [x] 控制器
- [x] 提供者
- [x] 模块

### 中优先级 (P1) - 已完成

- [x] 中间件
- [x] 异常过滤器
- [x] 管道
- [x] 守卫
- [x] 拦截器

### 功能扩展优先级 (P2)

- [ ] 配置
- [ ] 验证
- [ ] 缓存
- [ ] 数据库概述
- [ ] MongoDB

### 安全实践优先级 (P3)

- [ ] 认证
- [ ] 授权
- [ ] CORS
- [ ] Helmet
