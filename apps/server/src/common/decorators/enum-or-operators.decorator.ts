import { Transform } from 'class-transformer'
import { registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator'

// 定义搜索操作符类型
interface SearchOperators {
  eq?: unknown
  neq?: unknown
  in?: unknown[]
  notIn?: unknown[]
}

/**
 * 验证字段是否为枚举值或搜索操作符对象
 */
export function IsEnumOrOperators(
  enumObject: Record<string, unknown>,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEnumOrOperators',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === null || value === undefined) {
            return true // 可选字段
          }

          const enumValues = Object.values(enumObject)

          // 如果是简单的枚举值
          if (typeof value === 'string') {
            return enumValues.includes(value)
          }

          // 如果是操作符对象
          if (typeof value === 'object' && !Array.isArray(value)) {
            const operatorObj = value as SearchOperators
            // 检查操作符对象的值是否为有效枚举
            const operators: (keyof SearchOperators)[] = ['eq', 'neq', 'in', 'notIn']
            const hasValidOperator = operators.some((op) => {
              const operatorValue = operatorObj[op]

              if (operatorValue !== undefined) {
                if (op === 'in' || op === 'notIn') {
                  // 数组操作符
                  return Array.isArray(operatorValue)
                    && operatorValue.every((v: unknown) => enumValues.includes(v))
                }
                else {
                  // 单值操作符
                  return enumValues.includes(operatorValue)
                }
              }

              return false
            })

            return hasValidOperator
          }

          return false
        },
        defaultMessage(args: ValidationArguments) {
          const enumValues = Object.values(enumObject).join(', ')

          return `${args.property} must be one of the following values: ${enumValues}, `
            + 'or a valid search operator object'
        },
      },
    })
  }
}

/**
 * 转换器：处理枚举或操作符对象
 * 只对操作符对象内的 in 和 notIn 进行数组转换，保持简单枚举值不变
 */
export function EnumOrOperatorsTransform() {
  return Transform(({ value }: { value: unknown }) => {
    // 如果不是对象，直接返回（可能是简单的枚举值、数组或其他类型）
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return value
    }

    const operatorObj = value as Record<string, unknown>
    const result = { ...operatorObj }

    // 确保 in 和 notIn 操作符的值始终为数组
    // 当 Express 解析单个值为字符串时，转换为数组
    if ('in' in result && result.in !== undefined && !Array.isArray(result.in)) {
      result.in = [result.in]
    }

    if ('notIn' in result && result.notIn !== undefined && !Array.isArray(result.notIn)) {
      result.notIn = [result.notIn]
    }

    return result
  })
}
