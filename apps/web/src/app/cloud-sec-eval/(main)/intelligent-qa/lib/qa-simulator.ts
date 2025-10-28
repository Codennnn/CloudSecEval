import { findBestAnswer } from './mock-qa-data'

/**
 * 模拟 AI 思考延迟（毫秒）
 */
const THINKING_DELAY = 800

/**
 * 打字机效果的字符延迟（毫秒）
 */
const TYPING_DELAY_PER_CHAR = 20

/**
 * 模拟 AI 回复
 * 包含思考延迟和打字机效果
 *
 * @param question - 用户问题
 * @param onProgress - 进度回调，用于实现打字机效果
 * @returns Promise<完整答案>
 */
export async function simulateAIResponse(
  question: string,
  onProgress?: (partialAnswer: string) => void,
): Promise<string> {
  // 1. 模拟 AI 思考延迟
  await delay(THINKING_DELAY)

  // 2. 获取答案
  const fullAnswer = findBestAnswer(question)

  // 3. 如果提供了进度回调，实现打字机效果
  if (onProgress) {
    await typewriterEffect(fullAnswer, onProgress)
  }

  return fullAnswer
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * 打字机效果
 * 逐字符显示文本
 *
 * @param text - 完整文本
 * @param onProgress - 进度回调
 */
async function typewriterEffect(
  text: string,
  onProgress: (partialText: string) => void,
): Promise<void> {
  let currentText = ''

  // 将文本按字符分割（支持中文）
  const chars = Array.from(text)

  for (const char of chars) {
    currentText += char
    onProgress(currentText)

    // 根据字符类型调整延迟
    const charDelay = getCharDelay(char)
    await delay(charDelay)
  }
}

/**
 * 根据字符类型获取延迟时间
 * 标点符号和换行符有更长的停顿
 */
function getCharDelay(char: string): number {
  // 句号、问号、感叹号：较长停顿
  if (/[。？！.?!]/.test(char)) {
    return TYPING_DELAY_PER_CHAR * 8
  }

  // 逗号、分号、冒号：中等停顿
  if (/[，、；：,;:]/.test(char)) {
    return TYPING_DELAY_PER_CHAR * 4
  }

  // 换行符：较长停顿
  if (char === '\n') {
    return TYPING_DELAY_PER_CHAR * 6
  }

  // 空格：短停顿
  if (char === ' ') {
    return TYPING_DELAY_PER_CHAR * 2
  }

  // 普通字符：基础延迟
  return TYPING_DELAY_PER_CHAR
}

/**
 * 快速模式：无打字机效果，直接返回答案
 * 用于测试或快速演示
 */
export async function simulateAIResponseFast(question: string): Promise<string> {
  await delay(THINKING_DELAY)

  return findBestAnswer(question)
}
