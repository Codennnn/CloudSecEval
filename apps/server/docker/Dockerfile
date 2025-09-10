# ---------- deps 阶段：安装依赖并生成 Prisma Client ----------
FROM node:22-alpine AS deps

# 启用 pnpm（Node 22 已内置 corepack）
ENV PNPM_HOME=/pnpm
RUN corepack enable

WORKDIR /app

# 复制 monorepo 根目录的依赖清单和工作区配置
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# 复制后端应用的 package.json
COPY apps/server/package.json ./apps/server/

# 安装所有依赖（含 dev，便于后续构建）
RUN pnpm install --frozen-lockfile

# 复制 Prisma 配置与 schema 并生成客户端（生产环境使用 --no-engine）
COPY apps/server/prisma.config.ts ./apps/server/
COPY apps/server/src/prisma ./apps/server/src/prisma

# 切换到后端应用目录生成 Prisma Client
WORKDIR /app/apps/server
RUN pnpm exec prisma generate --no-engine

# 验证生成的客户端
RUN ls -la generated/


# ---------- builder 阶段：复制源码并编译 ----------
FROM node:22-alpine AS builder
ENV PNPM_HOME=/pnpm
RUN corepack enable

WORKDIR /app

# 复制 monorepo 根目录配置
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# 复制后端应用的 package.json
COPY apps/server/package.json ./apps/server/

# 复用 deps 阶段的依赖与 Prisma Client
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/prisma.config.ts ./apps/server/
COPY --from=deps /app/apps/server/src/prisma ./apps/server/src/prisma
COPY --from=deps /app/apps/server/generated ./apps/server/generated

# 复制剩余源码
COPY apps/server/tsconfig*.json apps/server/nest-cli.json ./apps/server/
COPY apps/server/src ./apps/server/src

# 切换到后端应用目录编译
WORKDIR /app/apps/server
RUN pnpm run build

# 剥离开发依赖，仅保留生产所需
# （可选）可在此处执行 pnpm prune --prod 以缩减镜像体积
# 为保证运行时可使用 prisma CLI 执行迁移，此处暂不精简依赖


# ---------- runner 阶段：仅保留运行所需内容 ----------
FROM node:22-alpine AS runner

# 安装系统级依赖
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ghostscript \
    graphicsmagick \
    pandoc \
    && rm -rf /var/cache/apk/*

# 启用 pnpm
ENV PNPM_HOME=/pnpm
RUN corepack enable

WORKDIR /app
ENV NODE_ENV=production

# 复制 monorepo 根目录配置
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
# 复制后端应用的必要文件和生产依赖
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/prisma.config.ts ./apps/server/
COPY --from=builder /app/apps/server/src/prisma ./apps/server/src/prisma
COPY --from=builder /app/apps/server/generated ./apps/server/generated

# 创建并授权存储目录（确保后续使用 node 用户可写）
RUN mkdir -p /app/apps/server/storage && chown -R node:node /app/apps/server/storage

# 可选：声明挂载点，便于数据持久化
VOLUME ["/app/apps/server/storage"]

# 使用非 root 用户提升安全性（node 镜像自带 node 用户）
USER node

# 切换到后端应用目录
WORKDIR /app/apps/server

EXPOSE 8000

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]