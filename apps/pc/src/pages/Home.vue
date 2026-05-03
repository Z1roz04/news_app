<template>
  <div class="home-container">
    <div class="news-wrapper">
      <NewsItem v-if="firstNews" :news="firstNews" featured />

      <div v-if="remainingNews.length > 0" class="view-switch">
        <el-radio-group v-model="viewMode" size="large">
          <el-radio-button label="list">列表浏览</el-radio-button>
          <el-radio-button label="card">卡片浏览</el-radio-button>
        </el-radio-group>
      </div>

      <template v-if="viewMode === 'list'">
        <NewsItem
          v-for="news in remainingNews"
          :key="news.id"
          :news="news"
        />
      </template>

      <div v-else class="card-list">
        <NewsCard
          v-for="news in remainingNews"
          :key="news.id"
          :news="news"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '../store/modules/news'
import NewsItem from '../components/NewsItem.vue'
import NewsCard from '../components/NewsCard.vue'

const route = useRoute()
const newsStore = useNewsStore()
const viewMode = ref('list')
const firstNews = computed(() => newsStore.newsList[0] || null)
const remainingNews = computed(() => newsStore.newsList.slice(1))

async function loadNewsForHome() {
  const q = route.query.categoryId
  const hasCategory =
    q !== undefined && q !== null && !(Array.isArray(q) && q.length === 0) && String(q).trim() !== ''

  if (hasCategory) {
    const raw = Array.isArray(q) ? q[0] : q
    newsStore.currentCategory = Number(raw)
  } else {
    if (newsStore.categories.length === 0) {
      await newsStore.getCategories()
    }
    const list = newsStore.categories.filter((c) => c.id !== 10)
    if (list.length > 0) {
      newsStore.currentCategory = list[0].id
    }
  }
  await newsStore.getNewsList(true)
}

watch(
  () => route.fullPath,
  () => {
    if (!route.path.endsWith('/home')) return
    loadNewsForHome()
  },
  { immediate: true },
)
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.news-wrapper {
  display: flex;
  flex-direction: column;
}

.view-switch {
  margin: 2px 0 12px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
</style>