<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { User } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import { useNewsStore } from '../store/modules/news'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['search', 'clear'])

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const newsStore = useNewsStore()
const { userInfo } = storeToRefs(userStore)
const { searchTotal } = storeToRefs(newsStore)

const { t, locale } = useI18n()

const searchKeyword = ref('')
const loading = ref(false)

const searchQueryInRoute = computed(() => {
  const q = route.query.q
  if (q == null || q === '') return ''
  return String(Array.isArray(q) ? q[0] : q).trim()
})

const showSearchCount = computed(
  () => route.path.startsWith('/search') && !!searchQueryInRoute.value,
)

const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    clearSearch()
    return
  }
  

  loading.value = true
  
  try {
    await emit('search', keyword)
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  newsStore.searchTotal = 0
  if (route.path.startsWith('/search')) {
    newsStore.newsList = []
    newsStore.finished = true
    router.replace({ path: '/search', query: {} })
  }
  emit('clear')
}

watch(
  () => [route.path, route.query.q],
  () => {
    if (!route.path.startsWith('/search')) return
    const q = route.query.q
    const raw = Array.isArray(q) ? q[0] : q
    const text = raw != null && raw !== '' ? String(raw).trim() : ''
    searchKeyword.value = text
  },
  { immediate: true },
)

const username = computed(() => {
  const u = userInfo.value
  if (!u) return ''
  return u.nickname || u.username || ''
})

const avatarUrl = computed(() => {
  const u = userInfo.value
  const raw = u?.avatar?.trim?.()
  return raw || ''
})

function logout() {
  userStore.logout()
  router.push('/home')
}

const today = computed(() => {
  const lang = locale.value
  const date = new Date()
  if (lang === 'en-US') {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(date)
  } else {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(date)
  }
})

const activeMenu = computed(() => {
  const p = route.path
  if (p === '/' || p.startsWith('/home')) return '/home'
  if (p.startsWith('/category')) return '/category'
  if (p.startsWith('/aichat')) return '/aichat'
  if (p.startsWith('/favorite')) return '/favorite'
  if (p.startsWith('/history')) return '/history'
  if (p.startsWith('/settings')) return '/settings'
  if (p.startsWith('/my') || p.startsWith('/profile')) return '/my'
  return p
})

</script>

<template>
  <header class="portal-header">
    <div class="top-bar">
      <div class="inner">
        <span class="tagline">{{ '权威资讯 · 即时送达' }}</span>
        <span class="date">{{ today }}</span>
      </div>
    </div>

    <div class="main-bar">
      <div class="inner main-inner">
        <router-link to="/home" class="brand">
          <div class="brand-mark">闻</div>
          <div class="brand-text">
            <span class="brand-title">环球新闻中心</span>
            <span class="brand-sub">Global News Hub</span>
          </div>
        </router-link>

        <el-menu
          :key="activeMenu"
          :default-active="activeMenu"
          mode="horizontal"
          :router="true"
          class="nav-menu"
          :ellipsis="false"
        >
          <el-menu-item index="/home">{{ t('nav.home') }}</el-menu-item>
          <el-sub-menu index="/category">
            <template #title>
              <span>{{ t('nav.category') }}</span>
            </template>
            <el-menu-item index="cat-1" :route="{ path: '/home', query: { categoryId: '1' } }">
              {{ t('home.categories.headline') }}
            </el-menu-item>
            <el-menu-item index="cat-2" :route="{ path: '/home', query: { categoryId: '2' } }">
              {{ t('home.categories.society') }}
            </el-menu-item>
            <el-menu-item index="cat-3" :route="{ path: '/home', query: { categoryId: '3' } }">
              {{ t('home.categories.domestic') }}
            </el-menu-item>
            <el-menu-item index="cat-4" :route="{ path: '/home', query: { categoryId: '4' } }">
              {{ t('home.categories.international') }}
            </el-menu-item>
            <el-menu-item index="cat-5" :route="{ path: '/home', query: { categoryId: '5' } }">
              {{ t('home.categories.entertainment') }}
            </el-menu-item>
            <el-menu-item index="cat-6" :route="{ path: '/home', query: { categoryId: '6' } }">
              {{ t('home.categories.sports') }}
            </el-menu-item>
            <el-menu-item index="cat-7" :route="{ path: '/home', query: { categoryId: '7' } }">
              {{ t('home.categories.military') }}
            </el-menu-item>
            <el-menu-item index="cat-8" :route="{ path: '/home', query: { categoryId: '8' } }">
              {{ t('home.categories.technology') }}
            </el-menu-item>
            <el-menu-item index="cat-9" :route="{ path: '/home', query: { categoryId: '9' } }">
              {{ t('home.categories.finance') }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/aichat">{{ t('nav.aiChat') }}</el-menu-item>
          <el-menu-item index="/favorite">{{ t('nav.favorite') }}</el-menu-item>
          <el-menu-item index="/history">{{ t('nav.history') }}</el-menu-item>
          <el-menu-item index="/settings">{{ t('nav.pageSettings') }}</el-menu-item>
          <el-menu-item index="/my">{{ t('nav.profile') }}</el-menu-item>
        </el-menu>
        <div class="search-bar">
          <div class="search-container">
            <input
              v-model="searchKeyword"
              type="text"
              class="search-input"
              placeholder="输入新闻标题或描述关键字"
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch" :disabled="loading">
              <span v-if="!loading">搜索</span>
              <span v-else>搜索中</span>
            </button>
            <button v-if="searchKeyword" class="clear-btn" @click="clearSearch">
              ✕
            </button>
          </div>
          <div v-if="showSearchCount" class="search-info">
            找到 {{ searchTotal }} 条相关新闻
          </div>
        </div>

        <div class="actions">
          <div class="user-entry">
            <template v-if="username">
              <router-link to="/my" class="user-block" :title="t('nav.profile')">
                <el-avatar class="header-avatar" :size="34" :src="avatarUrl || undefined">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="link text-red-600 font-medium name">{{ username }}</span>
              </router-link>
              <span @click="logout" class="link logout">{{ t('common.logout') }}</span>
            </template>
            <template v-else>
              <el-icon class="guest-icon"><User /></el-icon>
              <router-link to="/login" class="link">{{ t('common.login') }}</router-link>
              <span class="sep">/</span>
              <router-link to="/register" class="link">{{ t('common.register') }}</router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="header-spacer" aria-hidden="true" />
</template>

<style scoped>
.portal-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  --accent: #b91c1c;
  --accent-soft: #fef2f2;
}

