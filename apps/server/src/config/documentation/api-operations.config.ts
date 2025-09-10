import { BUSINESS_ERROR_CODES } from '~/common/constants/business-codes'
import { StandardResponseDto } from '~/common/dto/standard-response.dto'
import { DeleteUserApiResponseDto, LoginApiResponseDto, LogoutApiResponseDto, PasswordResetRequestApiResponseDto, PasswordResetSuccessApiResponseDto, RefreshTokenApiResponseDto, RegisterApiResponseDto, TokenVerifyApiResponseDto } from '~/modules/auth/dto/auth-response.dto'
import { DepartmentApiResponseDto, DepartmentListApiResponseDto, DepartmentMembersApiResponseDto, DepartmentTreeApiResponseDto } from '~/modules/departments/dto/department-response.dto'
import { AdminCheckLicenseApiResponseDto, CheckLicenseApiResponseDto, CreateLicenseApiResponseDto, DeleteLicenseApiResponseDto, LicenseDetailApiResponseDto, LicenseListApiResponseDto, LogAccessApiResponseDto, SendRemindersResponseDataDto, ToggleLockResponseDataDto, UpdateLicenseApiResponseDto } from '~/modules/license/dto/license-response.dto'
import { OrganizationApiResponseDto, OrganizationListApiResponseDto } from '~/modules/organizations/dto/organization-response.dto'
import { PermissionApiResponseDto, PermissionListApiResponseDto } from '~/modules/permissions/dto/permission-response.dto'
import { RoleApiResponseDto, RoleListApiResponseDto } from '~/modules/roles/dto/role-response.dto'
import { AccessStatisticsResponseDto, ConversionFunnelResponseDto, DashboardOverviewResponseDto, LicenseStatisticsResponseDto, LicenseTrendResponseDto, RealtimeMonitoringResponseDto, RevenueStatisticsResponseDto, RiskAnalysisResponseDto, UserStatisticsResponseDto } from '~/modules/statistics/dto/statistics-response.dto'
import { UserApiResponseDto, UserListApiResponseDto } from '~/modules/users/dto/user-response.dto'

import { createSuccessResponse } from './api-responses.config'
import type { ApiOperationConfig } from './types/api-docs.types'

export const APP_API_CONFIG = {
  root: {
    summary: '获取应用信息',
    description: '获取应用的基本信息',
    successResponse: createSuccessResponse({
      type: StandardResponseDto,
    }),
    requireAuth: false,
  },

  getStandardResponse: {
    summary: '获取标准响应',
    description: '获取标准响应',
    successResponse: createSuccessResponse({
      description: '获取标准响应成功',
    }),
    requireAuth: false,
  },
} satisfies Record<string, ApiOperationConfig>

// ================================
// MARK: 授权码管理API配置
// ================================

