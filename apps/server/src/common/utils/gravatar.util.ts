import { createHash } from 'node:crypto'

interface GenerateAvatarUrlOptions {
  /** 头像尺寸，默认为 200 像素 */
  size?: number
  /** 默认头像类型，默认为 'mp'（神秘人物） */
  default?: 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank'
  /** 评级限制，默认为 'g'（适合所有观众） */
  rating?: 'g' | 'pg' | 'r' | 'x'
  /** 是否强制使用默认头像，默认为 false */
  forceDefault?: boolean
}

/**
 * 根据邮箱地址生成 Gravatar URL
 *
 * @param email - 用户邮箱地址
 * @param options - Gravatar 配置选项
 * @returns Gravatar 头像 URL
 */
export function generateAvatarUrl(
  email: string,
  options: GenerateAvatarUrlOptions = {},
): string {
  const { size = 200, default: defaultAvatar = 'mp', rating = 'g', forceDefault = false } = options

  // 将邮箱转换为小写并去除前后空格
  const normalizedEmail = email.trim().toLowerCase()

  // 生成 MD5 哈希值
  const hash = createHash('md5').update(normalizedEmail).digest('hex')

  // 构建查询参数
  const params = new URLSearchParams({
    s: size.toString(),
    d: defaultAvatar,
    r: rating,
  })

  if (forceDefault) {
    params.set('f', 'y')
  }

  return `https://www.gravatar.com/avatar/${hash}?${params.toString()}`
}
