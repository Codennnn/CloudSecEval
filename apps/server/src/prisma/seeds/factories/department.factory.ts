import { faker } from '@faker-js/faker'

import type { CreateDepartmentDto } from '~/modules/departments/dto/create-department.dto'

/**
 * 部门工厂
 * 用于生成测试部门数据
 */
export const DepartmentFactory = {
  /**
   * 生成单个部门数据
   * - 生成合理的部门名称
   * - 可自定义部门属性
   */
  create(
    orgId: string,
    overrides: Partial<Omit<CreateDepartmentDto, 'orgId' | 'parentId'>> = {},
  ): Omit<CreateDepartmentDto, 'orgId' | 'parentId'> {
    return {
      name: this.generateDepartmentName(),
      remark: faker.lorem.sentence(),
      isActive: faker.datatype.boolean({ probability: 0.95 }),
      organization: {
        connect: { id: orgId },
      },
      ...overrides,
    }
  },

  /**
   * 创建带上级部门的部门
   * - 用于构建部门层级结构
   */
  createWithParent(
    orgId: string,
    parentId: string,
    overrides: Partial<Omit<CreateDepartmentDto, 'orgId' | 'parentId'>> = {},
  ): Omit<CreateDepartmentDto, 'orgId' | 'parentId'> {
    return {

      ...this.create(orgId, overrides),
      parent: {
        connect: { id: parentId },
      },
    }
  },

  /**
   * 生成部门名称
   * - 从预定义的部门名称列表中随机选择
   */
  generateDepartmentName(): string {
    const departments = [
      // 技术部门
      '研发部', '技术部', '产品部', '测试部', '运维部', '架构部',
      '前端开发部', '后端开发部', '移动开发部', '数据部', 'AI研发部',

      // 业务部门
      '销售部', '市场部', '客服部', '运营部', '商务部', '渠道部',
      '项目管理部', '产品运营部', '用户增长部', '品牌部',

      // 职能部门
      '人力资源部', '财务部', '行政部', '法务部', '采购部', '审计部',
      '企划部', '质量管理部', '安全部', '培训部',

      // 管理部门
      '总经理办公室', '董事会秘书处', '战略发展部', '投资部',
      '风险控制部', '合规部', '公共关系部',
    ]

    return faker.helpers.arrayElement(departments)
  },

  /**
   * 创建标准的组织架构
   * - 生成典型的企业部门结构
   * - 包含多级部门层次
   */
  createStandardOrgStructure(orgId: string): Omit<CreateDepartmentDto, 'orgId' | 'parentId'>[] {
    return [
      // 一级部门
      this.create(orgId, { name: '技术中心', remark: '负责技术研发和产品开发' }),
      this.create(orgId, { name: '市场中心', remark: '负责市场营销和销售业务' }),
      this.create(orgId, { name: '运营中心', remark: '负责产品运营和客户服务' }),
      this.create(orgId, { name: '职能中心', remark: '负责人力、财务等职能管理' }),
    ]
  },

  /**
   * 创建技术部门的子部门
   * - 为技术中心创建详细的子部门结构
   */
  createTechDepartments(
    orgId: string,
    techCenterId: string,
  ): Omit<CreateDepartmentDto, 'orgId' | 'parentId'>[] {
    return [
      this.createWithParent(orgId, techCenterId, {
        name: '前端开发部',
        remark: '负责Web和移动端前端开发',
      }),
      this.createWithParent(orgId, techCenterId, {
        name: '后端开发部',
        remark: '负责服务端和API开发',
      }),
      this.createWithParent(orgId, techCenterId, {
        name: '测试部',
        remark: '负责软件质量保证和测试',
      }),
      this.createWithParent(orgId, techCenterId, {
        name: '运维部',
        remark: '负责系统运维和DevOps',
      }),
      this.createWithParent(orgId, techCenterId, {
        name: '数据部',
        remark: '负责数据分析和数据科学',
      }),
    ]
  },

  /**
   * 创建市场部门的子部门
   * - 为市场中心创建详细的子部门结构
   */
  createMarketDepartments(
    orgId: string,
    marketCenterId: string,
  ): Omit<CreateDepartmentDto, 'orgId' | 'parentId'>[] {
    return [
      this.createWithParent(orgId, marketCenterId, {
        name: '销售部',
        remark: '负责产品销售和客户关系管理',
      }),
      this.createWithParent(orgId, marketCenterId, {
        name: '市场推广部',
        remark: '负责品牌推广和市场活动',
      }),
      this.createWithParent(orgId, marketCenterId, {
        name: '商务拓展部',
        remark: '负责商务合作和渠道拓展',
      }),
    ]
  },

  /**
   * 创建职能部门的子部门
   * - 为职能中心创建详细的子部门结构
   */
  createFunctionalDepartments(
    orgId: string,
    functionalCenterId: string,
  ): Omit<CreateDepartmentDto, 'orgId' | 'parentId'>[] {
    return [
      this.createWithParent(orgId, functionalCenterId, {
        name: '人力资源部',
        remark: '负责人员招聘、培训和绩效管理',
      }),
      this.createWithParent(orgId, functionalCenterId, {
        name: '财务部',
        remark: '负责财务管理和成本控制',
      }),
      this.createWithParent(orgId, functionalCenterId, {
        name: '行政部',
        remark: '负责行政管理和后勤保障',
      }),
      this.createWithParent(orgId, functionalCenterId, {
        name: '法务部',
        remark: '负责法律事务和合规管理',
      }),
    ]
  },
}
