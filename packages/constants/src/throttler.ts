/**
 * 请求频率限制常量
 * 用于控制 API 请求频率，防止滥用
 */

/**
 * 时间窗口常量（毫秒）
 */
export const THROTTLE_TTL = {
  /** 1 分钟 */
  ONE_MINUTE: 60_000,
  /** 5 分钟 */
  FIVE_MINUTES: 300_000,
  /** 15 分钟 */
  FIFTEEN_MINUTES: 900_000,
  /** 1 小时 */
  ONE_HOUR: 3_600_000,
} as const

/**
 * 限流场景配置
 * 格式：{ limit: 请求次数, ttl: 时间窗口(毫秒) }
 */
export const THROTTLE_CONFIG = {
  /** 全局默认限流：开发环境 100 次/分钟，生产环境 60 次/分钟 */
  GLOBAL_DEFAULT: {
    limit: 100,
    ttl: THROTTLE_TTL.ONE_MINUTE,
  },
  GLOBAL_PRODUCTION: {
    limit: 60,
    ttl: THROTTLE_TTL.ONE_MINUTE,
  },

  /** 认证相关 */
  AUTH: {
    /** 登录接口：10 次/分钟 */
    LOGIN: {
      limit: 10,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
    /** 注册接口：5 次/15 分钟 */
    REGISTER: {
      limit: 5,
      ttl: THROTTLE_TTL.FIFTEEN_MINUTES,
    },
    /** 密码重置请求：5 次/15 分钟 */
    PASSWORD_RESET_REQUEST: {
      limit: 5,
      ttl: THROTTLE_TTL.FIFTEEN_MINUTES,
    },
    /** 密码重置：10 次/小时 */
    PASSWORD_RESET: {
      limit: 10,
      ttl: THROTTLE_TTL.ONE_HOUR,
    },
    /** 刷新令牌：20 次/分钟 */
    REFRESH_TOKEN: {
      limit: 20,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
    /** 修改密码：10 次/15 分钟 */
    CHANGE_PASSWORD: {
      limit: 10,
      ttl: THROTTLE_TTL.FIFTEEN_MINUTES,
    },
  },

  /** 文件操作 */
  UPLOAD: {
    /** 单文件上传：20 次/分钟 */
    SINGLE: {
      limit: 20,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
    /** 批量文件上传：10 次/分钟 */
    MULTIPLE: {
      limit: 10,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
    /** 文件下载：50 次/分钟 */
    DOWNLOAD: {
      limit: 50,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
  },

  /** 数据操作 */
  DATA: {
    /** 创建操作：30 次/分钟 */
    CREATE: {
      limit: 30,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
    /** 批量删除：10 次/分钟 */
    BATCH_DELETE: {
      limit: 10,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
    /** 导出操作：5 次/分钟 */
    EXPORT: {
      limit: 5,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
  },

  /** 查询操作 */
  QUERY: {
    /** 列表查询：100 次/分钟 */
    LIST: {
      limit: 100,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
    /** 详情查询：150 次/分钟 */
    DETAIL: {
      limit: 150,
      ttl: THROTTLE_TTL.ONE_MINUTE,
    },
  },
} as const
