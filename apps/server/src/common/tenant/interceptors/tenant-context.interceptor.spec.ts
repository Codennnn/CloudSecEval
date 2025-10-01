import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, type TestingModule } from '@nestjs/testing'
import { of, throwError } from 'rxjs'

import type { ExpressRequest } from '~/types/common'

import { TenantContext } from '../services/tenant-context.service'
import { TenantContextInterceptor } from './tenant-context.interceptor'

/**
 * 测试辅助类型：模拟的 TenantContext
 */
interface MockTenantContext {
  setContext: jest.Mock
  isInitialized: jest.Mock
  tryGetUserId: jest.Mock
  tryGetOrganizationId: jest.Mock
  getAuditLogs: jest.Mock
}

/**
 * 测试辅助类型：模拟的 Reflector
 */
interface MockReflector {
  getAllAndOverride: jest.Mock
}

/**
 * 测试辅助类型：模拟的 ExecutionContext
 */
interface MockExecutionContext {
  switchToHttp: jest.Mock
  getHandler: jest.Mock
  getClass: jest.Mock
}

/**
 * 测试辅助类型：模拟的 CallHandler
 */
interface MockCallHandler {
  handle: jest.Mock
}

describe('TenantContextInterceptor', () => {
  let interceptor: TenantContextInterceptor
  let tenantContext: jest.Mocked<TenantContext> & MockTenantContext
  let reflector: jest.Mocked<Reflector> & MockReflector

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantContextInterceptor,
        {
          provide: TenantContext,
          useValue: {
            setContext: jest.fn(),
            isInitialized: jest.fn().mockReturnValue(false),
            tryGetUserId: jest.fn().mockReturnValue(null),
            tryGetOrganizationId: jest.fn().mockReturnValue(null),
            getAuditLogs: jest.fn().mockReturnValue([]),
          } satisfies MockTenantContext,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn().mockReturnValue(false),
          } satisfies MockReflector,
        },
      ],
    }).compile()

    interceptor = module.get<TenantContextInterceptor>(TenantContextInterceptor)
    tenantContext = module.get(TenantContext)
    reflector = module.get(Reflector)
  })

  describe('基础功能', () => {
    it('应该正确创建拦截器实例', () => {
      expect(interceptor).toBeDefined()
      expect(interceptor).toBeInstanceOf(TenantContextInterceptor)
    })

    it('应该有正确的logger名称', () => {
      expect(interceptor.logger.localInstance).toBe('TenantContextInterceptor')
    })
  })

  describe('拦截器执行', () => {
    it('应该为有效用户设置租户上下文', (done) => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        organization: {
          id: 'org-123',
          name: 'Test Org',
          code: 'TEST_ORG',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockRequest: Partial<ExpressRequest> = {
        user: mockUser,
        path: '/api/test',
        method: 'GET',
      }

      const mockContext: MockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      }

      const mockNext: MockCallHandler = {
        handle: jest.fn().mockReturnValue(of('test-response')),
      }

      interceptor
        .intercept(mockContext as unknown as ExecutionContext, mockNext as unknown as CallHandler)
        .subscribe(() => {
          expect(tenantContext.setContext).toHaveBeenCalledWith({
            organizationId: 'org-123',
            userId: 'user-123',
            isSuperAdmin: false,
          })
          done()
        })
    })

    it('应该跳过公开路由的租户上下文设置', (done) => {
      const mockRequest: Partial<ExpressRequest> = {
        path: '/api/public',
        method: 'GET',
      }

      const mockContext: MockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      }

      const mockNext: MockCallHandler = {
        handle: jest.fn().mockReturnValue(of('test-response')),
      }

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true)

      interceptor
        .intercept(mockContext as unknown as ExecutionContext, mockNext as unknown as CallHandler)
        .subscribe(() => {
          expect(tenantContext.setContext).not.toHaveBeenCalled()
          done()
        })
    })

    it('应该处理没有用户信息的请求', (done) => {
      const mockRequest: Partial<ExpressRequest> = {
        path: '/api/test',
        method: 'GET',
      }

      const mockContext: MockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      }

      const mockNext: MockCallHandler = {
        handle: jest.fn().mockReturnValue(of('test-response')),
      }

      interceptor
        .intercept(mockContext as unknown as ExecutionContext, mockNext as unknown as CallHandler)
        .subscribe(() => {
          expect(tenantContext.setContext).not.toHaveBeenCalled()
          done()
        })
    })

    it('应该处理用户对象缺少必要字段的情况', (done) => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        // 缺少 organization 字段
      }

      const mockRequest: Partial<ExpressRequest> = {
        user: mockUser as ExpressRequest['user'],
        path: '/api/test',
        method: 'GET',
      }

      const mockContext: MockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      }

      const mockNext: MockCallHandler = {
        handle: jest.fn().mockReturnValue(of('test-response')),
      }

      const warnSpy = jest.spyOn(interceptor.logger, 'warn')

      interceptor
        .intercept(mockContext as unknown as ExecutionContext, mockNext as unknown as CallHandler)
        .subscribe(() => {
          expect(tenantContext.setContext).not.toHaveBeenCalled()
          expect(warnSpy).toHaveBeenCalled()
          done()
        })
    })

    it('应该记录租户隔离绕过操作', (done) => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        organization: {
          id: 'org-123',
          name: 'Test Org',
          code: 'TEST_ORG',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockRequest: Partial<ExpressRequest> = {
        user: mockUser,
        path: '/api/test',
        method: 'GET',
      }

      const mockContext: MockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      }

      const mockNext: MockCallHandler = {
        handle: jest.fn().mockReturnValue(of('test-response')),
      }

      // 模拟有审计日志
      tenantContext.isInitialized.mockReturnValue(true)
      tenantContext.getAuditLogs.mockReturnValue([
        {
          action: 'TEST_ACTION',
          reason: 'Test reason',
          timestamp: new Date(),
          userId: 'user-123',
          organizationId: 'org-123',
        },
      ])

      const warnSpy = jest.spyOn(interceptor.logger, 'warn')

      interceptor
        .intercept(mockContext as unknown as ExecutionContext, mockNext as unknown as CallHandler)
        .subscribe(() => {
          expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('请求包含租户隔离绕过操作'),
          )
          done()
        })
    })

    it('应该记录错误日志', (done) => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        organization: {
          id: 'org-123',
          name: 'Test Org',
          code: 'TEST_ORG',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockRequest: Partial<ExpressRequest> = {
        user: mockUser,
        path: '/api/test',
        method: 'GET',
      }

      const mockContext: MockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      }

      const mockError = new Error('Test error')
      const mockNext: MockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => mockError)),
      }

      tenantContext.tryGetUserId.mockReturnValue('user-123')
      tenantContext.tryGetOrganizationId.mockReturnValue('org-123')

      const errorSpy = jest.spyOn(interceptor.logger, 'error')

      interceptor
        .intercept(mockContext as unknown as ExecutionContext, mockNext as unknown as CallHandler)
        .subscribe({
          error: () => {
            expect(errorSpy).toHaveBeenCalledWith(
              expect.stringContaining('请求处理失败'),
            )
            done()
          },
        })
    })
  })

  describe('错误消息提取', () => {
    it('应该正确提取 Error 对象的消息', () => {
      const error = new Error('Test error')
      const message = interceptor.extractErrorMessage(error)
      expect(message).toBe('Test error')
    })

    it('应该正确提取字符串错误', () => {
      const error = 'String error'
      const message = interceptor.extractErrorMessage(error)
      expect(message).toBe('String error')
    })

    it('应该处理带 message 属性的对象', () => {
      const error = { message: 'Object error' }
      const message = interceptor.extractErrorMessage(error)
      expect(message).toBe('Object error')
    })

    it('应该处理未知类型的错误', () => {
      const error = 123
      const message = interceptor.extractErrorMessage(error)
      expect(message).toBe('Unknown error type')
    })

    it('应该处理 null 和 undefined', () => {
      expect(interceptor.extractErrorMessage(null)).toBe('Unknown error')
      expect(interceptor.extractErrorMessage(undefined)).toBe('Unknown error')
    })
  })
})
