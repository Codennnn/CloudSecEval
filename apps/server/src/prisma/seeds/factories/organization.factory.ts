import { faker } from '@faker-js/faker'

import type { Prisma } from '#prisma/client'
import type { CreateOrganizationDto } from '~/modules/organizations/dto/create-organization.dto'

/**
 * 组织工厂
 * 用于生成测试组织数据
 */
export const OrganizationFactory = {
  /**
   * 生成单个组织数据
   * - 生成真实的组织名称和编码
   * - 可自定义组织属性
   */
  create(overrides: Partial<CreateOrganizationDto> = {}): Prisma.OrganizationCreateInput {
    const companyName = faker.company.name()
    const companyCode = faker.string.alphanumeric({ length: 8, casing: 'upper' })

    return {
      name: companyName,
      code: companyCode,
      remark: faker.lorem.sentence(),
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      ...overrides,
    }
  },

  /**
   * 生成多个组织数据
   * - 批量生成指定数量的组织
   * - 确保名称和编码的唯一性
   */
  createMany(
    count: number,
    overrides: Partial<CreateOrganizationDto> = {},
  ): Prisma.OrganizationCreateInput[] {
    const organizations: Prisma.OrganizationCreateInput[] = []
    const usedNames = new Set<string>()
    const usedCodes = new Set<string>()

    for (let i = 0; i < count; i++) {
      let organization: Prisma.OrganizationCreateInput
      let attempts = 0
      const maxAttempts = 50

      do {
        organization = this.create(overrides)
        attempts++

        if (attempts > maxAttempts) {
          // 如果重试太多次，添加后缀确保唯一性
          organization.name = `${organization.name} ${i + 1}`
          organization.code = `${organization.code}_${i + 1}`
          break
        }
      } while (usedNames.has(organization.name) || usedCodes.has(organization.code))

      usedNames.add(organization.name)
      usedCodes.add(organization.code)
      organizations.push(organization)
    }

    return organizations
  },

  /**
   * 创建默认组织
   * - 用于测试环境的标准组织
   */
  createDefault(): Prisma.OrganizationCreateInput {
    return this.create({
      name: '科技有限公司',
      code: 'TECH_CORP',
      remark: '默认测试组织',
      isActive: true,
    })
  },

  /**
   * 创建多个预定义组织
   * - 包含不同类型的组织示例
   */
  createPredefinedOrganizations(): Prisma.OrganizationCreateInput[] {
    return [
      this.create({
        name: '创新科技有限公司',
        code: 'INNOV_TECH',
        remark: '专注于前沿技术研发的创新型企业',
        isActive: true,
      }),
      this.create({
        name: '数字解决方案集团',
        code: 'DIGITAL_SOL',
        remark: '提供数字化转型解决方案的大型集团',
        isActive: true,
      }),
      this.create({
        name: '智慧城市建设公司',
        code: 'SMART_CITY',
        remark: '专业从事智慧城市项目建设',
        isActive: true,
      }),
      this.create({
        name: '云计算服务商',
        code: 'CLOUD_SERV',
        remark: '领先的云计算基础设施服务提供商',
        isActive: false, // 示例：已停用的组织
      }),
    ]
  },
}
