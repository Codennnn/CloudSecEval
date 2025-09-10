# Docker 部署指南

本目录包含了项目的 Docker 部署相关文件和脚本。

## 功能特点

- ✅ **跨平台兼容** - 在 Windows、macOS、Linux 上行为一致
- 🎨 **彩色输出** - 使用 chalk 库提供美观的彩色输出
- 🤝 **用户交互** - 支持确认提示、输入验证等交互功能
- 🔧 **更好的错误处理** - 结构化的异常处理和详细的错误信息
- 📦 **模块化设计** - 共用工具函数，代码复用性高
- 🚀 **异步支持** - 原生支持 Promise/async-await

## 文件说明

### 目录结构

```
docker/
├── README.md                 # 使用说明文档
├── Dockerfile               # Docker 镜像构建文件
├── docker-compose.yml       # 开发环境 Docker Compose 配置
├── docker-compose.prod.yml  # 生产环境 Docker Compose 配置
└── scripts/                 # 管理脚本目录
    ├── utils.mjs            # 工具函数
    ├── build.mjs            # 构建脚本
    ├── publish.mjs          # 发布脚本
    ├── start.mjs            # 启动脚本
    ├── stop.mjs             # 停止脚本
    ├── status.mjs           # 状态查看
    ├── logs.mjs             # 日志查看
    ├── install.mjs          # 环境检查
    └── inspect-image.mjs    # 镜像检查
```

### 配置文件

- `Dockerfile` - Docker 镜像构建文件
- `docker-compose.yml` - 开发环境 Docker Compose 配置
- `docker-compose.prod.yml` - 生产环境 Docker Compose 配置

### 管理脚本

位于 `scripts/` 目录下的管理脚本：

| 脚本                | 功能     | 说明                                   |
| ------------------- | -------- | -------------------------------------- |
| `start.mjs`         | 启动服务 | 带健康检查的启动脚本                   |
| `stop.mjs`          | 停止服务 | 停止 Docker 容器                       |
| `status.mjs`        | 查看状态 | 显示服务状态和配置信息                 |
| `logs.mjs`          | 查看日志 | 实时查看应用日志                       |
| `build.mjs`         | 镜像构建 | 独立的构建脚本，支持多平台和交互式构建 |
| `publish.mjs`       | 镜像发布 | 专注于发布已构建的镜像                 |
| `install.mjs`       | 环境检查 | 检查 Docker 环境和依赖                 |
| `inspect-image.mjs` | 镜像检查 | 查看镜像架构和详细信息                 |
| `utils.mjs`         | 工具函数 | 共享的工具函数和常量定义               |

## 安装和设置

### 1. 安装依赖

```bash
# 在项目根目录运行
pnpm install
```

### 2. 检查环境

```bash
# 检查 Docker 脚本环境
pnpm docker:install
```

## 快速开始

### 1. 启动开发环境

```bash
# 使用 pnpm 脚本启动（推荐）
pnpm docker:start

# 或直接运行 Node.js 脚本
node docker/scripts/start.mjs

# 或直接使用 Docker Compose
docker compose -f docker/docker-compose.yml up -d --build
```

### 🏗️ 指定平台架构构建

#### 使用 Docker Compose

```bash
# 默认构建（linux/amd64）
docker compose -f docker/docker-compose.yml up --build

# 指定 ARM64 架构（Apple Silicon）
DOCKER_PLATFORM=linux/arm64 docker compose -f docker/docker-compose.yml up --build

# 指定 ARM v7 架构（树莓派）
DOCKER_PLATFORM=linux/arm/v7 docker compose -f docker/docker-compose.yml up --build
```

#### 支持的平台架构

| 平台           | 说明                | 适用场景                  |
| -------------- | ------------------- | ------------------------- |
| `linux/amd64`  | x86_64 架构（默认） | 标准服务器、云平台        |
| `linux/arm64`  | ARM64 架构          | Apple Silicon、ARM 服务器 |
| `linux/arm/v7` | ARM v7 架构         | 树莓派、嵌入式设备        |

