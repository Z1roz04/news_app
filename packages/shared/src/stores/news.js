/**
 * 新闻状态管理
 * PC端和移动端共用同一套新闻状态
 */

import { defineStore } from 'pinia'
import { newsApi } from '../api/news.js'

export const useNewsStore = defineStore('news', {
  state: () => ({
    newsList: [],
    newsDetail: {},
    categories: [],
    currentCategory: 1,
    loading: false,
    refreshing: false,
    finished: false,
    categoriesLoading: false,
    searchTotal: 0,
  }),

  getters: {
    firstNews: (state) => state.newsList[0] || null,
    remainingNews: (state) => state.newsList.slice(1),
    getCategoryName: (state) => (categoryId) => {
      const category = state.categories.find((item) => item.id === categoryId)
      return category ? category.name : '未知'
    },
  },

  actions: {
    /**
     * 获取新闻分类
     */
    async getCategories() {
      if (this.categoriesLoading) return

      this.categoriesLoading = true

      try {
        const response = await newsApi.getCategories()

        if (response.data && response.data.code === 200) {
          this.categories = response.data.data

          if (!this.currentCategory && this.categories.length > 0) {
            this.currentCategory = this.categories[0].id
          }
        }
      } catch (error) {
        console.error('获取新闻分类失败:', error)
        // 设置默认分类
        this.categories = [
          { id: 1, name: '头条' },
          { id: 2, name: '社会' },
          { id: 3, name: '国内' },
          { id: 4, name: '国际' },
          { id: 5, name: '娱乐' },
          { id: 6, name: '体育' },
          { id: 7, name: '科技' },
          { id: 8, name: '财经' },
          { id: 9, name: '军事' },
        ]
      } finally {
        this.categoriesLoading = false
      }
    },

    /**
     * 获取新闻列表
     */
    async getNewsList(isRefresh = false) {
      if (isRefresh) {
        this.refreshing = true
        this.newsList = []
        this.finished = false
      }

      this.loading = true

      try {
        const page = isRefresh ? 1 : Math.ceil(this.newsList.length / 10) + 1
        const params = {
          categoryId: this.currentCategory,
          page: page,
          pagesize: 10,  // 后端期望小写的 pagesize
        }

        const response = await newsApi.getList(params)

        if (response.data && response.data.code === 200) {
          const newsData = response.data.data.list
          this.newsList = isRefresh ? newsData : [...this.newsList, ...newsData]

          if (newsData.length < params.pagesize) {
            this.finished = true
          }
        }
      } catch (error) {
        console.error('获取新闻列表失败:', error)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    /**
     * 获取新闻详情
     */
    async getNewsDetail(id) {
      try {
        const response = await newsApi.getDetail(id)

        if (response.data && response.data.code === 200) {
          this.newsDetail = response.data.data
          return { success: true, data: response.data.data }
        } else {
          console.error('获取新闻详情失败:', response.data.message)
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('获取新闻详情失败:', error)
        return { success: false, message: error.message }
      }
    },

    /**
     * 搜索新闻
     */
    async searchNews(keyword, page = 1, pagesize = 10) {
      try {
        const params = {
          q: keyword,
          page,
          pagesize,  // 后端期望小写的 pagesize
        }

        const response = await newsApi.search(params)

        if (response.data && response.data.code === 200) {
          this.searchTotal = response.data.data.total
          return {
            success: true,
            data: response.data.data,
          }
        } else {
          return {
            success: false,
            message: response.data.message || '搜索失败',
          }
        }
      } catch (error) {
        console.error('搜索新闻失败:', error)
        return {
          success: false,
          message: error.message || '搜索请求失败',
        }
      }
    },

    /**
     * 切换新闻分类
     */
    changeCategory(categoryId) {
      if (this.currentCategory !== categoryId) {
        this.currentCategory = categoryId
        this.newsList = []
        this.finished = false
        this.getNewsList(true)
      }
    },

    /**
     * 重置新闻状态
     */
    resetNewsState() {
      this.newsList = []
      this.newsDetail = {}
      this.currentCategory = 1
      this.finished = false
    },
  },
})

export default useNewsStore
