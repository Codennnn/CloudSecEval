# 使用官方 Node.js 22 镜像
FROM --platform=linux/amd64 node:22-alpine AS base

# 安装 pnpm
# 固定 registry，避免受主机 nrm/.npmrc 影响；可通过 --build-arg 覆盖
ARG NPM_REGISTRY=https://registry.npmmirror.com/
ENV npm_config_registry=${NPM_REGISTRY}
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
RUN pnpm install --frozen-lockfile --prod=false --registry=${npm_config_registry}

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

# 设置构建时需要的环境变量（硬编码）
ENV NODE_ENV=test \
    NEXT_PUBLIC_ORAMA_API_KEY=UPc31JnTgKtFPL3bUzL18XfZ8zyiiz0G \
    NEXT_PUBLIC_ORAMA_ENDPOINT=https://cloud.orama.run/v1/indexes/nestjs-docs-leoku-dev-j21flz \
    NEXT_PUBLIC_ENABLE_PAID_CONTENT_MODE=false \
    NEXT_PUBLIC_API_BASE=http://120.197.169.198:58084 \
    NEXT_PUBLIC_API_PROXY_SOURCE=/api \
    NEXT_PUBLIC_API_PROXY_DESTINATION=http://120.197.169.198:58084/api \
    NEXT_PUBLIC_JWT_USE_COOKIE=false \
    NEXT_PUBLIC_PROJECT_FLAG=crowd-test

# 生成 API 客户端并构建应用
RUN pnpm api:setup
RUN pnpm build

# 运行阶段
FROM --platform=linux/amd64 node:22-alpine AS runner
WORKDIR /app

# 安装 pnpm
# 固定 registry（运行阶段通常不再安装依赖，但为一致性保留）
ARG NPM_REGISTRY=https://registry.npmmirror.com/
ENV npm_config_registry=${NPM_REGISTRY}
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

# 暴露端口（容器内部使用 8080）
EXPOSE 8080

# 设置运行时环境变量
ENV NODE_ENV=test \
    HOSTNAME="0.0.0.0" \
    PORT=8080 \
    NEXT_PUBLIC_ORAMA_API_KEY=UPc31JnTgKtFPL3bUzL18XfZ8zyiiz0G \
    NEXT_PUBLIC_ORAMA_ENDPOINT=https://cloud.orama.run/v1/indexes/nestjs-docs-leoku-dev-j21flz \
    NEXT_PUBLIC_ENABLE_PAID_CONTENT_MODE=false \
    NEXT_PUBLIC_API_BASE=http://172.168.88.192:8084 \
    NEXT_PUBLIC_API_PROXY_SOURCE=/api \
    NEXT_PUBLIC_API_PROXY_DESTINATION=http://172.168.88.192:8084/api \
    NEXT_PUBLIC_JWT_USE_COOKIE=false \
    NEXT_PUBLIC_PROJECT_FLAG=crowd-test

# 启动应用
CMD ["node", "apps/web/server.js"]
