import type { Organization } from '#prisma/client'
import type { UnsafeAny } from '~/types/common'

import { BaseSeeder } from '../core/base-seeder'
import type { SeederResult } from '../core/types'
import { DepartmentFactory } from '../factories/department.factory'
import { OrganizationFactory } from '../factories/organization.factory'

/**
 * 组织和部门种子脚本
 * 职责：创建组织架构和部门层级结构
 */
export class OrganizationSeeder extends BaseSeeder {
  readonly name = 'OrganizationSeeder'
  readonly dependencies: string[] = ['AdminSeeder']

  protected async doSeed(): Promise<SeederResult> {
    try {
      let created = 0
      let existing = 0

      // 1. 创建默认管理组织（如果不存在）
      const adminOrg = await this.ensureAdminOrganization()

      if (adminOrg.isNew) {
        created++
      }
      else {
        existing++
      }

      // 1.1 确保管理员组织下存在基础部门（若为空则创建简单结构）
      // 复用通用创建逻辑，isComplex=false => 创建「技术部/销售部/运营部」
      const adminDeptCreated = await this.createDepartmentsForOrg(
        adminOrg.org.id,
        adminOrg.org.name,
        false,
      )
      created += adminDeptCreated

      // 2. 创建示例组织
      const sampleOrgs = await this.createSampleOrganizations()
      created += sampleOrgs.created
      existing += sampleOrgs.existing

      // 3. 为组织创建部门结构
      const deptStats = await this.createDepartmentStructures()
      created += deptStats.created

      // 4. 更新管理员的组织关系
      await this.updateAdminOrganization(adminOrg.org.id)

      this.log(`组织架构创建完成: 组织 ${created + existing} 个，部门 ${deptStats.created} 个`, 'success')

      return {
        success: true,
        message: '组织架构创建完成',
        data: {
          created,
          existing,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`创建组织架构失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '创建组织架构失败',
        error: errorMessage,
      }
    }
  }

  protected async doClean(): Promise<SeederResult> {
    try {
      // 由于外键约束，需要按顺序删除
      const deptResult = await this.prisma.department.deleteMany({})
      const orgResult = await this.prisma.organization.deleteMany({})

      this.log(`删除了 ${orgResult.count} 个组织，${deptResult.count} 个部门`, 'info')

      return {
        success: true,
        message: '组织架构清理完成',
        data: {
          created: 0,
          existing: orgResult.count + deptResult.count,
        },
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`清理组织架构失败: ${errorMessage}`, 'error')

      return {
        success: false,
        message: '清理组织架构失败',
        error: errorMessage,
      }
    }
  }

  async getStats(): Promise<Record<string, number>> {
    const [orgCount, deptCount] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.department.count(),
    ])

    return {
      organizations: orgCount,
      departments: deptCount,
    }
  }

  /**
   * 确保管理员组织存在
   */
  private async ensureAdminOrganization(): Promise<{ org: Organization, isNew: boolean }> {
    const existingOrg = await this.prisma.organization.findFirst({
      where: { code: 'ADMIN_ORG' },
    })

    if (existingOrg) {
      this.log('管理员组织已存在', 'info')

      return { org: existingOrg, isNew: false }
    }

    const adminOrg = await this.prisma.organization.create({
      data: {
        name: '系统管理组织',
        code: 'ADMIN_ORG',
        remark: '系统管理员专用组织',
        isActive: true,
      },
    })

    this.log(`创建管理员组织: ${adminOrg.name}`, 'success')

    return { org: adminOrg, isNew: true }
  }

  /**
   * 创建示例组织
   */
  private async createSampleOrganizations(): Promise<{ created: number, existing: number }> {
    const sampleOrgs = OrganizationFactory.createPredefinedOrganizations()
    let created = 0
    let existing = 0

    for (const orgData of sampleOrgs) {
      const existingOrg = await this.prisma.organization.findFirst({
        where: { code: orgData.code },
      })

      if (existingOrg) {
        existing++
        this.log(`组织已存在: ${orgData.name}`, 'info')
      }
      else {
        await this.prisma.organization.create({ data: orgData })
        created++
        this.log(`创建组织: ${orgData.name}`, 'success')
      }
    }

    return { created, existing }
  }

  /**
   * 为组织创建部门结构
   */
  private async createDepartmentStructures(): Promise<{ created: number }> {
    const orgs = await this.prisma.organization.findMany({
      select: { id: true, name: true, code: true },
    })

    let totalCreated = 0

    for (const org of orgs) {
      // 跳过管理员组织
      if (org.code === 'ADMIN_ORG') {
        continue
      }

      const deptCount = await this.prisma.department.count({
        where: { orgId: org.id },
      })

      if (deptCount > 0) {
        this.log(`组织 ${org.name} 已有部门结构`, 'info')
        continue
      }

      // 第一个组织创建完整结构，其他组织创建简单结构
      const isMainOrg = org.code === 'TECH_INNOVATE'
      const created = await this.createDepartmentsForOrg(org.id, org.name, isMainOrg)
      totalCreated += created
    }

    return { created: totalCreated }
  }

  /**
   * 为指定组织创建部门
   */
  private async createDepartmentsForOrg(
    orgId: string,
    orgName: string,
    isComplex: boolean,
  ): Promise<number> {
    let created = 0

    if (isComplex) {
      // 创建完整的部门结构
      const topLevelDepts = DepartmentFactory.createStandardOrgStructure(orgId)
      const createdTopDepts = []

      for (const deptData of topLevelDepts) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const dept = await this.prisma.department.create({ data: deptData as UnsafeAny })
        createdTopDepts.push(dept)
        created++
        this.log(`创建一级部门: ${dept.name}`, 'info')
      }

      // 为部分一级部门创建子部门
      for (const topDept of createdTopDepts) {
        const subDepts = this.getSubDepartments(orgId, topDept)

        for (const subDeptData of subDepts) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const subDept = await this.prisma.department.create({ data: subDeptData as UnsafeAny })
          created++
          this.log(`创建二级部门: ${subDept.name}`, 'info')

          // 为前端开发部创建三级部门
          if (subDept.name === '前端开发部') {
            const thirdLevelDepts = [
              DepartmentFactory.createWithParent(orgId, subDept.id, {
                name: 'React团队',
                remark: '负责React项目开发',
              }),
              DepartmentFactory.createWithParent(orgId, subDept.id, {
                name: 'Vue团队',
                remark: '负责Vue项目开发',
              }),
            ]

            for (const thirdDeptData of thirdLevelDepts) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              await this.prisma.department.create({ data: thirdDeptData as UnsafeAny })
              created++
              this.log(`创建三级部门: ${thirdDeptData.name}`, 'info')
            }
          }
        }
      }
    }
    else {
      // 创建简单的部门结构
      const simpleDepts = [
        DepartmentFactory.create(orgId, { name: '技术部', remark: '技术研发团队' }),
        DepartmentFactory.create(orgId, { name: '销售部', remark: '销售和客户关系' }),
        DepartmentFactory.create(orgId, { name: '运营部', remark: '日常运营管理' }),
      ]

      for (const deptData of simpleDepts) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        await this.prisma.department.create({ data: deptData as UnsafeAny })
        created++
        this.log(`创建部门: ${deptData.name}`, 'info')
      }
    }

    this.log(`为组织 ${orgName} 创建了 ${created} 个部门`, 'success')

    return created
  }

  /**
   * 获取子部门配置
   */
  private getSubDepartments(orgId: string, topDept: { id: string, name: string }) {
    switch (topDept.name) {
      case '技术中心':
        return DepartmentFactory.createTechDepartments(orgId, topDept.id)

      case '市场中心':
        return DepartmentFactory.createMarketDepartments(orgId, topDept.id)

      case '职能中心':
        return DepartmentFactory.createFunctionalDepartments(orgId, topDept.id)

      default:
        return [
          DepartmentFactory.createWithParent(orgId, topDept.id, {
            name: '客户服务部',
            remark: '负责客户服务和支持',
          }),
          DepartmentFactory.createWithParent(orgId, topDept.id, {
            name: '产品运营部',
            remark: '负责产品运营和数据分析',
          }),
        ]
    }
  }

  /**
   * 更新管理员的组织关系
   */
  private async updateAdminOrganization(orgId: string): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'

    try {
      await this.prisma.user.update({
        where: { email: adminEmail },
        data: { orgId },
      })
      this.log('管理员组织关系更新成功', 'success')
    }
    catch {
      this.log('管理员组织关系更新失败，但组织创建成功', 'warn')
    }
  }
}
