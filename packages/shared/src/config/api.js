/**
 * 全局 API 配置
 * PC端和移动端共用同一套后端接口
 */

// API 基础URL配置
export const apiConfig = {
  // 后端API基础URL
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  // 请求超时时间（毫秒）
  timeout: 10000,
  // 是否开启调试日志
  debug: import.meta.env.DEV || false,
}

// API 端点枚举
export const API_ENDPOINTS = {
  // 用户相关
  USER: {
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    INFO: '/api/user/info',
    UPDATE: '/api/user/update',
    PASSWORD: '/api/user/password',
  },
  // 新闻相关
  NEWS: {
    CATEGORIES: '/api/news/categories',
    LIST: '/api/news/list',
    DETAIL: '/api/news/detail',
    SEARCH: '/api/news/search',
  },
  // 收藏相关
  FAVORITE: {
    CHECK: '/api/favorite/check',
    ADD: '/api/favorite/add',
    REMOVE: '/api/favorite/remove',
    LIST: '/api/favorite/list',
    CLEAR: '/api/favorite/clear',
  },
  // 历史记录相关
  HISTORY: {
    ADD: '/api/history/add',
    LIST: '/api/history/list',
    DELETE: '/api/history/delete',
    CLEAR: '/api/history/clear',
  },
  // AI 相关
  AI: {
    CHAT: '/api/ai/chat',
  },
}

export default apiConfig
