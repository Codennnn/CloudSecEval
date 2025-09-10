# 付费阅读服务 API

基于 NestJS + Prisma 的付费内容访问控制后端服务，提供轻量但安全的邮箱授权码验证机制，无需用户注册即可实现付费内容的访问控制。

## 🚀 项目特色

- **无需注册登录**：用户仅通过邮箱绑定授权码即可访问付费内容
- **安全访问控制**：基于授权码的访问验证，防止内容滥用
- **设备指纹识别**：检测异常设备切换，提供风控保护
- **企业级架构**：采用 NestJS 框架，模块化设计，易于扩展
- **完整的 Docker 支持**：提供开发、测试、生产环境的容器化部署

## 🛠️ 技术栈

- **后端框架**：NestJS 11.x
- **编程语言**：TypeScript 5.x
- **数据库**：PostgreSQL + Prisma ORM
- **认证授权**：JWT + 自定义授权码机制
- **构建工具**：SWC（高性能 TypeScript 编译器）
- **包管理器**：pnpm
- **容器化**：Docker + Docker Compose
- **API 文档**：Swagger/OpenAPI

## 📁 项目结构

```
├── docs/                    # 项目文档
│   ├── 开发指南.md           # 开发环境配置和工作流
│   ├── API设计.md           # API 接口文档
│   ├── 数据模型设计.md       # 数据库设计文档
│   ├── 付费阅读功能需求文档.md # 业务需求说明
│   └── 项目结构说明.md       # 详细的项目架构说明
├── src/                     # 源代码
│   ├── modules/             # 业务模块
│   │   ├── auth/            # 认证授权模块
│   │   ├── users/           # 用户管理模块
│   │   └── license/         # 授权码管理模块
│   ├── prisma/              # 数据库相关
│   │   ├── schema.prisma    # 数据模型定义
│   │   ├── seeds/           # 数据库种子脚本
│   │   └── migrations/      # 数据库迁移文件
│   ├── common/              # 通用模块
│   └── config/              # 配置模块
├── docker/                  # Docker 相关文件
│   ├── scripts/             # Docker 管理脚本
│   └── docker-compose.*.yml # 不同环境的 Docker 配置
└── test/                    # 测试文件
```

## 🚀 快速开始

### 环境要求

- Node.js 20.x+
- pnpm 9.x+
- Docker & Docker Compose

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd NestJS-Docs-Paywall

# 安装依赖
pnpm install
```

### 开发环境启动

```bash
# 启动数据库并初始化
pnpm dev:db

# 启动开发服务器
pnpm dev
```

服务将在 `http://localhost:8007` 启动，API 文档可在 `http://localhost:8007/api` 查看。

## 📚 核心功能

### 1. 邮箱验证码系统
- 发送验证码到用户邮箱
- 验证邮箱真实性
- 防止恶意邮箱注册

### 2. 授权码管理
- 生成唯一授权码绑定邮箱
- 授权码访问验证
- 使用次数和设备追踪

### 3. 风控机制
- 设备指纹识别
- 异常访问检测
- 授权码锁定机制
- 访问日志记录

### 4. 用户管理
- JWT 认证系统
- 用户注册登录
- 权限管理

## 🐳 Docker 部署

项目提供完整的 Docker 化部署方案：

```bash
# 开发环境
pnpm docker:start

# 生产环境
docker-compose -f docker/docker-compose.prod.yml up -d
```

详细的 Docker 使用说明请参考 [Docker 部署指南](./docker/README.md)。

## 📖 文档目录

- [开发指南](./docs/开发指南.md) - 项目概述、环境设置和开发流程
- [数据模型设计](./docs/数据模型设计.md) - 数据库结构和关系设计
- [API 设计](./docs/API设计.md) - API 端点、参数和响应格式
- [付费阅读功能需求文档](./docs/付费阅读功能需求文档.md) - 业务需求和功能规划
- [项目结构说明](./docs/项目结构说明.md) - 详细的项目架构说明
- [Prisma 命令指南](./docs/Prisma命令指南.md) - 数据库操作命令
- [环境变量配置指南](./docs/环境变量配置指南.md) - 环境配置说明

## 🔧 常用命令

```bash
# 开发相关
pnpm dev                    # 启动开发服务器
pnpm build                  # 构建项目
pnpm start:prod             # 启动生产服务器

# 数据库相关
pnpm db:init                # 初始化数据库
pnpm db:seed                # 运行种子脚本
pnpm prisma:studio          # 打开 Prisma Studio

# Docker 相关
pnpm docker:start           # 启动 Docker 服务
pnpm docker:stop            # 停止 Docker 服务
pnpm docker:build           # 构建 Docker 镜像

# 测试相关
pnpm test                   # 运行单元测试
pnpm test:e2e               # 运行端到端测试
pnpm test:cov               # 运行测试覆盖率
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 UNLICENSED 许可证。

## 📞 联系方式

- 项目负责人：LeoKu <leokudev@gmail.com>
- 项目仓库：[GitHub](https://github.com/your-org/nestjs-docs-paywall)

## 🔗 相关资源

- [NestJS 官方文档](https://docs.nestjs.com/)
- [Prisma 文档](https://www.prisma.io/docs/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Docker 文档](https://docs.docker.com/)
