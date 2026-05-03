import { defineStore } from 'pinia';

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: localStorage.getItem('language') || 'zh-CN', // 默认中文
  }),
  
  getters: {
    getCurrentLanguage: (state) => state.currentLanguage,
  },
  
  actions: {
    setLanguage(language) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
      
      // 广播语言变化事件（跨窗口同步）
      if (typeof window !== 'undefined') {
        localStorage.setItem('language-sync', JSON.stringify({ 
          language: language, 
          timestamp: Date.now() 
        }));
        setTimeout(() => localStorage.removeItem('language-sync'), 100);
      }
    },
  }
});