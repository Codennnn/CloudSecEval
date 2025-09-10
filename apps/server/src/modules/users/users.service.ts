import { createHash } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import bcrypt from 'bcrypt'
import { promises as fs } from 'fs'
import { join } from 'path'

import type { Prisma } from '#prisma/client'
import { BUSINESS_CODES } from '~/common/constants/business-codes'
import { BusinessException } from '~/common/exceptions/business.exception'
import { generateAvatarUrl } from '~/common/utils/gravatar.util'
import { PermissionsService } from '~/modules/permissions/permissions.service'

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
    const baseDir = process.cwd()
    const avatarsDir = join(baseDir, 'storage', 'avatars', userId)

    await fs.mkdir(avatarsDir, { recursive: true })

    const ext = (file.originalname.split('.').pop() ?? 'bin').toLowerCase()
    const hash = createHash('sha256').update(file.buffer).digest('hex')
    const fileName = `${hash}.${ext}`
    const targetPath = join(avatarsDir, fileName)
    const publicUrl = `/static/avatars/${userId}/${fileName}`

    // 写入新文件
    await fs.writeFile(targetPath, file.buffer)

    const existing = await this.usersRepository.findById(userId)
    const oldUrl = existing.avatarUrl

    try {
      const updated = await this.usersRepository.update(userId, { avatarUrl: publicUrl })

      if (oldUrl?.startsWith('/static/')) {
        const storagePrefix = '/static/'
        const relativePath = oldUrl.slice(storagePrefix.length)
        const absolutePath = join(baseDir, 'storage', relativePath)

        if (absolutePath !== targetPath) {
          await fs.rm(absolutePath, { force: true })
        }
      }

      return updated
    }
    catch (err) {
      await fs.rm(targetPath, { force: true })
      throw err
    }
  }
}
