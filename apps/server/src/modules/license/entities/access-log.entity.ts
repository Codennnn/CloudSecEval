/**
 * 访问日志实体类
 * 用于记录授权码使用情况和风控分析
 */
export class AccessLogEntity {
  /** 唯一标识符 */
  id!: string

  /** 关联的授权码ID */
  licenseId!: string

  /** 邮箱地址 */
  email!: string

  /** 访问IP地址 */
  ip!: string

  /** 是否为风险访问 */
  isRisky!: boolean

  /** 访问时间 */
  accessedAt!: Date

  constructor(partial: Partial<AccessLogEntity>) {
    Object.assign(this, partial)
  }
}
