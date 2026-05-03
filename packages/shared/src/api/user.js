/**
 * 用户相关 API
 */

import axios from './axios.js'
import { API_ENDPOINTS } from '../config/api.js'

export const userApi = {
  /**
   * 用户登录
   * @param {Object} data - 登录数据
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   */
  login(data) {
    return axios.post(API_ENDPOINTS.USER.LOGIN, data)
  },

  /**
   * 用户注册
   * @param {Object} data - 注册数据
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   */
  register(data) {
    return axios.post(API_ENDPOINTS.USER.REGISTER, data)
  },

  /**
   * 获取用户信息
   * @param {string} token - 用户token
   */
  getInfo(token) {
    return axios.get(API_ENDPOINTS.USER.INFO, {
      headers: {
        Authorization: token,
      },
    })
  },

  /**
   * 更新用户信息
   * @param {Object} data - 更新数据
   * @param {string} token - 用户token
   */
  update(data, token) {
    return axios.put(API_ENDPOINTS.USER.UPDATE, data, {
      headers: {
        Authorization: token,
      },
    })
  },

  /**
   * 修改密码
   * @param {Object} data - 密码数据
   * @param {string} data.oldPassword - 旧密码
   * @param {string} data.newPassword - 新密码
   * @param {string} token - 用户token
   */
  changePassword(data, token) {
    return axios.put(API_ENDPOINTS.USER.PASSWORD, data, {
      headers: {
        Authorization: token,
      },
    })
  },
}

export default userApi
