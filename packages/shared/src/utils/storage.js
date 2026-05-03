/**
 * 本地存储工具
 * 封装 localStorage 和 sessionStorage 操作
 */

/**
 * 设置本地存储
 * @param {string} key - 键名
 * @param {*} value - 值
 */
export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage set error:', e)
  }
}

/**
 * 获取本地存储
 * @param {string} key - 键名
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
export function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    console.error('localStorage get error:', e)
    return defaultValue
  }
}

/**
 * 移除本地存储
 * @param {string} key - 键名
 */
export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error('localStorage remove error:', e)
  }
}

/**
 * 清空本地存储
 */
export function clearLocalStorage() {
  try {
    localStorage.clear()
  } catch (e) {
    console.error('localStorage clear error:', e)
  }
}

/**
 * 设置会话存储
 * @param {string} key - 键名
 * @param {*} value - 值
 */
export function setSessionStorage(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('sessionStorage set error:', e)
  }
}

/**
 * 获取会话存储
 * @param {string} key - 键名
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
export function getSessionStorage(key, defaultValue = null) {
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    console.error('sessionStorage get error:', e)
    return defaultValue
  }
}

export default {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
  setSessionStorage,
  getSessionStorage,
}