#### 环境变量方式

```bash
# 在 .env 文件中设置
echo "DOCKER_PLATFORM=linux/arm64" >> .env

# 临时设置
export DOCKER_PLATFORM=linux/arm64
docker compose -f docker/docker-compose.yml up --build
```

### 🔍 查看镜像架构

构建完成后，您可以使用以下方法查看镜像的架构信息：

#### 使用专用脚本（推荐）

```bash
# 查看指定镜像的详细架构信息
pnpm docker:inspect <镜像名称>
pnpm docker:inspect docker-app:latest

# 列出所有镜像及其架构
pnpm docker:inspect --list

# 或直接使用脚本
node docker/scripts/inspect-image.mjs docker-app:latest
node docker/scripts/inspect-image.mjs --list
```

#### 使用 Docker 命令

```bash
# 查看镜像架构
docker inspect <镜像名称> --format='{{.Architecture}}'

# 查看平台信息
docker inspect <镜像名称> --format='{{.Os}}/{{.Architecture}}'

# 查看详细信息
docker inspect <镜像名称> | jq -r '.[0] | {Os, Architecture, Size, Created}'
```

### 2. 查看服务状态

```bash
# 查看详细状态
pnpm docker:status

# 查看实时日志
pnpm docker:logs
```

### 3. 停止服务

```bash
pnpm docker:stop
```

## 镜像构建和发布

### 🏗️ 镜像构建

项目提供了功能完整的镜像构建脚本，支持多平台构建和交互式操作。

#### 🎯 构建脚本特性

- **交互式构建** - 引导式构建流程，适合新手
- **多平台支持** - 支持 AMD64、ARM64 等多种架构
- **灵活标签** - 支持本地、带标签、多标签构建
- **Docker Buildx** - 自动检测并使用 Buildx 进行多平台构建

#### 📋 构建命令

```bash
# 主菜单选择（推荐）
pnpm docker:build

# 直接使用命令行选项
node docker/scripts/build.mjs --local                # 本地构建
node docker/scripts/build.mjs --tagged -v 1.2.3     # 带标签构建
node docker/scripts/build.mjs --tagged -v 1.2.3 -p linux/amd64,linux/arm64  # 多平台构建
node docker/scripts/build.mjs --list                 # 查看本地镜像
node docker/scripts/build.mjs --cleanup              # 清理未使用的镜像
```

#### 🔧 构建选项

| 选项               | 说明                 |
| ------------------ | -------------------- |
| `--local`          | 本地构建模式         |
| `--tagged`         | 带标签构建模式       |
| `--multi`          | 多标签构建模式       |
| `-v, --version`    | 指定版本号           |
| `-t, --tag`        | 指定自定义标签       |
| `-l, --latest`     | 同时构建 latest 标签 |
| `-p, --platform`   | 指定目标平台架构     |
| `-f, --dockerfile` | 指定 Dockerfile 路径 |
| `--list`           | 列出本地镜像         |
| `--cleanup`        | 清理未使用的镜像     |
| `--interactive`    | 交互式构建           |

### 🚀 镜像发布

项目支持将镜像发布到 Docker Hub（用户名：leokuchon）。

#### 🎯 发布脚本

新版本的发布脚本专注于发布已构建的镜像，提供更精确的控制：

```bash
# 主菜单选择（推荐）
pnpm docker:publish

# 直接使用命令行选项
node docker/scripts/publish.mjs --list                           # 查看可发布的镜像
node docker/scripts/publish.mjs -i leokuchon/nest-api:1.2.3      # 发布指定镜像
node docker/scripts/publish.mjs -i leokuchon/nest-api:1.2.3 -i leokuchon/nest-api:latest  # 发布多个镜像
node docker/scripts/publish.mjs --quick -i leokuchon/nest-api:1.2.3     # 快速发布
node docker/scripts/publish.mjs --full -i leokuchon/nest-api:1.2.3 -c   # 完整发布（包含确认和清理）
node docker/scripts/publish.mjs --full -f -i leokuchon/nest-api:1.2.3   # 强制发布（跳过确认）
```

