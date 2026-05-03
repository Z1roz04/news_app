/**
 * 收藏相关 API
 */

import axios from './axios.js'
import { API_ENDPOINTS } from '../config/api.js'

export const favoriteApi = {
  /**
   * 检查新闻收藏状态
   * @param {number} newsId - 新闻ID
   * @param {string} token - 用户token
   */
  check(newsId, token) {
    return axios.get(API_ENDPOINTS.FAVORITE.CHECK, {
      headers: { Authorization: token },
      params: { newsId },
    })
  },

  /**
   * 添加收藏
   * @param {number} newsId - 新闻ID
   * @param {string} token - 用户token
   */
  add(newsId, token) {
    return axios.post(
      API_ENDPOINTS.FAVORITE.ADD,
      { newsId },
      { headers: { Authorization: token } }
    )
  },

  /**
   * 取消收藏
   * @param {number} newsId - 新闻ID
   * @param {string} token - 用户token
   */
  remove(newsId, token) {
    return axios.delete(API_ENDPOINTS.FAVORITE.REMOVE, {
      headers: { Authorization: token },
      params: { newsId },
    })
  },

  /**
   * 获取收藏列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} token - 用户token
   */
  getList(params, token) {
    return axios.get(API_ENDPOINTS.FAVORITE.LIST, {
      headers: { Authorization: token },
      params,
    })
  },

  /**
   * 清空收藏
   * @param {string} token - 用户token
   */
  clear(token) {
    return axios.delete(API_ENDPOINTS.FAVORITE.CLEAR, {
      headers: { Authorization: token },
    })
  },
}

export default favoriteApi
