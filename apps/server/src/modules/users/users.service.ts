import { Injectable } from '@nestjs/common'
import bcrypt from 'bcrypt'
import { promises as fs } from 'fs'
import { join } from 'path'

import type { Prisma } from '#prisma/client'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { generateAvatarUrl } from '~/common/utils/gravatar.util'
import { PermissionsService } from '~/modules/permissions/permissions.service'
import { UploadsService } from '~/modules/uploads/uploads.service'

import { SafeUserDto } from './dto/base-user.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { FindUsersDto } from './dto/find-users.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersRepository } from './users.repository'

type UserId = SafeUserDto['id']

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly permissionsService: PermissionsService,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { avatarUrl, email, password, orgId, departmentId, ...rest } = createUserDto

    const existingUser = await this.usersRepository.findByEmail(email)

    if (existingUser) {
      throw BusinessException.conflict(BUSINESS_CODES.EMAIL_ALREADY_EXISTS)
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10)

    // 如果没有提供头像 URL，则使用 Gravatar 生成
    const finalAvatarUrl = avatarUrl ?? generateAvatarUrl(email, {
      size: 200,
    })

    const organization = await this.usersRepository.findOrganizationById(orgId)

    if (!organization) {
      throw BusinessException.notFound(
        BUSINESS_CODES.ORGANIZATION_NOT_FOUND,
        `组织 ID ${orgId} 不存在`,
      )
    }

    // 部门校验（如果提供）
    if (departmentId) {
      const department = await this.usersRepository.findDepartmentById(departmentId)

      if (!department) {
        throw BusinessException.notFound(
          BUSINESS_CODES.DEPARTMENT_NOT_FOUND,
          `部门 ID ${departmentId} 不存在`,
        )
      }

      if (department.orgId !== organization.id) {
        throw BusinessException.forbidden(
          BUSINESS_CODES.DEPARTMENT_MOVE_TO_DIFFERENT_ORG,
          '所选部门不属于该组织，无法创建用户',
        )
      }
    }

    const newUser = await this.usersRepository.create({
      ...rest,
      email,
      passwordHash,
      avatarUrl: finalAvatarUrl,
      organization: {
        connect: {
          id: orgId,
        },
      },
      department: {
        connect: {
          id: departmentId,
        },
      },
    })

    return newUser
  }

  findAll(query?: FindUsersDto) {
    return this.usersRepository.findWithAdvancedSearch(query)
  }

  async findOne(id: UserId) {
    return this.usersRepository.findById(id)
  }

  async findOneDetail(id: UserId) {
    const user = await this.findOne(id)

    const effective = await this.permissionsService.getUserEffectivePermissions(
      user.id,
      user.organization.id,
    )

    const permissions = Array.isArray(effective.permissions)
      ? effective.permissions
      : Array.from(effective.permissions)

    const result = {
      ...user,
      permissions,
    }

    return result
  }

  findByEmail(email: CreateUserDto['email']) {
    return this.usersRepository.findByEmail(email)
  }

  findByEmailWithPassword(email: CreateUserDto['email']) {
    return this.usersRepository.findByEmailWithPassword(email)
  }

  /**
   * 根据用户ID查找用户（包含密码哈希）
   * 仅用于密码验证相关操作
   */
  async findOneWithPassword(id: UserId) {
    const user = await this.usersRepository.findByIdWithPassword(id)

    if (!user) {
      throw BusinessException.notFound(
        BUSINESS_CODES.USER_NOT_FOUND,
        `用户 ID ${id} 不存在`,
      )
    }

    return user
  }

  async update(id: UserId, updateUserDto: UpdateUserDto, currentUserId?: UserId) {
    const { isActive, ...updateFields } = updateUserDto

    // 防止用户禁用自己的账户
    if (id === currentUserId && isActive === false) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.CANNOT_DISABLE_SELF,
        '不能禁用自己的账户',
      )
    }

    const updateData: Prisma.UserUpdateInput = {
      ...updateFields,
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const updatedUser = await this.usersRepository.update(id, updateData)

    return updatedUser
  }

  remove(id: UserId, currentUserId: UserId) {
    // 检查是否尝试删除自己
    if (id === currentUserId) {
      throw BusinessException.forbidden(
        BUSINESS_CODES.CANNOT_DELETE_SELF,
        '不能删除自己的账户',
      )
    }

    return this.usersRepository.delete(id)
  }

  /**
   * 设置用户密码（仅供专用重置密码/修改密码流程调用）
   * 只负责安全地更新 passwordHash，不允许修改其他字段
   */
  async setPassword(id: UserId, password: string) {
    const passwordHash = await bcrypt.hash(password, 10)
    const updatedUser = await this.usersRepository.update(id, { passwordHash })

    return updatedUser
  }

  async updateAvatarFromFile(userId: UserId, file: Express.Multer.File) {
    const storedFileInfo = await this.uploadsService.handleUploadedFile(file)

    // 获取用户当前信息
    const existing = await this.usersRepository.findById(userId)
    const oldUrl = existing.avatarUrl

    try {
      // 更新用户头像URL
      const updated = await this.usersRepository.update(userId, {
        avatarUrl: storedFileInfo.publicUrl,
      })

      // 清理旧头像文件（仅限存储在static目录的文件）
      if (oldUrl?.startsWith('/static/')) {
        await this.cleanupOldAvatarFile(oldUrl, storedFileInfo.localPath)
      }

      return updated
    }
    catch (err) {
      // 如果更新失败，清理已上传的文件
      await this.uploadsService.deleteStoredFile(storedFileInfo.id)
      throw err
    }
  }

  /**
   * 清理旧的头像文件
   */
  private async cleanupOldAvatarFile(oldUrl: string, newFilePath: string): Promise<void> {
    try {
      const baseDir = process.cwd()
      const storagePrefix = '/static/'
      const relativePath = oldUrl.slice(storagePrefix.length)
      const absolutePath = join(baseDir, 'storage', relativePath)

      // 确保不删除刚上传的文件
      if (absolutePath !== newFilePath) {
        await fs.rm(absolutePath, { force: true })
      }
    }
    catch (error) {
      // 静默处理清理错误，不影响主流程
      console.warn('清理旧头像文件失败:', error)
    }
  }
}