export const LICENSE_API_CONFIG = {
  createLicense: {
    summary: '创建授权码',
    description: '为指定邮箱创建并发送授权码（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '授权码发放成功，邮件已发送',
      type: CreateLicenseApiResponseDto,
    }),
    requireAdmin: true,
  },

  getLicensesByEmail: {
    summary: '根据邮箱获取授权码列表',
    description: '获取指定邮箱下的所有授权码信息',
    successResponse: createSuccessResponse({
      description: '成功获取授权码列表',
      type: LicenseListApiResponseDto,
    }),
    requireAdmin: true,
  },

  checkLicense: {
    summary: '授权验证',
    description: '验证邮箱和授权码是否匹配，检查访问权限',
    successResponse: createSuccessResponse({
      description: '授权验证成功',
      type: CheckLicenseApiResponseDto,
    }),
    requireAuth: false,
  },

  logAccess: {
    summary: '记录访问日志',
    description: '记录用户访问付费内容的详细日志',
    successResponse: createSuccessResponse({
      description: '访问日志记录成功',
      type: LogAccessApiResponseDto,
    }),
  },

  deleteLicense: {
    summary: '删除授权码',
    description: '根据授权码 ID 删除授权码记录（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '授权码删除成功',
      type: DeleteLicenseApiResponseDto,
    }),
    requireAdmin: true,
  },

  getLicenseById: {
    summary: '获取单个授权码详情',
    description: '根据 ID 获取授权码的详细信息，包括统计数据（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '获取授权码详情成功',
      type: LicenseDetailApiResponseDto,
    }),
    requireAdmin: true,
  },

  updateLicense: {
    summary: '更新授权码信息',
    description: '根据 ID 更新授权码的详细信息（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '授权码更新成功',
      type: UpdateLicenseApiResponseDto,
    }),
    requireAdmin: true,
  },

  toggleLockLicense: {
    summary: '锁定/解锁授权码',
    description: '切换授权码的锁定状态（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '授权码状态更新成功',
      type: ToggleLockResponseDataDto,
    }),
    requireAdmin: true,
  },

  adminCheckLicense: {
    summary: '管理员测试授权码',
    description: '管理员测试授权码有效性，支持通过 ID 或邮箱+授权码查询，ID 优先级最高，不记录访问日志和风控检查（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '授权码测试完成',
      type: AdminCheckLicenseApiResponseDto,
    }),
    requireAdmin: true,
  },

  getLicenseList: {
    summary: '获取授权码列表',
    description: '获取授权码列表，支持分页、搜索和高级筛选功能',
    successResponse: createSuccessResponse({
      description: '获取授权码列表成功',
      type: LicenseListApiResponseDto,
    }),
    requireAdmin: true,
  },

  sendExpirationReminders: {
    summary: '发送过期提醒',
    description: '向即将过期的授权码用户发送提醒邮件（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '发送完成',
      type: SendRemindersResponseDataDto,
    }),
    requireAdmin: true,
  },
} satisfies Record<string, ApiOperationConfig>

// ================================
// MARK: 用户管理API配置
// ================================

export const USERS_API_CONFIG = {
  create: {
    summary: '创建用户',
    description: '创建一个新的用户（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '用户创建成功',
      type: UserApiResponseDto,
    }),
    requireAdmin: true,
  },

  findAllUsers: {
    summary: '查询用户列表',
    description: '获取用户列表，支持分页、搜索和筛选（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '获取用户列表成功',
      type: UserListApiResponseDto,
    }),
    requireAdmin: true,
  },

  findUser: {
    summary: '获取用户详情',
    description: '根据用户ID获取用户详情',
    successResponse: createSuccessResponse({
      description: '获取用户详情成功',
      type: UserApiResponseDto,
    }),
    requireAdmin: true,
  },

  update: {
    summary: '更新用户',
    description: '更新用户信息',
    successResponse: createSuccessResponse({
      description: '用户更新成功',
      type: UserApiResponseDto,
    }),
    requireAdmin: true,
  },

  removeUser: {
    summary: '删除用户',
    description: '删除用户',
    successResponse: createSuccessResponse({
      description: '用户删除成功',
      type: DeleteUserApiResponseDto,
    }),
    errorResponseCode: [BUSINESS_ERROR_CODES.CANNOT_DELETE_SELF],
    requireAdmin: true,
  },

  updateAvatar: {
    summary: '更新用户头像',
    description: '更新用户头像',
    successResponse: createSuccessResponse({
      description: '用户头像更新成功',
      type: UserApiResponseDto,
    }),
    requireAdmin: true,
    consumes: ['multipart/form-data'],
    requestBody: {
      description: '选择要上传的头像文件（字段名：file）',
      schema: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary' },
        },
        required: ['file'],
      },
    },
  },

  exportUsers: {
    summary: '导出用户列表（Excel）',
    description: '根据当前查询条件导出用户列表为 Excel（仅限管理员）',
    successResponse: createSuccessResponse({
      description: 'Excel 文件流',
      schema: {
        type: 'string',
        format: 'binary',
      },
    }),
    requireAdmin: true,
    // content-type 在控制器使用 @Header 设置，这里通过 schema 标注为二进制
  },
} satisfies Record<string, ApiOperationConfig>

