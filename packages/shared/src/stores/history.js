/**
 * 浏览历史状态管理
 * PC端和移动端共用同一套浏览历史状态
 */

import { defineStore } from 'pinia'
import { historyApi } from '../api/history.js'
import { useUserStore } from './user.js'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    history: [],
    loading: false,
  }),

  getters: {
    getHistory: (state) => state.history,
    historyCount: (state) => state.history.length,
  },

  actions: {
    /**
     * 添加浏览历史
     */
    async addHistory(newsId) {
      const userStore = useUserStore()
      
      if (!userStore.getLoginStatus) {
        return { success: false, message: '请先登录', isLocal: true }
      }

      try {
        const response = await historyApi.add(newsId, userStore.token)

        if (response.data.code === 200) {
          return { success: true, data: response.data.data }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('添加浏览历史失败:', error)
        return { success: false, message: error.message }
      }
    },

    /**
     * 获取浏览历史列表
     */
    async getHistoryList(page = 1, pageSize = 10) {
      const userStore = useUserStore()
      
      if (!userStore.getLoginStatus) {
        return { success: false, message: '请先登录', isLocal: true }
      }

      try {
        this.loading = true
        const response = await historyApi.getList(
          { page, pageSize },
          userStore.token
        )

        if (response.data.code === 200) {
          this.history = response.data.data.list
          return {
            success: true,
            data: response.data.data,
          }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('获取浏览历史失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除单条浏览历史
     */
    async removeHistory(newsId) {
      const userStore = useUserStore()
      
      if (!userStore.getLoginStatus) {
        this.history = this.history.filter((item) => item.id !== newsId)
        this._broadcastChange()
        return { success: true, isLocal: true }
      }

      try {
        const response = await historyApi.remove(newsId, userStore.token)

        if (response.data.code === 200) {
          this.history = this.history.filter((item) => item.id !== newsId)
          this._broadcastChange()
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('删除浏览历史失败:', error)
        return { success: false, message: error.message }
      }
    },

    /**
     * 清空浏览历史
     */
    async clearHistory() {
      const userStore = useUserStore()
      
      if (!userStore.getLoginStatus) {
        this.history = []
        this._broadcastChange()
        return { success: true, isLocal: true }
      }

      try {
        const response = await historyApi.clear(userStore.token)

        if (response.data.code === 200) {
          this.history = []
          this._broadcastChange()
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('清空浏览历史失败:', error)
        return { success: false, message: error.message }
      }
    },

    /**
     * 广播历史变化给其他窗口
     */
    _broadcastChange() {
      if (typeof window !== 'undefined') {
        const data = JSON.stringify({
          timestamp: Date.now(),
          history: this.history
        })
        localStorage.setItem('history-store-sync', data)
        setTimeout(() => {
          localStorage.removeItem('history-store-sync')
        }, 100)
      }
    },

    /**
     * 从其他窗口同步数据
     */
    syncFromOtherWindow(data) {
      if (data && data.history && Array.isArray(data.history)) {
        this.history = data.history
      }
    },

    /**
     * 从本地存储加载历史
     */
    loadHistory() {
      const saved = localStorage.getItem('news_history')
      if (saved) {
        try {
          this.history = JSON.parse(saved)
        } catch (e) {
          console.error('加载本地历史失败:', e)
        }
      }
    },

    /**
     * 保存历史到本地存储
     */
    saveHistory() {
      localStorage.setItem('news_history', JSON.stringify(this.history))
    },
  },

  persist: {
    key: 'history-store',
    storage: localStorage,
  },
})

export default useHistoryStore
