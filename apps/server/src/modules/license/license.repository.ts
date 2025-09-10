import { Injectable } from '@nestjs/common'

import { License, Prisma } from '#prisma/client'
import { DEFAULT_PAGE_SIZE, getPaginationParams } from '~/common/utils/pagination.util'
import { PrismaService } from '~/prisma/prisma.service'

import { FindLicensesDto } from './dto/find-licenses.dto'
import { AccessLogEntity } from './entities/access-log.entity'
import { maskLicensesData } from './utils/license-mask.util'
import { LicenseSearchBuilder } from './utils/license-search-builder.util'

@Injectable()
export class LicenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: License['id']) {
    return this.prisma.license.findUnique({
      where: { id },
    })
  }

  findByCode(code: License['code']) {
    return this.prisma.license.findUnique({
      where: { code },
    })
  }

  findByEmailAndCode(email: License['email'], code: License['code']) {
    return this.prisma.license.findFirst({
      where: {
        email,
        code,
      },
    })
  }

  create(data: Prisma.LicenseCreateInput) {
    return this.prisma.license.create({
      data,
    })
  }

  async update(
    id: License['id'],
    data: Prisma.LicenseUpdateInput,
  ) {
    return this.prisma.license.update({
      where: { id },
      data,
    })
  }

  async deleteById(id: License['id']): Promise<number> {
    try {
      await this.prisma.license.delete({
        where: { id },
      })

      return 1
    }
    catch {
      // 如果记录不存在，Prisma 会抛出错误，返回 0 表示没有删除任何记录
      return 0
    }
  }

  async createAccessLog(data: {
    licenseId: string
    email: string
    ip: string
    isRisky: boolean
  }): Promise<AccessLogEntity> {
    const accessLog = await this.prisma.accessLog.create({
      data,
    })

    return new AccessLogEntity(accessLog)
  }

  async getAccessLogs(licenseId: License['id'], pageSize = DEFAULT_PAGE_SIZE): Promise<AccessLogEntity[]> {
    const logs = await this.prisma.accessLog.findMany({
      where: { licenseId },
      orderBy: { accessedAt: 'desc' },
      take: pageSize,
    })

    return logs.map((log) => new AccessLogEntity(log))
  }

  async getRecentRiskyCount(licenseId: License['id'], hours = 24): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    return await this.prisma.accessLog.count({
      where: {
        licenseId,
        isRisky: true,
        accessedAt: {
          gte: since,
        },
      },
    })
  }

  async getLicenseStats(licenseId: License['id']): Promise<{
    totalAccesses: number
    commonIPs: string[]
    recentRiskyAccesses: number
    lastAccessTime?: Date
  }> {
    // 获取总访问次数和最后访问时间
    const [totalAccesses, lastAccessLog] = await Promise.all([
      this.prisma.accessLog.count({
        where: { licenseId },
      }),
      this.prisma.accessLog.findFirst({
        where: { licenseId },
        orderBy: { accessedAt: 'desc' },
        select: { accessedAt: true },
      }),
    ])

    // 获取常用 IP（按访问次数排序，取前 3 个）
    const ipStats = await this.prisma.accessLog.groupBy({
      by: ['ip'],
      where: { licenseId },
      _count: { ip: true },
      orderBy: { _count: { ip: 'desc' } },
      take: 3,
    })

    const commonIPs = ipStats.map((stat) => stat.ip)

    // 获取最近 24 小时的风险访问次数
    const recentRiskyAccesses = await this.getRecentRiskyCount(licenseId)

    return {
      totalAccesses,
      commonIPs,
      recentRiskyAccesses,
      lastAccessTime: lastAccessLog?.accessedAt,
    }
  }

  /**
   * 标记授权码为过期
   */
  markAsExpired(licenseId: License['id']) {
    return this.prisma.license.update({
      where: { id: licenseId },
      data: { isExpired: true },
    })
  }

  /**
   * 批量标记过期授权码
   * @returns 标记为过期的授权码数量
   */
  async markExpiredLicensesBatch(): Promise<number> {
    const now = new Date()

    const result = await this.prisma.license.updateMany({
      where: {
        expiresAt: {
          lt: now,
        },
        isExpired: false,
      },
      data: {
        isExpired: true,
      },
    })

    return result.count
  }

  async findWithAdvancedSearch(searchDto: FindLicensesDto) {
    const searchBuilder = new LicenseSearchBuilder(searchDto)

    // 构建基础查询条件
    const whereCondition = searchBuilder.buildWhere()
    const orderBy = searchBuilder.buildOrderBy()

    const { skip, take } = getPaginationParams({
      page: searchDto.page,
      pageSize: searchDto.pageSize,
    })

    const [licenses, total] = await Promise.all([
      this.prisma.license.findMany({
        where: whereCondition,
        orderBy,
        skip,
        take,
      }),
      this.prisma.license.count({
        where: whereCondition,
      }),
    ])

    // 对授权码数据进行脱敏处理
    const maskedLicenses = maskLicensesData(licenses, 'code')

    return {
      licenses: maskedLicenses,
      total,
    }
  }
}
