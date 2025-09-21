# 使用官方 Node.js 22 镜像
FROM node:22-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm@9.15.3

# 设置工作目录
WORKDIR /app

# 复制 pnpm 配置文件
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# 复制所有必要的 package.json 文件
COPY apps/web/package.json ./apps/web/
COPY packages/constants/package.json ./packages/constants/

# 安装依赖阶段
FROM base AS deps
RUN pnpm install --frozen-lockfile --prod=false

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/constants/node_modules ./packages/constants/node_modules

# 复制源代码
COPY apps/web ./apps/web
COPY packages/constants ./packages/constants

# 设置工作目录到 web 应用
WORKDIR /app/apps/web

# 生成 API 客户端并构建应用
RUN pnpm api:generate
RUN pnpm build

# 运行阶段
FROM node:22-alpine AS runner
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@9.15.3

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# 设置正确的权限
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=8080

# 启动应用
CMD ["node", "apps/web/server.js"]