#### 🔧 发布选项

| 选项            | 说明               |
| --------------- | ------------------ |
| `--quick`       | 快速发布模式       |
| `--full`        | 完整发布模式       |
| `-i, --image`   | 指定要发布的镜像   |
| `-c, --cleanup` | 发布后清理本地镜像 |
| `-f, --force`   | 跳过确认提示       |
| `--list`        | 列出可发布的镜像   |
| `--interactive` | 交互式发布         |

#### 🚀 快速发布 vs 🔧 完整发布

**快速发布模式：**

- 适合开发测试阶段
- 无需确认，快速执行
- 直接推送指定镜像
- 无额外检查和清理

**完整发布模式：**

- 适合生产环境
- 包含登录检查和用户确认
- 可选清理本地镜像
- 详细的推送日志和错误处理

### 🔄 完整工作流示例

#### 🎯 开发工作流

```bash
# 1. 本地构建测试
pnpm docker:build
# 选择: 🏗️ 构建镜像
# 选择: 🏠 本地构建

# 2. 本地测试
docker run -p 8000:8000 --env-file .env nest-api:local

# 3. 测试通过后构建带标签的镜像
pnpm docker:build
# 选择: 🏗️ 构建镜像
# 选择: 🏷️ 带标签构建

# 4. 查看构建的镜像
pnpm docker:build
# 选择: 📋 列出镜像

# 5. 发布到 Docker Hub
pnpm docker:publish
# 选择: 🚀 发布镜像

# 6. 清理本地镜像
pnpm docker:build
# 选择: 🗑️ 清理镜像
```

#### 🚀 生产发布流程

```bash
# 1. 主菜单构建（推荐）
pnpm docker:build
# 选择: 🏗️ 构建镜像
# 选择: 🏷️ 带标签构建
# 版本: 1.2.3
# 平台: linux/amd64,linux/arm64
# latest: 是

# 2. 主菜单发布（推荐）
pnpm docker:publish
# 选择: 🚀 发布镜像
# 选择要发布的镜像
# 选择: 🔧 完整发布
# 清理: 是
```

#### ⚡ 快速发布流程

```bash
# 一键构建并发布
pnpm docker:build --tagged -v 1.2.3 -l && pnpm docker:publish --quick -i leokuchon/nest-api:1.2.3 -i leokuchon/nest-api:latest
```

### 使用发布的镜像

#### 开发环境

修改 `docker-compose.yml` 文件：

```yaml
services:
  app:
    # 注释掉 build 部分
    # build:
    #   context: ..
    #   dockerfile: docker/Dockerfile

    # 启用 image 部分
    image: leokuchon/nest-api:latest
```

#### 生产环境

```bash
# 使用生产环境配置
docker compose -f docker/docker-compose.prod.yml up -d

# 或直接运行镜像
docker run -d \
  --name nest-api \
  -p 8000:8000 \
  --env-file .env \
  leokuchon/nest-api:latest
```

## 详细功能说明

### 🚀 start.mjs - 启动服务

**新功能** - 支持镜像选择和多种启动方式！

**主要功能**：

- **智能镜像选择** - 自动检测本地可用镜像，提供选择界面
- **两种启动方式** - 支持镜像模式和构建模式
- **交互式界面** - 用户友好的主菜单选择
- **健康检查** - 等待服务完全启动并验证可用性
- **详细诊断** - 启动失败时提供完整的故障排除信息

**启动方式**：

1. **镜像模式** - 使用现有镜像直接启动容器
   - 支持本地构建镜像 (`nest-api:*`)
   - 支持远程镜像 (`leokuchon/nest-api:*`)
   - 自动管理容器生命周期

