/**
 * 收藏状态管理
 * PC端和移动端共用同一套收藏状态
 */

import { defineStore } from 'pinia'
import { favoriteApi } from '../api/favorite.js'
import { useUserStore } from './user.js'

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    favorites: [],
    loading: false,
  }),

  getters: {
    getFavorites: (state) => state.favorites,
    isFavorite: (state) => (id) => state.favorites.some((item) => item.id === id),
    favoriteCount: (state) => state.favorites.length,
  },

  actions: {
    /**
     * 检查新闻收藏状态
     */
    async checkFavoriteStatus(newsId) {
      const userStore = useUserStore()
      
      if (!userStore.getLoginStatus) {
        return {
          success: true,
          isFavorite: this.isFavorite(newsId),
          isLocal: true,
        }
      }

      try {
        this.loading = true
        const response = await favoriteApi.check(newsId, userStore.token)

        if (response.data.code === 200) {
          return {
            success: true,
            isFavorite: response.data.data.isFavorite,
          }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('检查收藏状态失败:', error)
        return {
          success: true,
          isFavorite: this.isFavorite(newsId),
          isLocal: true,
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 添加收藏
     */
    async addFavorite(newsId) {
      const userStore = useUserStore()
      
      if (!userStore.getLoginStatus) {
        return { success: false, message: '请先登录' }
      }

      try {
        this.loading = true
        const response = await favoriteApi.add(newsId, userStore.token)

        if (response.data.code === 200) {
          return { success: true, data: response.data.data }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('添加收藏失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * 取消收藏
     */
    async removeFavorite(newsId) {
      const userStore = useUserStore()
      
      if (!userStore.getLoginStatus) {
        return { success: false, message: '请先登录' }
      }

      try {
        this.loading = true
        const response = await favoriteApi.remove(newsId, userStore.token)

        if (response.data.code === 200) {
          // 从本地列表移除
          this.favorites = this.favorites.filter((item) => item.id !== newsId)
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('取消收藏失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * 切换收藏状态
     */
    async toggleFavorite(news) {
      if (!news || !news.id) {
        console.error('无效的新闻对象:', news)
        return null
      }

      const isFav = this.isFavorite(news.id)

      if (isFav) {
        const result = await this.removeFavorite(news.id)
        if (result.success) {
          // 从本地列表移除
          this.favorites = this.favorites.filter((item) => item.id !== news.id)
          // 广播变化给其他窗口
          this._broadcastChange()
          return false
        }
        return null
      } else {
        const result = await this.addFavorite(news.id)
        if (result.success) {
          // 添加到本地列表
          this.favorites.unshift({
            ...news,
            favoriteTime: new Date().toLocaleString(),
          })
          // 广播变化给其他窗口
          this._broadcastChange()
          return true
        }
        return null
      }
    },

    /**
     * 广播收藏变化给其他窗口
     */
    _broadcastChange() {
      // 使用 localStorage 触发 storage 事件
      if (typeof window !== 'undefined') {
        const data = JSON.stringify({
          timestamp: Date.now(),
          favorites: this.favorites
        })
        localStorage.setItem('favorite-store-sync', data)
        // 立即删除，只是用来触发事件
        setTimeout(() => {
          localStorage.removeItem('favorite-store-sync')
        }, 100)
      }
    },

    /**
     * 从其他窗口同步数据
     */
    syncFromOtherWindow(data) {
      if (data && data.favorites && Array.isArray(data.favorites)) {
        this.favorites = data.favorites
      }
    },

    /**
     * 获取收藏列表
     */
    async getFavoriteList(page = 1, pageSize = 10) {
      const userStore = useUserStore()
      
      if (!userStore.getLoginStatus) {
        return { success: false, message: '请先登录' }
      }

      try {
        this.loading = true
        const response = await favoriteApi.getList(
          { page, pageSize },
          userStore.token
        )

        if (response.data.code === 200) {
          this.favorites = response.data.data.list
          return {
            success: true,
            data: response.data.data,
          }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('获取收藏列表失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * 清空收藏
     */
    async clearFavorites() {
      const userStore = useUserStore()
      
      if (!userStore.getLoginStatus) {
        this.favorites = []
        return { success: true, isLocal: true }
      }

      try {
        this.loading = true
        const response = await favoriteApi.clear(userStore.token)

        if (response.data.code === 200) {
          this.favorites = []
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('清空收藏失败:', error)
        return { success: false, message: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * 从本地存储加载收藏
     */
    loadFavorites() {
      const saved = localStorage.getItem('news_favorites')
      if (saved) {
        try {
          this.favorites = JSON.parse(saved)
        } catch (e) {
          console.error('加载本地收藏失败:', e)
        }
      }
    },

    /**
     * 保存收藏到本地存储
     */
    saveFavorites() {
      localStorage.setItem('news_favorites', JSON.stringify(this.favorites))
    },
  },

  persist: {
    key: 'favorite-store',
    storage: localStorage,
  },
})

export default useFavoriteStore