// ================================
// MARK: 认证管理API配置
// ================================

export const AUTH_API_CONFIG = {
  register: {
    summary: '用户注册',
    description: '注册新用户账号',
    successResponse: createSuccessResponse({
      description: '注册成功',
      type: RegisterApiResponseDto,
    }),
    requireAuth: false,
  },

  login: {
    summary: '用户登录',
    description: '用户登录获取访问令牌',
    successResponse: createSuccessResponse({
      description: '登录成功',
      type: LoginApiResponseDto,
    }),
    requireAuth: false,
  },

  getProfile: {
    summary: '获取用户资料',
    description: '获取当前登录用户的个人资料',
    successResponse: createSuccessResponse({
      description: '获取用户资料成功',
      type: UserApiResponseDto,
    }),
    requireAdmin: false,
  },

  updateProfile: {
    summary: '更新用户资料',
    description: '更新当前登录用户的个人资料，包括姓名、邮箱、手机号、头像等信息',
    successResponse: createSuccessResponse({
      description: '用户资料更新成功',
      type: UserApiResponseDto,
    }),
    requireAdmin: false,
  },

  refreshToken: {
    summary: '刷新访问令牌',
    description: '使用刷新令牌获取新的访问令牌',
    successResponse: createSuccessResponse({
      description: '令牌刷新成功',
      type: RefreshTokenApiResponseDto,
    }),
    requireAuth: false,
  },

  requestPasswordReset: {
    summary: '请求密码重置',
    description: '发送密码重置邮件',
    successResponse: createSuccessResponse({
      description: '密码重置邮件发送成功',
      type: PasswordResetRequestApiResponseDto,
    }),
    requireAuth: false,
  },

  resetPassword: {
    summary: '重置密码',
    description: '使用令牌重置密码',
    successResponse: createSuccessResponse({
      description: '密码重置成功',
      type: PasswordResetSuccessApiResponseDto,
    }),
    requireAuth: false,
  },

  verifyToken: {
    summary: '验证令牌',
    description: '验证当前访问令牌是否有效',
    successResponse: createSuccessResponse({
      description: '令牌验证成功',
      type: TokenVerifyApiResponseDto,
    }),
    requireAdmin: false,
  },

  logout: {
    summary: '用户登出',
    description: '清除认证状态和Cookie',
    successResponse: createSuccessResponse({
      description: '登出成功',
      type: LogoutApiResponseDto,
    }),
    requireAdmin: false,
  },
} satisfies Record<string, ApiOperationConfig>

// ================================
// MARK: 统计信息API配置
// ================================

