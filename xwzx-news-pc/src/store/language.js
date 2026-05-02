import { defineStore } from 'pinia'
import { setI18nLanguage } from '../i18n/index.js'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage:
      typeof localStorage !== 'undefined' ? localStorage.getItem('language') || 'zh-CN' : 'zh-CN',
  }),

  getters: {
    getCurrentLanguage: (state) => state.currentLanguage,
  },

  actions: {
    /** 与 vue-i18n、localStorage、<html lang> 保持一致 */
    setLanguage(language) {
      const next = language === 'en-US' ? 'en-US' : 'zh-CN'
      this.currentLanguage = next
      localStorage.setItem('language', next)
      setI18nLanguage(next)
    },
  },
})
