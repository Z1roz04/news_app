/**
 * 浏览历史相关 API
 */

import axios from './axios.js'
import { API_ENDPOINTS } from '../config/api.js'

export const historyApi = {
  /**
   * 添加浏览历史
   * @param {number} newsId - 新闻ID
   * @param {string} token - 用户token
   */
  add(newsId, token) {
    return axios.post(
      API_ENDPOINTS.HISTORY.ADD,
      { newsId },
      { headers: { Authorization: token } }
    )
  },

  /**
   * 获取浏览历史列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} token - 用户token
   */
  getList(params = {}, token) {
    return axios.get(API_ENDPOINTS.HISTORY.LIST, {
      headers: { Authorization: token },
      params,
    })
  },

  /**
   * 删除单条浏览历史
   * @param {number} newsId - 新闻ID
   * @param {string} token - 用户token
   */
  remove(newsId, token) {
    return axios.delete(`${API_ENDPOINTS.HISTORY.DELETE}/${newsId}`, {
      headers: { Authorization: token },
    })
  },

  /**
   * 清空浏览历史
   * @param {string} token - 用户token
   */
  clear(token) {
    return axios.delete(API_ENDPOINTS.HISTORY.CLEAR, {
      headers: { Authorization: token },
    })
  },
}

export default historyApi
