import type { ValidationError } from 'class-validator'

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): { field: string, messages: string[] }[] {
  const result: { field: string, messages: string[] }[] = []

  for (const err of errors) {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property

    if (err.constraints) {
      result.push({ field: path, messages: Object.values(err.constraints) })
    }

    if (err.children?.length) {
      result.push(...flattenValidationErrors(err.children, path))
    }
  }

  return result
}
