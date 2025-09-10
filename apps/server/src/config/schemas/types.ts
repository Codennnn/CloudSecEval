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

export interface AppConfig {
  port: number
  env: Environment
  apiPrefix: string
  cors: {
    origin: string[]
    credentials: boolean
  }
  admin: {
    email: string
    password: string
    name: string
  }
  redis: {
    host: string
    port: number
  }
}

export interface AllConfig {
  app: AppConfig
  database: DatabaseConfig
  jwt: JwtConfig
}
