/**
 * 新闻相关 API
 */

import axios from './axios.js'
import { API_ENDPOINTS } from '../config/api.js'

export const newsApi = {
  /**
   * 获取新闻分类列表
   * @param {Object} params - 查询参数
   * @param {number} params.skip - 跳过数量
   * @param {number} params.limit - 限制数量
   */
  getCategories(params = {}) {
    return axios.get(API_ENDPOINTS.NEWS.CATEGORIES, { params })
  },

  /**
   * 获取新闻列表
   * @param {Object} params - 查询参数
   * @param {number} params.categoryId - 分类ID
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   */
  getList(params) {
    return axios.get(API_ENDPOINTS.NEWS.LIST, { params })
  },

  /**
   * 获取新闻详情
   * @param {number} id - 新闻ID
   */
  getDetail(id) {
    return axios.get(API_ENDPOINTS.NEWS.DETAIL, {
      params: { id },
    })
  },

  /**
   * 搜索新闻
   * @param {Object} params - 查询参数
   * @param {string} params.q - 搜索关键词
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   */
  search(params) {
    return axios.get(API_ENDPOINTS.NEWS.SEARCH, { params })
  },
}

export default newsApi
