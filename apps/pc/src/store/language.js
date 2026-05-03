import { defineStore } from 'pinia'

// 获取当前 i18n 实例（在 setup 外使用需要延迟获取）
function getI18nInstance() {
  // 从 window 获取通过 main.js 挂载的 i18n 实例
  // 或者通过 import 获取（如果是在 setup 中使用）
  return null
}

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage:
      typeof localStorage !== 'undefined' ? localStorage.getItem('language') || 'zh-CN' : 'zh-CN',
  }),

  getters: {
    getCurrentLanguage: (state) => state.currentLanguage,
  },

  actions: {
    /** 
     * 设置语言 - 与 vue-i18n、localStorage、<html lang> 保持一致
     * 注意：实际切换语言需要通过 useI18n().locale.value = language
     */
    setLanguage(language) {
      const next = language === 'en-US' ? 'en-US' : 'zh-CN'
      this.currentLanguage = next
      localStorage.setItem('language', next)
      
      // 设置 html lang 属性
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', next === 'en-US' ? 'en' : 'zh-CN')
      }
      
      // 广播语言变化事件（跨窗口同步）
      if (typeof window !== 'undefined') {
        localStorage.setItem('language-sync', JSON.stringify({ 
          language: next, 
          timestamp: Date.now() 
        }))
        setTimeout(() => localStorage.removeItem('language-sync'), 100)
      }
    },
  },
})
