/**
 * 用户状态管理
 * PC端和移动端共用同一套用户状态
 */

import { defineStore } from 'pinia'
import { userApi } from '../api/user.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: '',
    isLogin: false,
  }),

  getters: {
    getUserInfo: (state) => state.userInfo,
    getToken: (state) => state.token,
    getLoginStatus: (state) => state.isLogin,
  },

  actions: {
    /**
     * 用户登录
     */
    async login(userData) {
      try {
        const response = await userApi.login(userData)

        if (response.data && response.data.code === 200) {
          const userInfo = response.data.data.userInfo
          const token = response.data.data.token

          this.userInfo = userInfo
          this.token = token
          this.isLogin = true

          return {
            success: true,
            message: '登录成功',
            data: response.data.data,
          }
        } else {
          return {
            success: false,
            message: response.data.message || '登录失败',
          }
        }
      } catch (error) {
        console.error('登录请求失败:', error)
        return {
          success: false,
          message: error.message || '登录请求失败，请稍后再试',
        }
      }
    },

    /**
     * 用户注册
     */
    async register(userData) {
      try {
        const response = await userApi.register(userData)

        if (response.data && response.data.code === 200) {
          const userInfo = response.data.data.userInfo
          const token = response.data.data.token

          this.userInfo = userInfo
          this.token = token
          this.isLogin = true

          return {
            success: true,
            message: '注册成功',
            data: response.data.data,
          }
        } else {
          return {
            success: false,
            message: response.data.message || '注册失败',
          }
        }
      } catch (error) {
        console.error('注册请求失败:', error)
        return {
          success: false,
          message: error.message || '注册请求失败，请稍后再试',
        }
      }
    },

    /**
     * 退出登录
     */
    logout() {
      this.userInfo = null
      this.token = ''
      this.isLogin = false
    },

    /**
     * 获取用户信息详情
     */
    async getUserInfoDetail() {
      try {
        if (!this.token) {
          return {
            success: false,
            message: '未登录',
          }
        }

        const response = await userApi.getInfo(this.token)

        if (response.data && response.data.code === 200) {
          this.userInfo = response.data.data

          return {
            success: true,
            message: '获取用户信息成功',
            data: response.data.data,
          }
        } else {
          return {
            success: false,
            message: response.data.message || '获取用户信息失败',
          }
        }
      } catch (error) {
        console.error('获取用户信息请求失败:', error)
        
        // Token 过期，自动退出
        if (error.code === 401) {
          this.logout()
        }
        
        return {
          success: false,
          message: error.message || '获取用户信息请求失败，请稍后再试',
        }
      }
    },

    /**
     * 更新用户资料
     */
    async updateProfile(payload) {
      try {
        if (!this.token) {
          return { success: false, message: '未登录' }
        }

        const body = {}
        const keys = ['nickname', 'avatar', 'gender', 'bio', 'phone']
        for (const k of keys) {
          if (Object.prototype.hasOwnProperty.call(payload, k)) {
            body[k] = payload[k]
          }
        }
        
        if (Object.keys(body).length === 0) {
          return { success: false, message: '没有要保存的字段' }
        }

        const response = await userApi.update(body, this.token)
        
        if (response.data && response.data.code === 200) {
          this.userInfo = response.data.data
          return {
            success: true,
            message: response.data.message || '保存成功',
          }
        }
        
        return {
          success: false,
          message: response.data?.message || '保存失败',
        }
      } catch (error) {
        console.error('更新资料请求失败:', error)
        return {
          success: false,
          message: error.message || '更新资料失败，请稍后再试',
        }
      }
    },

    /**
     * 修改密码
     */
    async updatePassword(oldPassword, newPassword) {
      try {
        if (!this.token) {
          return {
            success: false,
            message: '未登录',
          }
        }

        const response = await userApi.changePassword(
          { oldPassword, newPassword },
          this.token
        )

        if (response.data && response.data.code === 200) {
          return {
            success: true,
            message: '密码修改成功',
          }
        } else {
          return {
            success: false,
            message: response.data.message || '密码修改失败',
          }
        }
      } catch (error) {
        console.error('修改密码请求失败:', error)
        return {
          success: false,
          message: error.message || '修改密码请求失败，请稍后再试',
        }
      }
    },
  },

  persist: {
    key: 'user-store',
    storage: localStorage,
  },
})

export default useUserStore
