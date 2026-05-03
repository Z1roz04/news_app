/**
 * Axios 实例配置
 * 两端共用同一套请求配置
 */

import axios from 'axios'
import { apiConfig } from '../config/api.js'

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const userStore = localStorage.getItem('user-store')
    if (userStore) {
      try {
        const parsed = JSON.parse(userStore)
        if (parsed.token) {
          config.headers.Authorization = parsed.token
        }
      } catch (e) {
        console.error('Parse user store error:', e)
      }
    }
    
    if (apiConfig.debug) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data)
    }
    
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    if (apiConfig.debug) {
      console.log(`[API Response] ${response.config.url}`, response.data)
    }
    
    // 统一处理响应格式
    if (response.data && response.data.code !== undefined) {
      if (response.data.code !== 200) {
        // 业务错误
        const error = new Error(response.data.message || '请求失败')
        error.code = response.data.code
        error.data = response.data
        return Promise.reject(error)
      }
    }
    
    return response
  },
  (error) => {
    console.error('[API Response Error]', error)
    
    // 统一错误处理
    if (error.response) {
      // HTTP 错误状态码
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.detail || `HTTP ${status}`
      
      if (status === 401) {
        // Token 过期或被其他设备登录踢下线
        console.warn('[Auth] Token 已失效，可能是其他设备登录导致')
        
        // 清除本地登录状态
        localStorage.removeItem('user-store')
        localStorage.removeItem('favorite-store')
        localStorage.removeItem('history-store')
        
        // 触发全局事件通知应用重新登录
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout', { 
            detail: { reason: 'token_expired', message: '您的账号已在其他设备登录' }
          }))
        }
      }
      
      error.message = message
    } else if (error.request) {
      error.message = '网络请求失败，请检查网络连接'
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance
