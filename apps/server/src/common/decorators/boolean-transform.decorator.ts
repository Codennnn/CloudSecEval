import { Transform } from 'class-transformer'

/**
 * 布尔值转换装饰器
 *
 * 用于将字符串形式的布尔值转换为真正的布尔类型。
 * 主要用于处理 HTTP 请求中的查询参数和表单数据。
 *
 * 转换规则：
 * - 字符串 'true' 或布尔值 true -> true
 * - 其他所有值 -> false
 *
 * 使用场景：
 * - DTO 中的布尔字段验证
 * - 查询参数的布尔值处理
 * - 表单数据的布尔值转换
 */
export function BooleanTransform(defaultValue = false) {
  return Transform(({ value }) => value === 'true' || value === true || defaultValue)
}
