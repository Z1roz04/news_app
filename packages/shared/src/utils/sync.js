/**
 * 跨窗口/跨标签页状态同步工具
 * 用于 PC 端和移动端实时同步收藏、历史等数据
 */

import { useFavoriteStore } from '../stores/favorite.js'
import { useHistoryStore } from '../stores/history.js'

const SYNC_CHANNEL = 'news-platform-sync'

/**
 * 初始化跨窗口同步
 * 在应用启动时调用
 */
export function initCrossWindowSync() {
  if (typeof window === 'undefined') return

  // 监听 localStorage 变化（跨窗口通信）
  window.addEventListener('storage', (event) => {
    if (event.key === 'favorite-store') {
      // 收藏数据变化，同步更新
      syncFavoriteFromStorage()
    }
    if (event.key === 'history-store') {
      // 历史数据变化，同步更新
      syncHistoryFromStorage()
    }
  })

  // 监听页面可见性变化（切换回来时刷新数据）
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // 页面变为可见，从服务器获取最新数据
      refreshDataFromServer()
    }
  })

  // 监听窗口获得焦点（点击回来时刷新）
  window.addEventListener('focus', () => {
    refreshDataFromServer()
  })
}

/**
 * 从 localStorage 同步收藏数据
 */
function syncFavoriteFromStorage() {
  try {
    const favoriteStore = useFavoriteStore()
    const saved = localStorage.getItem('favorite-store')
    if (saved) {
      const data = JSON.parse(saved)
      // 合并本地和存储的数据，以存储的为准
      if (data.favorites && Array.isArray(data.favorites)) {
        favoriteStore.favorites = data.favorites
      }
    }
  } catch (e) {
    console.error('同步收藏数据失败:', e)
  }
}

/**
 * 从 localStorage 同步历史数据
 */
function syncHistoryFromStorage() {
  try {
    const historyStore = useHistoryStore()
    const saved = localStorage.getItem('history-store')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.history && Array.isArray(data.history)) {
        historyStore.history = data.history
      }
    }
  } catch (e) {
    console.error('同步历史数据失败:', e)
  }
}

/**
 * 从服务器刷新数据
 */
async function refreshDataFromServer() {
  try {
    const favoriteStore = useFavoriteStore()
    const historyStore = useHistoryStore()

    // 并行获取收藏和历史
    await Promise.all([
      favoriteStore.getFavoriteList(),
      historyStore.getHistoryList()
    ])
  } catch (e) {
    console.error('从服务器刷新数据失败:', e)
  }
}

/**
 * 广播状态变化给其他窗口
 * @param {string} storeName - store 名称
 * @param {any} data - 数据
 */
export function broadcastStateChange(storeName, data) {
  if (typeof window === 'undefined') return

  try {
    // 触发 storage 事件
    localStorage.setItem(
      `${SYNC_CHANNEL}-${storeName}`,
      JSON.stringify({
        timestamp: Date.now(),
        data: data
      })
    )
    // 立即删除，避免占用空间，只是触发事件
    localStorage.removeItem(`${SYNC_CHANNEL}-${storeName}`)
  } catch (e) {
    console.error('广播状态变化失败:', e)
  }
}

export default {
  initCrossWindowSync,
  broadcastStateChange
}