export const STATISTICS_API_CONFIG = {
  getDashboardOverview: {
    summary: '仪表盘概览统计',
    description: '获取仪表盘概览统计信息，包括已有授权码用户总数、授权码总收入及其增长率',
    successResponse: createSuccessResponse({
      description: '仪表盘概览统计获取成功',
      type: DashboardOverviewResponseDto,
    }),
    requireAdmin: true,
  },

  getUserOverview: {
    summary: '用户概览统计',
    description: '获取用户总数、活跃用户数、新增用户数、用户增长趋势和状态分布等统计信息',
    successResponse: createSuccessResponse({
      description: '用户概览统计获取成功',
      type: UserStatisticsResponseDto,
    }),
    requireAdmin: true,
  },

  getUserActivity: {
    summary: '用户活跃度统计',
    description: '获取不同时间段的用户活跃度数据，包括日活、周活、月活等指标',
    successResponse: createSuccessResponse({
      description: '用户活跃度统计获取成功',
      type: UserStatisticsResponseDto,
    }),
    requireAdmin: true,
  },

  getUserGeoDistribution: {
    summary: '用户地理分布',
    description: '基于IP地址分析用户的地理位置分布情况',
    successResponse: createSuccessResponse({
      description: '用户地理分布获取成功',
      type: UserStatisticsResponseDto,
    }),
    requireAdmin: true,
  },

  getLicenseOverview: {
    summary: '授权码概览统计',
    description: '获取授权码总数、使用情况、状态分布和生成趋势等统计信息',
    successResponse: createSuccessResponse({
      description: '授权码概览统计获取成功',
      type: LicenseStatisticsResponseDto,
    }),
    requireAdmin: true,
  },

  getLicenseUsage: {
    summary: '授权码使用分析',
    description: '分析授权码的使用率、过期情况和风控统计',
    successResponse: createSuccessResponse({
      description: '授权码使用分析获取成功',
      type: LicenseStatisticsResponseDto,
    }),
    requireAdmin: true,
  },

  getLicenseTrend: {
    summary: '授权码趋势分析',
    description: '获取指定日期范围内每日新增授权码数量的趋势数据，便于前端生成折线图',
    successResponse: createSuccessResponse({
      description: '授权码趋势分析获取成功',
      type: LicenseTrendResponseDto,
    }),
    requireAdmin: true,
  },

  getRevenue: {
    summary: '收入统计',
    description: '获取总收入、收入趋势、平均客单价和收入分布等财务统计数据',
    successResponse: createSuccessResponse({
      description: '收入统计获取成功',
      type: RevenueStatisticsResponseDto,
    }),
    requireAdmin: true,
  },

  getAccessVolume: {
    summary: '访问量统计',
    description: '获取总访问量、访问趋势、高峰时段和访问频率分布等统计信息',
    successResponse: createSuccessResponse({
      description: '访问量统计获取成功',
      type: AccessStatisticsResponseDto,
    }),
    requireAdmin: true,
  },

  getRiskAnalysis: {
    summary: '风险访问分析',
    description: '分析风险访问比例、风险类型分布、IP异常和风控效果评估',
    successResponse: createSuccessResponse({
      description: '风险访问分析获取成功',
      type: RiskAnalysisResponseDto,
    }),
    requireAdmin: true,
  },

  getDeviceNetworkAnalysis: {
    summary: '设备和网络分析',
    description: '分析访问设备、网络提供商和访问模式等信息',
    successResponse: createSuccessResponse({
      description: '设备和网络分析获取成功',
      type: AccessStatisticsResponseDto,
    }),
    requireAdmin: true,
  },

  getConversionFunnel: {
    summary: '转化漏斗分析',
    description: '分析从邮箱验证到授权码使用的完整转化过程',
    successResponse: createSuccessResponse({
      description: '转化漏斗分析获取成功',
      type: ConversionFunnelResponseDto,
    }),
    requireAdmin: true,
  },

  getCustomerValue: {
    summary: '客户价值分析',
    description: '分析客户生命周期价值、客户分层和重复购买行为',
    successResponse: createSuccessResponse({
      description: '客户价值分析获取成功',
      type: RevenueStatisticsResponseDto,
    }),
    requireAdmin: true,
  },

  getPerformance: {
    summary: '产品性能指标',
    description: '获取系统健康度、服务可用性和数据库性能等技术指标',
    successResponse: createSuccessResponse({
      description: '产品性能指标获取成功',
      type: RealtimeMonitoringResponseDto,
    }),
    requireAdmin: true,
  },

  getSecurityEvents: {
    summary: '安全事件统计',
    description: '统计异常访问事件、账户锁定和密码重置等安全相关事件',
    successResponse: createSuccessResponse({
      description: '安全事件统计获取成功',
      type: RiskAnalysisResponseDto,
    }),
    requireAdmin: true,
  },

  getRiskControl: {
    summary: '风控效果评估',
    description: '评估风控规则的触发率、误报率和优化建议',
    successResponse: createSuccessResponse({
      description: '风控效果评估获取成功',
      type: RiskAnalysisResponseDto,
    }),
    requireAdmin: true,
  },

  getRealtimeDashboard: {
    summary: '实时数据监控',
    description: '获取实时在线用户数、访问量、收入和系统状态等实时数据',
    successResponse: createSuccessResponse({
      description: '实时数据监控获取成功',
      type: RealtimeMonitoringResponseDto,
    }),
    requireAdmin: true,
  },

  getRealtimeAlerts: {
    summary: '异常告警数据',
    description: '获取访问量突增、授权码异常锁定、系统性能异常等告警信息',
    successResponse: createSuccessResponse({
      description: '异常告警数据获取成功',
      type: RealtimeMonitoringResponseDto,
    }),
    requireAdmin: true,
  },
} satisfies Record<string, ApiOperationConfig>