.top-bar {
  background: linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%);
  color: #e2e8f0;
  font-size: 12px;
  line-height: 1;
}

.top-bar .inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tagline {
  letter-spacing: 0.08em;
  opacity: 0.92;
}

.date {
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.main-bar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
}

.main-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 64px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent) 0%, #991b1b 100%);
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(185, 28, 28, 0.35);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.brand-sub {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.nav-menu {
  flex: 1;
  min-width: 0;
  border-bottom: none !important;
  --el-menu-horizontal-height: 64px;
  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: var(--accent-soft);
  --el-menu-active-color: var(--accent);
  --el-menu-text-color: #475569;
  --el-menu-hover-text-color: var(--accent);
}

.nav-menu :deep(.el-menu-item) {
  font-size: 15px;
  font-weight: 500;
  border-bottom: 2px solid transparent !important;
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: var(--accent) !important;
  border-bottom-color: var(--accent) !important;
  background: transparent !important;
}

/* ✅ 8. 搜索栏样式 */
.search-bar {
  flex-shrink: 0;
  width: 300px;
}

.search-container {
  display: flex;
  align-items: center;
  position: relative;
}

.search-input {
  flex: 1;
  padding: 8px 70px 8px 12px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(185, 28, 28, 0.1);
}

.search-btn {
  position: absolute;
  right: 4px;
  padding: 6px 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover:not(:disabled) {
  background: #991b1b;
}

.search-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.clear-btn {
  position: absolute;
  right: 70px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 6px;
}

.clear-btn:hover {
  color: #64748b;
}

.search-info {
  margin-top: 8px;
  padding-left: 12px;
  color: #64748b;
  font-size: 12px;
}

.actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #475569;
  white-space: nowrap;
}

.user-block {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
}

.user-block:hover .name {
  color: var(--accent);
}

.header-avatar {
  flex-shrink: 0;
}

.guest-icon {
  font-size: 18px;
  color: #94a3b8;
}

.user-entry .link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.user-entry .link:hover {
  color: var(--accent);
}

.user-entry .logout {
  margin-left: 2px;
}

.user-entry .sep {
  color: #cbd5e1;
  margin: 0 2px;
}

.header-spacer {
  height: 105px;
}

@media (max-width: 1200px) {
  .nav-menu :deep(.el-menu-item) {
    padding: 0 10px;
    font-size: 13px;
  }
  
  .search-bar {
    width: 250px;
  }
}
</style>