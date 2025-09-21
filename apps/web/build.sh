#!/bin/bash

set -e

echo "🚀 构建 Next.js Web 应用..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录（包含 package.json）运行此脚本"
    exit 1
fi

# 构建 Docker 镜像
echo "📦 构建 Docker 镜像..."
docker build -t nest-web:latest -f apps/web/Dockerfile .

echo "✅ 构建完成！"
echo ""
echo "🎯 使用方法："
echo "  直接运行: docker run -p 8080:8080 --env-file apps/web/.env.production nestjs-docs-web:latest"
echo "  使用 compose: cd apps/web && docker-compose up"
echo ""
echo "🌐 访问地址: http://localhost:8080"
