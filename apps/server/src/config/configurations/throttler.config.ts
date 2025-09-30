import { THROTTLE_CONFIG } from '@mono/constants'
import { registerAs } from '@nestjs/config'

export default registerAs('throttler', () => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return {
    // 是否启用频率限制
    enabled: process.env.THROTTLE_ENABLED !== 'false',

    // 全局默认限流配置
    ttl: process.env.THROTTLE_TTL
      ? Number(process.env.THROTTLE_TTL)
      : isDevelopment
        ? THROTTLE_CONFIG.GLOBAL_DEFAULT.ttl
        : THROTTLE_CONFIG.GLOBAL_PRODUCTION.ttl,

    limit: process.env.THROTTLE_LIMIT
      ? Number(process.env.THROTTLE_LIMIT)
      : isDevelopment
        ? THROTTLE_CONFIG.GLOBAL_DEFAULT.limit
        : THROTTLE_CONFIG.GLOBAL_PRODUCTION.limit,

    // 是否跳过代理后的请求（生产环境通常在负载均衡器后面）
    skipIfBehindProxy: process.env.THROTTLE_SKIP_IF_BEHIND_PROXY === 'true',
  }
})