// ================================
// MARK: 部门管理API配置
// ================================

export const DEPARTMENTS_API_CONFIG = {
  create: {
    summary: '创建部门',
    description: '创建一个新的部门（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '部门创建成功',
      type: DepartmentApiResponseDto,
    }),
    requireAdmin: true,
  },

  findAllDepartments: {
    summary: '查询部门列表',
    description: '获取部门列表，支持分页、搜索和筛选（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '获取部门列表成功',
      type: DepartmentListApiResponseDto,
    }),
    requireAdmin: true,
  },

  findDepartment: {
    summary: '获取部门详情',
    description: '根据部门ID获取部门详情（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '获取部门详情成功',
      type: DepartmentApiResponseDto,
    }),
    requireAdmin: true,
  },

  getDepartmentTree: {
    summary: '获取部门树',
    description: '获取指定组织下的部门树形结构（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '获取部门树成功',
      type: DepartmentTreeApiResponseDto,
    }),
    requireAdmin: true,
  },

  update: {
    summary: '更新部门',
    description: '更新部门信息（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '部门更新成功',
      type: DepartmentApiResponseDto,
    }),
    requireAdmin: true,
  },

  getDepartmentMembers: {
    summary: '获取部门成员列表',
    description: '获取指定部门下的用户列表，支持包含子部门的查询、状态筛选和搜索功能（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '获取部门成员列表成功',
      type: DepartmentMembersApiResponseDto,
    }),
    requireAdmin: true,
  },

  createUserInDepartment: {
    summary: '在部门下创建用户',
    description: '在指定部门下创建一个新用户，组织信息由部门自动推导（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '用户创建成功',
      type: UserApiResponseDto,
    }),
    requireAdmin: true,
  },

  removeDepartment: {
    summary: '删除部门',
    description: '删除部门（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '部门删除成功',
      type: DepartmentApiResponseDto,
    }),
    requireAdmin: true,
  },
} satisfies Record<string, ApiOperationConfig>

// ================================
// MARK: 组织管理API配置
// ================================

export const ORGANIZATIONS_API_CONFIG = {
  create: {
    summary: '创建组织',
    description: '创建一个新的组织（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '组织创建成功',
      type: OrganizationApiResponseDto,
    }),
    requireAdmin: true,
  },

  findAllOrganizations: {
    summary: '查询组织列表',
    description: '获取组织列表，支持分页、搜索和筛选（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '获取组织列表成功',
      type: OrganizationListApiResponseDto,
    }),
    requireAdmin: true,
  },

  findOrganization: {
    summary: '获取组织详情',
    description: '根据组织ID获取组织详情（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '获取组织详情成功',
      type: OrganizationApiResponseDto,
    }),
    requireAdmin: true,
  },

  update: {
    summary: '更新组织',
    description: '更新组织信息（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '组织更新成功',
      type: OrganizationApiResponseDto,
    }),
    requireAdmin: true,
  },

  removeOrganization: {
    summary: '删除组织',
    description: '删除组织（仅限管理员）',
    successResponse: createSuccessResponse({
      description: '组织删除成功',
      type: OrganizationApiResponseDto,
    }),
    requireAdmin: true,
  },
} satisfies Record<string, ApiOperationConfig>

