import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.js'
import enUS from './locales/en-US.js'

const savedLanguage =
  typeof localStorage !== 'undefined' ? localStorage.getItem('language') || 'zh-CN' : 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

/**
 * 切换 vue-i18n 语言，并同步 <html lang>（localStorage 由 languageStore 写入，避免重复写）
 */
export function setI18nLanguage(locale) {
  const next = locale === 'en-US' ? 'en-US' : 'zh-CN'
  i18n.global.locale.value = next
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', next === 'en-US' ? 'en' : 'zh-CN')
  }
}

export default i18n