2. **构建模式** - 使用 Docker Compose 构建并启动
   - 从源代码构建镜像
   - 完整的服务编排
   - 适合开发和测试

**使用示例**：

```bash
# 主菜单选择（推荐）
pnpm docker:start

# 列出可用镜像
pnpm docker:start --list

# 使用指定镜像启动
pnpm docker:start -i leokuchon/nest-api:1.2.3

# 使用构建模式启动
pnpm docker:start --build
```

**特点**：

- 自动检测端口号和环境配置
- 实时健康检查和状态监控
- 支持两种日志查看方式
- 详细的错误诊断信息
- 向下兼容现有工作流程

### 🔴 stop.mjs - 停止服务

功能：

- 停止 Docker 容器
- 显示当前运行的容器
- 检查是否有相关容器仍在运行

### 📊 status.mjs - 查看状态

功能：

- 显示配置信息（端口、环境文件）
- 检查 Docker 容器状态
- 测试服务连接
- 显示 API 响应信息
- 列出可用命令

### 📝 logs.mjs - 查看日志

功能：

- 实时查看应用日志
- 支持 Ctrl+C 退出
- 检查服务运行状态

### 🚢 publish.mjs - 发布镜像

完整的镜像发布流程，功能：

- 自动检查 Docker 登录状态
- 支持版本号自动获取或手动指定
- 可选推送 latest 标签
- 可选清理本地镜像
- 用户确认提示
- 详细的构建和推送日志

### 🏗️ build.mjs - 镜像构建脚本

专注于镜像构建的独立脚本，特点：

- **交互式构建** - 引导式构建流程，用户友好
- **多平台支持** - 支持 AMD64、ARM64 等多种架构
- **灵活标签管理** - 支持本地、带标签、多标签构建
- **Docker Buildx 集成** - 自动检测并使用 Buildx

### 🚀 publish.mjs - 镜像发布脚本

专注于发布已构建镜像的脚本，特点：

- **镜像选择** - 可以选择本地已构建的镜像进行发布
- **本地标签处理** - 自动为本地镜像创建远程标签
- **批量发布** - 支持一次发布多个镜像
- **精确控制** - 只发布指定的镜像，避免误操作

## 环境变量配置

确保在项目根目录创建 `.env` 文件：

```env
# 应用配置
PORT=8000
NODE_ENV=production

# 数据库配置
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"

# JWT 配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1w

# 管理员配置
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=System Admin
```

## 依赖管理

### 统一依赖管理

Docker 脚本使用项目根目录的 `package.json` 来管理依赖。

### 优势

- ✅ **统一管理** - 所有依赖在根目录统一管理
- ✅ **避免重复** - 不会有重复的 node_modules
- ✅ **版本一致** - 确保整个项目使用相同版本的依赖
- ✅ **简化维护** - 只需维护一个 package.json

### 依赖包说明

| 包名        | 用途                     |
| ----------- | ------------------------ |
| `chalk`     | 彩色输出                 |
| `consola`   | 现代化的日志输出库       |
| `inquirer`  | 用户交互（确认、输入等） |
| `fetch`     | HTTP 请求（健康检查，原生） |
| `dotenv`    | 环境变量处理             |
| `commander` | 命令行参数解析           |

## 故障排除

### 常见问题

1. **容器启动失败**
   - 检查 `.env` 文件是否存在且配置正确
   - 查看容器日志：`pnpm docker:logs`

2. **数据库连接失败**
   - 验证 `DATABASE_URL` 是否正确
   - 检查网络连接

3. **端口冲突**
   - 修改 `.env` 文件中的 `PORT` 值
   - 或修改 docker-compose.yml 中的端口映射

4. **镜像发布失败**
   - 确保已登录 Docker Hub：`docker login`
   - 检查网络连接和权限

