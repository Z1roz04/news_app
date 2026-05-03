/**
 * i18n 国际化配置
 * PC端和移动端共用同一套语言配置
 */

import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.js'
import enUS from './locales/en-US.js'

// 支持的语言列表
export const supportedLocales = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
]

// 默认语言
export const defaultLocale = 'zh-CN'

// 从 localStorage 获取保存的语言设置
function getSavedLocale() {
  if (typeof localStorage === 'undefined') return defaultLocale
  return localStorage.getItem('language') || defaultLocale
}

// 创建 i18n 实例
export function createSharedI18n(savedLocale = null) {
  const locale = savedLocale || getSavedLocale()
  
  return createI18n({
    legacy: false,
    locale: locale,
    fallbackLocale: defaultLocale,
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS,
    },
    globalInjection: true,
  })
}

// 切换语言
export function setLocale(i18n, locale) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('language', locale)
  }
  
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }
  
  // 设置 html lang 属性
  if (typeof document !== 'undefined') {
    document.querySelector('html').setAttribute('lang', locale)
  }
}

// 获取当前语言
export function getCurrentLocale(i18n) {
  if (i18n.mode === 'legacy') {
    return i18n.global.locale
  }
  return i18n.global.locale.value
}

export { zhCN, enUS }
export default createSharedI18n
