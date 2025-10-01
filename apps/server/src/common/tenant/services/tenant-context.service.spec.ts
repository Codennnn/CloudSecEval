import { BUSINESS_CODES } from '@mono/constants'
import { Test, type TestingModule } from '@nestjs/testing'

import { BusinessException } from '~/common/exceptions/business.exception'

import { TenantContext } from './tenant-context.service'

describe('TenantContext', () => {
  let service: TenantContext

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContext],
    }).compile()

    service = module.get<TenantContext>(TenantContext)
  })

  afterEach(() => {
    service.reset()
  })

  describe('基础功能', () => {
    it('应该正确创建服务实例', () => {
      expect(service).toBeDefined()
    })

    it('初始状态应该未初始化', () => {
      expect(service.isInitialized()).toBe(false)
      expect(service.tryGetOrganizationId()).toBeNull()
      expect(service.tryGetUserId()).toBeNull()
    })
  })

  describe('setContext', () => {
    it('应该正确设置租户上下文', () => {
      const config = {
        organizationId: 'org-123',
        userId: 'user-456',
        isSuperAdmin: false,
      }

      service.setContext(config)

      expect(service.isInitialized()).toBe(true)
      expect(service.getOrganizationId()).toBe('org-123')
      expect(service.getUserId()).toBe('user-456')
      expect(service.isSuperAdmin()).toBe(false)
    })

    it('应该正确设置超级管理员标志', () => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
        isSuperAdmin: true,
      })

      expect(service.isSuperAdmin()).toBe(true)
    })

    it('超级管理员标志默认为 false', () => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
      })

      expect(service.isSuperAdmin()).toBe(false)
    })
  })

  describe('getOrganizationId', () => {
    it('未初始化时应该抛出异常', () => {
      expect(() => service.getOrganizationId()).toThrow(BusinessException)

      try {
        service.getOrganizationId()
      }
      catch (error) {
        expect(error).toBeInstanceOf(BusinessException)
        expect((error as BusinessException).businessCode).toBe(BUSINESS_CODES.UNAUTHORIZED)
      }
    })

    it('初始化后应该返回组织 ID', () => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
      })

      expect(service.getOrganizationId()).toBe('org-123')
    })
  })

  describe('getUserId', () => {
    it('未初始化时应该抛出异常', () => {
      expect(() => service.getUserId()).toThrow(BusinessException)
    })

    it('初始化后应该返回用户 ID', () => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
      })

      expect(service.getUserId()).toBe('user-456')
    })
  })

  describe('tryGetOrganizationId', () => {
    it('未初始化时应该返回 null', () => {
      expect(service.tryGetOrganizationId()).toBeNull()
    })

    it('初始化后应该返回组织 ID', () => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
      })

      expect(service.tryGetOrganizationId()).toBe('org-123')
    })
  })

  describe('tryGetUserId', () => {
    it('未初始化时应该返回 null', () => {
      expect(service.tryGetUserId()).toBeNull()
    })

    it('初始化后应该返回用户 ID', () => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
      })

      expect(service.tryGetUserId()).toBe('user-456')
    })
  })

  describe('isBypassEnabled', () => {
    it('默认应该为 false', () => {
      expect(service.isBypassEnabled()).toBe(false)
    })
  })

  describe('runWithoutTenantIsolation', () => {
    beforeEach(() => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
      })
    })

    it('应该临时绕过租户隔离', async () => {
      expect(service.isBypassEnabled()).toBe(false)

      const result = await service.runWithoutTenantIsolation(
        {
          action: 'TEST',
          reason: '测试绕过',
        },
        async () => {
          await Promise.resolve()
          expect(service.isBypassEnabled()).toBe(true)

          return true
        },
      )

      expect(result).toBe(true)
      expect(service.isBypassEnabled()).toBe(false)
    })

    it('应该正确执行回调并返回结果', async () => {
      const result = await service.runWithoutTenantIsolation(
        {
          action: 'TEST',
          reason: '测试返回值',
        },
        async () => Promise.resolve('test-result'),
      )

      expect(result).toBe('test-result')
    })

    it('回调抛出异常时应该恢复绕过状态', async () => {
      await expect(
        service.runWithoutTenantIsolation(
          {
            action: 'TEST',
            reason: '测试异常',
          },
          () => {
            throw new Error('Test error')
          },
        ),
      ).rejects.toThrow('Test error')

      expect(service.isBypassEnabled()).toBe(false)
    })

    it('应该记录审计日志', async () => {
      await service.runWithoutTenantIsolation(
        {
          action: 'TEST_ACTION',
          reason: '测试审计日志',
        },
        async () => {
          // 执行某些操作
        },
      )

      const logs = service.getAuditLogs()

      expect(logs.length).toBe(1)
      expect(logs[0].action).toBe('TEST_ACTION')
      expect(logs[0].bypassed).toBe(true)
      expect(logs[0].bypassReason).toBe('测试审计日志')
      expect(logs[0].organizationId).toBe('org-123')
      expect(logs[0].userId).toBe('user-456')
    })

    it('嵌套调用时应该正确恢复状态', async () => {
      await service.runWithoutTenantIsolation(
        {
          action: 'OUTER',
          reason: '外层绕过',
        },
        async () => {
          expect(service.isBypassEnabled()).toBe(true)

          // 内层也绕过
          const innerResult = await service.runWithoutTenantIsolation(
            {
              action: 'INNER',
              reason: '内层绕过',
            },
            async () => {
              await Promise.resolve()
              expect(service.isBypassEnabled()).toBe(true)

              return true
            },
          )

          // 内层结束后仍然是绕过状态
          expect(innerResult).toBe(true)
          expect(service.isBypassEnabled()).toBe(true)
        },
      )

      // 外层结束后应该恢复
      expect(service.isBypassEnabled()).toBe(false)
    })
  })

  describe('runWithoutTenantIsolationSync', () => {
    beforeEach(() => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
      })
    })

    it('应该临时绕过租户隔离（同步）', () => {
      expect(service.isBypassEnabled()).toBe(false)

      service.runWithoutTenantIsolationSync(
        {
          action: 'TEST',
          reason: '测试同步绕过',
        },
        () => {
          expect(service.isBypassEnabled()).toBe(true)
        },
      )

      expect(service.isBypassEnabled()).toBe(false)
    })

    it('应该正确返回结果', () => {
      const result = service.runWithoutTenantIsolationSync(
        {
          action: 'TEST',
          reason: '测试返回值',
        },
        () => {
          return 'test-result'
        },
      )

      expect(result).toBe('test-result')
    })

    it('异常时应该恢复绕过状态', () => {
      expect(() => {
        service.runWithoutTenantIsolationSync(
          {
            action: 'TEST',
            reason: '测试异常',
          },
          () => {
            throw new Error('Test error')
          },
        )
      }).toThrow('Test error')

      expect(service.isBypassEnabled()).toBe(false)
    })
  })

  describe('verifyResourceOwnership', () => {
    beforeEach(() => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
        isSuperAdmin: false,
      })
    })

    it('资源属于当前租户时不应该抛出异常', () => {
      expect(() => {
        service.verifyResourceOwnership('org-123', '漏洞报告')
      }).not.toThrow()
    })

    it('资源不属于当前租户时应该抛出异常', () => {
      expect(() => {
        service.verifyResourceOwnership('org-456', '漏洞报告')
      }).toThrow(BusinessException)

      try {
        service.verifyResourceOwnership('org-456', '漏洞报告')
      }
      catch (error) {
        expect(error).toBeInstanceOf(BusinessException)
        expect((error as BusinessException).businessCode).toBe(
          BUSINESS_CODES.INSUFFICIENT_PERMISSIONS,
        )
        expect((error as BusinessException).businessMessage).toContain('无权访问其他组织')
      }
    })

    it('资源组织 ID 为 null 时应该抛出异常', () => {
      expect(() => {
        service.verifyResourceOwnership(null, '漏洞报告')
      }).toThrow(BusinessException)
    })

    it('资源组织 ID 为 undefined 时应该抛出异常', () => {
      expect(() => {
        service.verifyResourceOwnership(undefined, '漏洞报告')
      }).toThrow(BusinessException)
    })

    it('超级管理员应该可以访问任何组织的资源', () => {
      service.reset()
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
        isSuperAdmin: true,
      })

      expect(() => {
        service.verifyResourceOwnership('org-456', '漏洞报告')
      }).not.toThrow()
    })

    it('绕过租户隔离时应该可以访问任何组织的资源', async () => {
      const result = await service.runWithoutTenantIsolation(
        {
          action: 'TEST',
          reason: '测试绕过验证',
        },
        async () => {
          await Promise.resolve()
          expect(() => {
            service.verifyResourceOwnership('org-456', '漏洞报告')
          }).not.toThrow()

          return true
        },
      )
      expect(result).toBe(true)
    })
  })

  describe('snapshot', () => {
    it('应该返回当前上下文的快照', () => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
        isSuperAdmin: true,
      })

      const snapshot = service.snapshot()

      expect(snapshot).toEqual({
        organizationId: 'org-123',
        userId: 'user-456',
        isSuperAdmin: true,
        bypassEnabled: false,
        initialized: true,
      })
    })

    it('快照应该是只读的', () => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
      })

      const snapshot = service.snapshot()

      expect(() => {
        // @ts-expect-error - 测试运行时的只读保护
        snapshot.organizationId = 'org-456'
      }).toThrow()
    })
  })

  describe('reset', () => {
    it('应该重置所有状态', () => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
        isSuperAdmin: true,
      })

      service.reset()

      expect(service.isInitialized()).toBe(false)
      expect(service.tryGetOrganizationId()).toBeNull()
      expect(service.tryGetUserId()).toBeNull()
      expect(service.isSuperAdmin()).toBe(false)
      expect(service.isBypassEnabled()).toBe(false)
      expect(service.getAuditLogs()).toEqual([])
    })
  })

  describe('getAuditLogs', () => {
    beforeEach(() => {
      service.setContext({
        organizationId: 'org-123',
        userId: 'user-456',
      })
    })

    it('初始状态应该返回空数组', () => {
      expect(service.getAuditLogs()).toEqual([])
    })

    it('应该记录所有绕过操作', async () => {
      await service.runWithoutTenantIsolation(
        { action: 'ACTION_1', reason: '原因 1' },
        async () => {
          // Action 1 operation
        },
      )

      await service.runWithoutTenantIsolation(
        { action: 'ACTION_2', reason: '原因 2' },
        async () => {
          // Action 2 operation
        },
      )

      const logs = service.getAuditLogs()

      expect(logs.length).toBe(2)
      expect(logs[0].action).toBe('ACTION_1')
      expect(logs[1].action).toBe('ACTION_2')
    })

    it('返回的日志应该是只读的', async () => {
      await service.runWithoutTenantIsolation(
        { action: 'TEST', reason: '测试' },
        async () => {
          // Test operation
        },
      )

      const logs = service.getAuditLogs()

      expect(() => {
        // @ts-expect-error - 测试运行时的只读保护
        logs[0].action = 'MODIFIED'
      }).toThrow()
    })
  })
})
