import { HttpStatus } from '@nestjs/common'
import type { ApiResponseOptions } from '@nestjs/swagger'

export function createSuccessResponse(
  apiResponseOptions: ApiResponseOptions,
): ApiResponseOptions {
  return {
    status: HttpStatus.OK,
    ...apiResponseOptions,
  }
}
