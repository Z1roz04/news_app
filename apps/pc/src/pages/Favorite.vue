<template>
  <div class="favorite-page">
    <template v-if="!isAuthed">
      <el-result icon="warning" title="请先登录" sub-title="登录后可查看和管理收藏内容">
        <template #extra>
          <el-button type="primary" @click="router.push('/login')">去登录</el-button>
          <el-button @click="router.push('/register')">注册账号</el-button>
        </template>
      </el-result>
    </template>

    <template v-else>
      <div class="favorite-container">
        <div class="top-action">
          <el-button text type="danger" @click="onClickClear">清空收藏</el-button>
        </div>

        <!-- 收藏列表 -->
        <div class="favorite-list" v-if="favoriteStore.getFavorites.length">
          <div class="favorite-item" v-for="item in favoriteStore.getFavorites" :key="item.id">
            <div class="cell" @click="goToNewsDetail(item.id)">
              <div class="news-item">
                <div class="news-image" v-if="item.image">
                  <img :src="item.image" :alt="item.title" />
                </div>
                <div class="news-info">
                  <div class="news-title">{{ item.title }}</div>
                  <div class="news-meta">
                    <span>{{ item.author }}</span>
                    <span>{{ item.publishTime }}</span>
                    <span>收藏时间: {{ item.favoriteTime }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-button
              class="delete-btn"
              type="danger"
              size="small"
              circle
              :icon="Close"
              @click.stop="confirmDelete(item.id)"
            />
          </div>
        </div>

        <el-empty v-else description="暂无收藏内容" class="empty-box" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'        // 根据你的实际路径调整
import { useFavoriteStore } from '../store/modules/favorite'

const router = useRouter()
const userStore = useUserStore()
const favoriteStore = useFavoriteStore()


const isAuthed = computed(() => Boolean(userStore.token))

// 跳转新闻详情
const goToNewsDetail = (id) => {
  router.push(`/news/detail/${id}`)
}

// 删除单条收藏
const removeFavoriteItem = async (id) => {
  const result = await favoriteStore.removeFavorite(id)
  if (result.success) {
    ElMessage.success('删除成功')
    // 立即从服务器刷新（确保多端同步）
    await favoriteStore.getFavoriteList()
  } else {
    ElMessage.error('删除失败')
  }
}

// 二次确认删除
const confirmDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => removeFavoriteItem(id))
    .catch(() => {})
}

// 清空全部收藏
const onClickClear = async () => {
  ElMessageBox.confirm('确定要清空所有收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const result = await favoriteStore.clearFavorites()
      if (result?.success) {
        ElMessage.success('清空成功')
        // 立即从服务器刷新（确保多端同步）
        await favoriteStore.getFavoriteList()
      } else {
        ElMessage.error('清空失败')
      }
    })
    .catch(() => {})
}

// 刷新收藏列表
const refreshFavorites = async () => {
  if (!userStore.token) return
  try {
    await favoriteStore.getFavoriteList()
  } catch (error) {
    console.error('刷新收藏列表失败:', error)
  }
}

// 页面可见性变化时刷新
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // 页面变为可见，刷新数据
    refreshFavorites()
  }
}

// 窗口获得焦点时刷新
const handleWindowFocus = () => {
  refreshFavorites()
}

// 初始化加载收藏（仅登录后请求）
onMounted(async () => {
  if (!userStore.token) return  // 未登录不请求

  try {
    const result = await favoriteStore.getFavoriteList()
    if (!result?.success) {
      // 若接口失败，可尝试从本地缓存加载（根据你 store 的实现）
      favoriteStore.loadFavorites?.()
    }
  } catch (error) {
    favoriteStore.loadFavorites?.()
  }
  
  // 添加页面可见性和焦点监听
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)
})

onUnmounted(() => {
  // 移除监听
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
})
</script>

<style scoped>
/* 复用个人中心的 my-page 容器样式 */
.favorite-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 24px 48px;
}

/* 收藏内容区域 */
.favorite-container {
  background-color: #f7f8fa;
  border-radius: 12px;
  overflow: hidden;
  padding-bottom: 20px;
}

/* 右上角清空按钮 */
.top-action {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 4px;
}

.favorite-list {
  padding: 0 10px 10px;
}

.news-item {
  display: flex;
  padding: 10px 0;
}

.news-image {
  width: 120px;
  height: 80px;
  margin-right: 12px;
  flex-shrink: 0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.news-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.news-title {
  font-size: 16px;
  font-weight: bold;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  flex-wrap: wrap;
}

.news-meta span {
  margin-right: 10px;
}

.favorite-item {
  position: relative;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.cell {
  cursor: pointer;
  padding: 0 10px;
}

.delete-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  z-index: 10;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-box {
  margin-top: 40px;
}
</style>