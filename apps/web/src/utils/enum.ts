/**
 * 枚举工具函数
 * 提供创建和管理枚举选项的通用方法
 */

/**
 * 从配置映射生成枚举选项
 */
export function createEnumOptions(
  enumValues: Record<string, string>,
  configMap: Partial<Record<string, { label: string }>>,
): { value: string, label: string }[] {
  return Object.values(enumValues).map((value) => {
    const config = configMap[value]

    return {
      value,
      label: config ? config.label : value,
    }
  })
}

/**
 * 从简单对象映射生成枚举选项
 */
export function createSimpleEnumOptions(
  labelMap: Record<string, string>,
): { value: string, label: string }[] {
  return Object.entries(labelMap).map(([value, label]) => ({
    value,
    label,
  }))
}

/**
 * 从枚举值和获取标签的函数生成选项
 */
export function createEnumOptionsFromGetter<T extends string>(
  enumValues: Record<string, T>,
  getLabelFn: (value: T) => string,
): { value: string, label: string }[] {
  return Object.values(enumValues).map((value) => ({
    value,
    label: getLabelFn(value),
  }))
}