5. **Node.js 版本过低**
   - 错误：Node.js 版本过低，需要 18.0.0 或更高版本
   - 解决：升级 Node.js 到 18.0.0 或更高版本

6. **依赖安装失败**

   ```bash
   # 清理并重新安装
   rm -rf node_modules package-lock.json
   pnpm install
   ```

### 调试命令

```bash
# 查看容器状态
docker ps -a

# 查看镜像列表
docker images

# 进入容器调试
docker exec -it nest_api /bin/bash

# 查看容器详细信息
docker inspect nest_api
```

## 自动化部署

项目配置了 GitHub Actions 工作流，可以自动构建和发布镜像。

### 配置步骤

1. 在 GitHub 仓库设置中添加 Secrets：
   - `DOCKER_USERNAME`: leokuchon
   - `DOCKER_PASSWORD`: Docker Hub 密码或访问令牌

2. 推送代码到主分支或创建版本标签即可触发自动发布

### 触发条件

- 推送到 `main` 或 `master` 分支
- 创建版本标签（如 `v1.2.3`）

## 镜像信息

- **Docker Hub 地址**: https://hub.docker.com/r/leokuchon/nest-api
- **用户名**: leokuchon
- **镜像名**: nest-api

### 可用标签

- `latest`: 最新稳定版本
- `v1.2.3`: 具体版本号
- `main`: 主分支最新构建

## 更多信息

详细的部署说明请参考项目根目录的 `docs/开发指南.md` 文件。

## 路径常量使用指南

### 📁 统一路径管理

为了方便维护和修改，项目中的 Docker Compose 文件路径已统一为常量管理。

#### 🔧 可用常量

在 `utils.mjs` 中定义了以下路径常量：

```javascript
// 项目根目录路径
export const PROJECT_ROOT = join(__dirname, "..");

// Docker Compose 文件路径常量
export const DOCKER_COMPOSE_FILE = "docker/docker-compose.yml";
export const DOCKER_COMPOSE_PROD_FILE = "docker/docker-compose.prod.yml";
```

#### 📋 使用示例

**在脚本中使用常量：**

```javascript
import {
  DOCKER_COMPOSE_FILE,
  DOCKER_COMPOSE_PROD_FILE,
  PROJECT_ROOT,
  dockerCompose,
} from "./utils.mjs";
import { join } from "path";

// 使用开发环境配置
await dockerCompose.up(DOCKER_COMPOSE_FILE, "--build -d");

// 使用生产环境配置
await dockerCompose.up(DOCKER_COMPOSE_PROD_FILE, "-d");

// 使用项目根目录路径
const envFilePath = join(PROJECT_ROOT, ".env");
const packagePath = join(PROJECT_ROOT, "package.json");
```

**使用便捷工具函数：**

```javascript
import { composeUtils } from "./utils.mjs";

// 启动开发环境
await composeUtils.startDev();

// 启动生产环境
await composeUtils.startProd();

// 检查文件是否存在
const fileStatus = composeUtils.checkFiles();
console.log("开发环境文件:", fileStatus.devFile);
console.log("生产环境文件:", fileStatus.prodFile);
```

#### ✅ 优势

- **统一管理** - 所有路径在一个地方定义，便于维护
- **避免重复** - 减少硬编码路径的重复出现
- **易于修改** - 只需修改常量定义即可更新所有引用
- **类型安全** - 减少路径拼写错误的可能性

#### 🔄 迁移说明

如果您需要修改 Docker Compose 文件的路径，只需：

1. 修改 `utils.mjs` 中的常量定义
2. 所有使用这些常量的脚本会自动使用新路径
3. 手动更新文档中的示例命令（如果需要）

**示例：**

```javascript
// 修改前
export const DOCKER_COMPOSE_FILE = "docker/docker-compose.yml";

// 修改后（如果您想将文件移动到其他位置）
export const DOCKER_COMPOSE_FILE = "compose/docker-compose.yml";
```

修改后，所有脚本都会自动使用新的路径。
