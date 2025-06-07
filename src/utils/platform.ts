/**
 * 检测用户的操作系统是否为 macOS
 * @returns 如果是 macOS 返回 true，否则返回 false
 */
export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent.toLowerCase()

  return (
    userAgent.includes('mac')
    || /iphone|ipad|ipod/.test(userAgent)
  )
}

/**
 * 获取操作系统类型
 * @returns 操作系统类型：'mac' | 'windows' | 'linux' | 'unknown'
 */
export function getOSType(): 'mac' | 'windows' | 'linux' | 'unknown' {
  if (typeof navigator === 'undefined') {
    return 'unknown'
  }

  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes('mac') || /iphone|ipad|ipod/.test(userAgent)) {
    return 'mac'
  }

  if (userAgent.includes('win')) {
    return 'windows'
  }

  if (userAgent.includes('linux')) {
    return 'linux'
  }

  return 'unknown'
}
