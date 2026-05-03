import { createApp } from 'vue'
import router from './router/router.js'
import App from './App.vue'
import { createSharedPinia } from '../../../packages/shared/src/stores/index.js'
import { createSharedI18n } from '../../../packages/shared/src/i18n/index.js'
import { useFavoriteStore } from '../../../packages/shared/src/stores/favorite.js'
import { useHistoryStore } from '../../../packages/shared/src/stores/history.js'
import { useUserStore } from '../../../packages/shared/src/stores/user.js'
import ElementPlus, { ElMessage } from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "./tailwindcss.css"

const app=createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用共享的 Pinia 实例
const pinia = createSharedPinia()

// 使用共享的 i18n 实例
const i18n = createSharedI18n()

app.use(router).use(pinia).use(ElementPlus,{
  i18n: i18n.global.t 
}).use(i18n)

app.mount('#app');

// ========================================
// 跨窗口同步机制（PC端和移动端实时同步收藏、历史）
// ========================================

// 监听 localStorage 变化（其他窗口的数据变更）
window.addEventListener('storage', (event) => {
  const favoriteStore = useFavoriteStore()
  const historyStore = useHistoryStore()
  
  if (event.key === 'favorite-store-sync' && event.newValue) {
    try {
      const data = JSON.parse(event.newValue)
      favoriteStore.syncFromOtherWindow(data)
      console.log('[Sync] 收藏数据已从其他窗口同步')
    } catch (e) {
      console.error('[Sync] 同步收藏数据失败:', e)
    }
  }
  
  if (event.key === 'history-store-sync' && event.newValue) {
    try {
      const data = JSON.parse(event.newValue)
      historyStore.syncFromOtherWindow(data)
      console.log('[Sync] 历史数据已从其他窗口同步')
    } catch (e) {
      console.error('[Sync] 同步历史数据失败:', e)
    }
  }
  
  // 监听语言变化同步（多端同步语言设置）
  if (event.key === 'language-sync' && event.newValue) {
    try {
      const { language } = JSON.parse(event.newValue)
      if (language && language !== i18n.global.locale.value) {
        i18n.global.locale.value = language
        console.log('[Sync] 语言设置已从其他窗口同步:', language)
      }
    } catch (e) {
      console.error('[Sync] 同步语言设置失败:', e)
    }
  }
})

// 页面可见性变化时刷新数据（切换回来时）
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const favoriteStore = useFavoriteStore()
    const historyStore = useHistoryStore()
    const userStore = useUserStore()
    
    // 如果已登录，从服务器刷新数据
    if (userStore.isLogin) {
      favoriteStore.getFavoriteList().catch(() => {})
      historyStore.getHistoryList().catch(() => {})
    }
  }
})

// ========================================
// 多端登录冲突处理（单设备登录模式）
// ========================================

// 监听 Token 失效事件（其他设备登录导致）
window.addEventListener('auth:logout', (event) => {
  const { reason, message } = event.detail || {}
  
  // 提示用户
  ElMessage.warning(message || '您的账号已在其他设备登录')
  
  // 延迟跳转到登录页
  setTimeout(() => {
    router.push('/login')
  }, 1500)
})
