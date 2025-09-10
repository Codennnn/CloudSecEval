# Prisma 命令指南

本文档提供了项目中所有可用的 Prisma 相关命令及其用法说明。这些命令使用 `npx prisma` 直接调用，而非通过预设的 npm 脚本。

## 可用命令

### 客户端管理

- **生成 Prisma 客户端**
  ```bash
  npx prisma generate
  ```
  根据 schema.prisma 文件生成 TypeScript 类型和 Prisma 客户端代码，在修改数据模型后必须执行。

### 数据库管理

- **启动 Prisma Studio 数据库管理界面**
  ```bash
  npx prisma studio
  ```
  打开一个可视化界面，用于浏览和编辑数据库内容。

- **将 schema 推送到数据库**
  ```bash
  npx prisma db push
  ```
  将当前的 schema.prisma 模型结构直接推送到数据库，适用于开发环境（不生成迁移记录）。

- **格式化 schema 文件**
  ```bash
  npx prisma format
  ```
  规范化 schema.prisma 文件的格式。

- **从现有数据库提取 schema**
  ```bash
  npx prisma db pull
  ```
  从已存在的数据库中提取数据结构生成 schema.prisma 文件。

### 迁移管理

- **重置数据库**
  ```bash
  npx prisma migrate reset
  ```
  清空数据库并重新应用所有迁移，**危险操作**，会删除所有数据。

- **部署迁移**
  ```bash
  npx prisma migrate deploy
  ```
  应用所有待执行的迁移文件，适用于生产环境。

- **开发环境创建迁移**
  ```bash
  npx prisma migrate dev
  ```
  创建新的迁移文件并应用，会提示输入迁移名称。

## 常用组合命令示例

- **初始化数据库**
  ```bash
  npx prisma format && npx prisma generate && npx prisma db push
  ```
  组合命令，执行 format + generate + push，快速设置开发环境。

## 使用场景

- **首次设置**：安装依赖后执行 `npx prisma generate` 和 `npx prisma db push`
- **模型变更后**：运行 `npx prisma generate` 然后 `npx prisma db push`
- **查看/编辑数据**：运行 `npx prisma studio`
- **准备生产部署**：使用 `npx prisma migrate dev` 创建迁移，然后在生产环境使用 `npx prisma migrate deploy`

## 注意事项

- 在执行 `npx prisma migrate reset` 或 `npx prisma db push` 前，请确保已备份重要数据
- 开发环境推荐使用 `npx prisma db push`，生产环境应使用迁移（`migrate dev` + `migrate deploy`）
- 在团队协作中，所有成员在拉取包含模型变更的代码后应运行 `npx prisma generate` 