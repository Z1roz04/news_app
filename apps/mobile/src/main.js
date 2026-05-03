import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createSharedPinia } from '../../../packages/shared/src/stores/index.js'
import { createSharedI18n } from '../../../packages/shared/src/i18n/index.js'
import { useFavoriteStore } from '../../../packages/shared/src/stores/favorite.js'
import { useHistoryStore } from '../../../packages/shared/src/stores/history.js'
import { useUserStore } from '../../../packages/shared/src/stores/user.js'

// 导入Vant组件库和函数
import { 
  Button, 
  NavBar, 
  Tabbar, 
  TabbarItem, 
  Tab, 
  Tabs, 
  List, 
  PullRefresh, 
  Cell, 
  CellGroup,
  Grid,
  GridItem,
  Empty,
  Form,
  Field,
  Image,
  Toast,
  Icon,
  Popup,
  showToast
} from 'vant'

// 导入Vant样式
import 'vant/lib/index.css'

// 导入全局样式
import './style.css'

const app = createApp(App)

// 使用共享的 Pinia 实例
const pinia = createSharedPinia()

// 使用共享的 i18n 实例
const i18n = createSharedI18n()

app.use(i18n)

// 注册Vant组件
app.use(Button)
app.use(NavBar)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Tab)
app.use(Tabs)
app.use(List)
app.use(PullRefresh)
app.use(Cell)
app.use(CellGroup)
app.use(Grid)
app.use(GridItem)
app.use(Empty)
app.use(Form)
app.use(Field)
app.use(Image)
app.use(Toast)
app.use(Icon)
app.use(Popup)

// 使用路由和状态管理
app.use(router)
app.use(pinia)

app.mount('#app')

// 初始化主题
import { useThemeStore } from './store/theme'
const themeStore = useThemeStore()
themeStore.initTheme()

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
  showToast({
    message: message || '您的账号已在其他设备登录',
    position: 'middle',
    duration: 3000
  })
  
  // 延迟跳转到登录页
  setTimeout(() => {
    router.push('/login')
  }, 1500)
})
