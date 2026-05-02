<template>
  <div class="history-page">
    <!-- 未登录状态 -->
    <template v-if="!isAuthed">
      <el-result icon="warning" title="请先登录" sub-title="登录后可查看和管理历史记录">
        <template #extra>
          <el-button type="primary" @click="router.push('/login')">去登录</el-button>
          <el-button @click="router.push('/register')">注册账号</el-button>
        </template>
      </el-result>
    </template>

    <!-- 已登录状态 -->
    <template v-else>
      <div class="history-container">
        <!-- 右上角清空按钮 -->
        <div class="top-action">
          <el-button text type="danger" @click="onClickClear">清空历史</el-button>
        </div>

        <div class="history-list" v-if="historyStore.getHistory.length">
          <div class="history-item" v-for="item in historyStore.getHistory" :key="item.id">
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
                    <span>浏览时间: {{ item.viewTime }}</span>
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

        <el-empty v-else description="暂无浏览历史" class="empty-box" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import { useHistoryStore } from '../store/modules/history'

const router = useRouter()
const userStore = useUserStore()
const historyStore = useHistoryStore()

const isAuthed = computed(() => Boolean(userStore.token))

const goToNewsDetail = (id) => {
  router.push(`/news/detail/${id}`)
}

const removeHistory = async (id) => {
  try {
    const result = await historyStore.removeHistoryApi(id)
    if (!result.success && !result.isLocal) {
      ElMessage.error(result.message || '删除失败，请稍后重试')
    }
  } catch (error) {
    console.error('删除历史记录失败:', error)
    ElMessage.error('删除失败')
  }
}

const confirmDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条浏览记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => removeHistory(id))
    .catch(() => {})
}

const onClickClear = async () => {
  ElMessageBox.confirm('确定要清空所有浏览历史吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const result = await historyStore.clearHistoryApi()
        if (!result.success && !result.isLocal) {
          ElMessage.error(result.message || '清空失败')
        }
      } catch (error) {
        console.error('清空失败', error)
        ElMessage.error('清空失败')
      }
    })
    .catch(() => {})
}

onMounted(async () => {
  if (!userStore.token) return

  try {
    const result = await historyStore.getHistoryListApi()
    if (!result?.success) {
      // 若接口失败，可尝试从本地缓存加载（根据你 store 的实现）
      historyStore.loadHistory?.()
    }
  } catch (error) {
    historyStore.loadHistory?.()
  }
})
</script>

<style scoped>
.history-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 24px 48px;
}

.history-container {
  background-color: #f7f8fa;
  border-radius: 12px;
  overflow: hidden;
  padding-bottom: 20px;
}

.top-action {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 4px;
}

.history-list {
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

.history-item {
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
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-box {
  margin-top: 50px;
}
</style>