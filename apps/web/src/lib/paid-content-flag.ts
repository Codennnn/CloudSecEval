/**
 * 临时性功能开关 - 知识付费模式
 * 注意：这是一个实验性功能，开发完成后将被移除
 */

/**
 * 检查是否启用知识付费模式
 * @returns {boolean} 是否启用知识付费模式
 */
export function isPaidContentModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PAID_CONTENT_MODE === 'true'
}
