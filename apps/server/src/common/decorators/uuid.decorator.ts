import { applyDecorators } from '@nestjs/common'
import { IsNotEmpty, IsOptional, IsString, IsUUID, type ValidationOptions } from 'class-validator'

function buildUuidV4Message(fieldLabel?: string) {
  return `${fieldLabel ?? '$property'}必须是有效的 UUID (v4)`
}

function IsUUIDv4(
  labelOrOptions?: string | ValidationOptions,
  maybeOptions?: ValidationOptions,
) {
  let label: string | undefined
  let options: ValidationOptions | undefined

  if (typeof labelOrOptions === 'string') {
    label = labelOrOptions
    options = maybeOptions
  }
  else {
    options = labelOrOptions
  }

  return IsUUID('4', {
    message: buildUuidV4Message(label),
    ...options,
  })
}

interface IdOptions {
  /**
   * 是否为必填字段
   * - true: 应用 IsNotEmpty 校验（默认）
   * - false: 应用 IsOptional 校验
   */
  required?: boolean

  /**
   * 字符串类型校验失败时的错误提示
   * - 默认："${label}必须是字符串"
   */
  stringMessage?: string

  /**
   * 必填校验失败时的错误提示（当 required=true 生效）
   * - 默认："${label}不能为空"
   */
  emptyMessage?: string

  /**
   * UUID v4 校验消息中使用的字段展示名
   * - 默认使用传入的 label
   */
  uuidMessageLabel?: string

  /**
   * 透传给 class-validator 的 ValidationOptions
   * - 可用于自定义 groups、each 等高级配置
   */
  validationOptions?: ValidationOptions
}

export function IsId(label = 'ID', options: IdOptions = {}) {
  const {
    required = true,
    stringMessage = `${label}必须是字符串`,
    emptyMessage = `${label}不能为空`,
    uuidMessageLabel = label,
    validationOptions,
  } = options

  return applyDecorators(
    IsString({ message: stringMessage }),
    IsUUIDv4(uuidMessageLabel, validationOptions),
    required ? IsNotEmpty({ message: emptyMessage }) : IsOptional(),
  )
}
