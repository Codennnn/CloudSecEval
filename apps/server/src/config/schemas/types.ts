import type { Environment } from './defaults'

export interface DatabaseConfig {
  url?: string
}

export interface JwtConfig {
  secret: string
  expiresIn: string
  refreshSecret: string
  refreshExpiresIn: string
}

export interface ThrottlerConfig {
  enabled: boolean
  ttl: number
  limit: number
  skipIfBehindProxy: boolean
}

export interface AppConfig {
  port: number
  env: Environment
  apiPrefix: string
  cors: {
    origin: boolean | string | string[]
    credentials: boolean
  }
  admin: {
    email: string
    password: string
    name: string
  }
  timezone: string
  tempDir: string
}

export interface AllConfig {
  app: AppConfig
  database: DatabaseConfig
  jwt: JwtConfig
  throttler: ThrottlerConfig
}
