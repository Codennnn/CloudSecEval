#!/bin/bash

set -e

echo "🚀 启动 Next.js Web 应用..."

# 切换到 docker 目录
cd "$(dirname "$0")/.."

# 检查 Docker Compose 文件是否存在
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 错误：docker-compose.yml 文件不存在"
    exit 1
fi

# 启动服务
echo "📦 启动 Docker 服务..."
docker-compose -f docker-compose.yml up -d

echo "✅ 应用已启动！"
echo ""
echo "🎯 常用命令："
echo "  查看日志: docker-compose logs -f"
echo "  停止应用: docker-compose down"
echo "  重启应用: docker-compose restart"
echo ""
echo "🌐 访问地址: http://localhost:3001"
echo "📊 查看状态: docker-compose ps"
