/**
 * AI 问答相关 API
 */

import axios from './axios.js'
import { API_ENDPOINTS } from '../config/api.js'

export const aiApi = {
  /**
   * AI 聊天
   * @param {Object} data - 聊天数据
   * @param {string} data.message - 用户消息
   * @param {Array} data.history - 历史消息
   * @param {boolean} data.stream - 是否流式输出
   * @param {string} token - 用户token
   */
  chat(data, token) {
    return axios.post(API_ENDPOINTS.AI.CHAT, data, {
      headers: { Authorization: token },
    })
  },
}

export default aiApi
