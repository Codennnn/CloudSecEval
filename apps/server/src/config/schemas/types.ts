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
    origin: boolean | string | string[]
    credentials: boolean
  }
  admin: {
    email: string
    password: string
    name: string
  }
}

export interface AllConfig {
  app: AppConfig
  database: DatabaseConfig
  jwt: JwtConfig
}
