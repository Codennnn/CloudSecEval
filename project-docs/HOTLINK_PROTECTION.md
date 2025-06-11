# 防盗链保护系统使用指南

## 🛡️ 系统概述

本项目已集成完整的防盗链保护系统，防止其他网站未经授权使用你的静态资源。

## ✨ 主要功能

- **智能检测**: 自动识别并阻止恶意盗链请求
- **白名单机制**: 允许搜索引擎和社交媒体正常访问
- **友好降级**: 显示警告图片而非错误页面
- **性能优化**: 基于 Next.js 中间件，响应迅速
- **统计分析**: 记录和分析盗链尝试
- **安全头**: 自动添加安全相关 HTTP 头

## 📁 保护范围

- **文件类型**: jpg, jpeg, png, gif, bmp, ico, svg, webp
- **保护路径**: `/assets/` 目录下的所有资源

## 🌐 允许的域名

### 开发环境

- localhost, 127.0.0.1

### 生产环境

- nestjs-docs-cn.vercel.app
- 你的自定义域名（需配置）

### 搜索引擎

- Google, Bing, 百度, Yandex, DuckDuckGo

### 社交媒体

- Facebook, Twitter, LinkedIn, 微博, 知乎

## ⚙️ 配置架构

### 配置文件说明

我们采用了优化的配置架构，避免重复和冲突：

#### `next.config.ts` - 主要配置

- ✅ **安全 Headers**: 所有安全相关的 HTTP 头
- ✅ **缓存策略**: 静态资源缓存配置
- ✅ **跨平台兼容**: 适用于所有部署平台

#### `middleware.ts` - 防盗链逻辑

- ✅ **Referer 检查**: 核心防盗链逻辑
- ✅ **白名单管理**: 允许的域名和爬虫
- ✅ **智能重定向**: 恶意请求重定向到警告图片

#### `vercel.json` - Vercel 特有配置

- ✅ **重定向规则**: SVG 到 PNG 的重定向
- ✅ **函数配置**: API 路由的超时设置
- ❌ **不包含 Headers**: 避免与 next.config.ts 重复

### 为什么这样设计？

1. **避免冲突**: Vercel 平台配置可能覆盖应用配置
2. **跨平台兼容**: next.config.ts 适用于所有部署平台
3. **维护简单**: 配置集中在一个地方，易于管理
4. **性能优化**: 减少重复处理

## ⚙️ 配置方法

### 1. 更新允许域名

编辑 `middleware.ts` 中的 `allowedDomains`:

```typescript
const allowedDomains = [
  'your-domain.com', // 你的域名
  'www.your-domain.com', // www 版本
  // ...
]
```

### 2. 自定义警告图片

替换 `public/assets/hotlink-warning.png`

## 🧪 测试方法

### 自动测试

```bash
./scripts/test-hotlink-protection.sh
```

### Headers 测试

```bash
./scripts/test-headers.sh
```

### 手动测试

```bash
# 正常访问（应该成功）
curl -I http://localhost:8000/assets/swagger1.png

# 恶意盗链（应该被阻止）
curl -H "Referer: http://evil-site.com" -I http://localhost:8000/assets/swagger1.png
```

## 📊 查看统计

```bash
curl "http://localhost:8000/api/analytics/stats?key=dev-key-change-in-production"
```

生产环境请设置 `ADMIN_KEY` 环境变量。

## 🚀 部署注意事项

1. 更新 `middleware.ts` 中的实际域名
2. 设置 `ADMIN_KEY` 环境变量
3. 确保 `vercel.json` 配置正确（现在更简洁了）

## 🔧 故障排除

- **合法访问被阻止**: 检查域名白名单
- **恶意访问未阻止**: 验证中间件配置
- **性能问题**: 优化白名单和正则表达式
- **Headers 不生效**: 检查 next.config.ts 配置

## 📝 配置最佳实践

1. **单一职责**: 每个配置文件负责特定功能
2. **避免重复**: 不在多个文件中配置相同内容
3. **平台无关**: 优先使用 Next.js 原生配置
4. **测试验证**: 部署前测试所有配置是否生效
