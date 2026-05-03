/**
 * 设备检测工具
 * 用于判断当前设备类型
 */

/**
 * 检测是否为移动端设备
 * @returns {boolean}
 */
export function isMobile() {
  if (typeof navigator === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android',
    'iphone',
    'ipad',
    'ipod',
    'windows phone',
    'mobile',
    'mobi',
  ]
  
  return mobileKeywords.some((keyword) => userAgent.includes(keyword))
}

/**
 * 检测是否为平板设备
 * @returns {boolean}
 */
export function isTablet() {
  if (typeof navigator === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  return /ipad|android(?!.*mobile)|tablet/.test(userAgent)
}

/**
 * 检测是否为 PC 端
 * @returns {boolean}
 */
export function isPC() {
  return !isMobile() && !isTablet()
}

/**
 * 获取设备类型
 * @returns {'mobile' | 'tablet' | 'pc'}
 */
export function getDeviceType() {
  if (isTablet()) return 'tablet'
  if (isMobile()) return 'mobile'
  return 'pc'
}

/**
 * 根据设备类型重定向到对应视图
 * @param {string} mobilePath - 移动端路径
 * @param {string} pcPath - PC端路径
 */
export function redirectByDevice(mobilePath = '/mobile', pcPath = '/pc') {
  const currentPath = window.location.pathname
  const deviceType = getDeviceType()
  
  // 已在正确路径，不重定向
  if (deviceType === 'mobile' && currentPath.startsWith(mobilePath)) return
  if (deviceType === 'pc' && currentPath.startsWith(pcPath)) return
  
  // 执行重定向
  const targetPath = deviceType === 'mobile' ? mobilePath : pcPath
  window.location.href = targetPath + window.location.search
}

export default {
  isMobile,
  isTablet,
  isPC,
  getDeviceType,
  redirectByDevice,
}
