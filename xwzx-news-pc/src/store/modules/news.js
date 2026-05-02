import { defineStore } from 'pinia'
import axios from 'axios'
import { apiConfig } from '../../config/api'

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
  
  actions: {
    // 获取新闻分类
    async getCategories() {
      if (this.categoriesLoading) return;
      
      this.categoriesLoading = true;
      
      try {
        // 调用API获取分类列表
        const response = await axios.get(`${apiConfig.baseURL}/api/news/categories`);
        
        if (response.data && response.data.code === 200) {
          // 设置分类数据
          this.categories = [...response.data.data, { id: 10, name: '更多' }];
          
          // 如果没有设置当前分类，则设置为第一个分类
          if (!this.currentCategory && this.categories.length > 0) {
            this.currentCategory = this.categories[0].id;
          }
        }
      } catch (error) {
        console.error('获取新闻分类失败:', error);
        // 设置默认分类，以防API请求失败
        this.categories = [
          { id: 1, name: '头条' },
          { id: 2, name: '社会' },
          { id: 3, name: '国内' },
          { id: 4, name: '国际' },
          { id: 5, name: '娱乐' },
          { id: 6, name: '体育' },
          { id: 7, name: '科技' }
        ];
      } finally {
        this.categoriesLoading = false;
      }
    },
    
    // 获取新闻列表
    async getNewsList(isRefresh = false) {
      if (isRefresh) {
        this.refreshing = true
        this.newsList = []
        this.finished = false
      }
      
      this.loading = true
      
      try {
        // 使用API请求获取新闻列表
        const params = {
          categoryId: this.currentCategory,
          page: isRefresh ? 1 : Math.ceil(this.newsList.length / 10) + 1,
          pagesize: 10,
        }
        
        const response = await axios.get(`${apiConfig.baseURL}/api/news/list`, { params });
        
        if (response.data && response.data.code === 200) {
          const newsData = response.data.data.list;
          
          // 更新新闻列表
          this.newsList = isRefresh ? newsData : [...this.newsList, ...newsData];
          
          // 判断是否加载完成
          if (newsData.length < params.pagesize) {
            this.finished = true;
          }
        }

      } catch (error) {
        console.error('获取新闻列表失败:', error)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    
    // 获取新闻详情
    async getNewsDetail(id) {
      try {
        // 在开发环境中，使用模拟数据
        console.log('使用模拟新闻详情数据');
        

        // 实际项目中连接后端API的代码，取消注释即可使用
        const response = await axios.get(`${apiConfig.baseURL}/api/news/detail?id=${id}`);
        
        if (response.data && response.data.code === 200) {
          // 设置新闻详情数据
          this.newsDetail = response.data.data;
          return;
        } else {
          console.error('获取新闻详情失败: 接口返回错误');
          // 接口失败时使用模拟数据作为备选
        }

      } catch (error) {
        console.error('获取新闻详情失败:', error);
      }
    },

    // 切换新闻分类
    changeCategory(categoryId) {
      if (this.currentCategory !== categoryId) {
        this.currentCategory = categoryId
        this.newsList = []
        this.finished = false
        this.getNewsList(true)
      }
    },
    
    // 获取分类名称
    getCategoryName(categoryId) {
      const category = this.categories.find(item => item.id === categoryId)
      return category ? category.name : '未知'
    },

    async getNewsSearch(keyword, isRefresh = false) {
      if (!keyword || !String(keyword).trim()) return

      if (isRefresh) {
        this.refreshing = true
        this.newsList = []
        this.finished = false
        this.searchTotal = 0
      }

      this.loading = true

      const pagesize = 10
      const params = {
        q: String(keyword).trim(),
        page: isRefresh ? 1 : Math.ceil(this.newsList.length / pagesize) + 1,
        pagesize,
      }

      try {
        const response = await axios.get(`${apiConfig.baseURL}/api/news/search`, {
          params,
        })

        if (response.data && response.data.code === 200) {
          const raw = response.data.data
          const newsData = Array.isArray(raw) ? raw : raw?.list ?? []
          const total =
            raw && typeof raw === 'object' && !Array.isArray(raw) && raw.total != null
              ? Number(raw.total)
              : newsData.length

          this.newsList = isRefresh ? newsData : [...this.newsList, ...newsData]
          if (isRefresh) {
            this.searchTotal = total
          }

          if (newsData.length < pagesize) {
            this.finished = true
          }
        }
      } catch (error) {
        console.error('搜索新闻失败:', error)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
  }
})