// ================================
// MARK: 角色权限管理API配置
// ================================

export const ROLES_API_CONFIG = {
  createRole: {
    summary: '创建角色',
    description: '在当前用户所属组织中创建新角色',
    successResponse: createSuccessResponse({
      description: '角色创建成功',
      type: RoleApiResponseDto,
    }),
  },

  getRoles: {
    summary: '获取角色列表',
    description: '获取当前组织的角色列表，包含系统内置角色',
    successResponse: createSuccessResponse({
      description: '获取角色列表成功',
      type: RoleListApiResponseDto,
    }),
  },

  getRoleById: {
    summary: '获取角色详情',
    description: '获取指定角色的详细信息，包含权限列表',
    successResponse: createSuccessResponse({
      description: '获取角色详情成功',
      type: RoleApiResponseDto,
    }),
  },

  updateRole: {
    summary: '更新角色',
    description: '更新指定角色的信息，但不能更新系统内置角色',
    successResponse: createSuccessResponse({
      description: '角色更新成功',
      type: RoleApiResponseDto,
    }),
  },

  deleteRole: {
    summary: '删除角色',
    description: '删除指定角色，不能删除系统内置角色或正在使用的角色',
    successResponse: createSuccessResponse({
      description: '角色删除成功',
    }),
  },

  getRolePermissions: {
    summary: '获取角色权限',
    description: '获取指定角色的权限列表',
    successResponse: createSuccessResponse({
      description: '获取角色权限成功',
      type: RoleApiResponseDto,
    }),
  },

  getRoleMembers: {
    summary: '获取角色成员列表',
    description: '获取指定角色下的成员用户列表，支持分页、搜索与状态筛选',
    successResponse: createSuccessResponse({
      description: '获取角色成员列表成功',
      type: UserListApiResponseDto,
    }),
  },

  addRoleMembers: {
    summary: '添加角色成员',
    description: '添加指定角色下的成员用户',
    successResponse: createSuccessResponse({
      description: '添加角色成员成功',
      type: UserListApiResponseDto,
    }),
  },

  removeRoleMembers: {
    summary: '移除角色成员',
    description: '移除指定角色下的成员用户',
    successResponse: createSuccessResponse({
      description: '移除角色成员成功',
      type: UserListApiResponseDto,
    }),
  },
} satisfies Record<string, ApiOperationConfig>

export const PERMISSIONS_API_CONFIG = {
  createPermission: {
    summary: '创建权限',
    description: '创建新的权限项，仅超级管理员可操作',
    successResponse: createSuccessResponse({
      description: '权限创建成功',
      type: PermissionApiResponseDto,
    }),
  },

  getPermissions: {
    summary: '获取权限列表',
    description: '获取系统中所有可用权限',
    successResponse: createSuccessResponse({
      description: '获取权限列表成功',
      type: PermissionListApiResponseDto,
    }),
  },

  getPermissionGroups: {
    summary: '获取权限分组',
    description: '按资源分组获取权限目录，便于前端展示权限树',
    successResponse: createSuccessResponse({
      description: '获取权限分组成功',
      type: PermissionListApiResponseDto,
    }),
  },

  getPermissionById: {
    summary: '获取权限详情',
    description: '获取指定权限的详细信息',
    successResponse: createSuccessResponse({
      description: '获取权限详情成功',
      type: PermissionApiResponseDto,
    }),
  },

  deletePermission: {
    summary: '删除权限',
    description: '删除指定权限，不能删除系统内置权限',
    successResponse: createSuccessResponse({
      description: '权限删除成功',
    }),
  },
} satisfies Record<string, ApiOperationConfig>
