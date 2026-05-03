/**
 * 状态管理模块统一导出
 */

export { useUserStore } from './user.js'
export { useNewsStore } from './news.js'
export { useFavoriteStore } from './favorite.js'
export { useHistoryStore } from './history.js'

// 用于创建 Pinia 实例的辅助函数
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export function createSharedPinia() {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  return pinia
}
