<template>
  <div class="search-page">
    <div v-if="!keyword" class="hint">请输入关键词并搜索</div>
    <template v-else>
      <div
        v-if="newsStore.loading && newsStore.newsList.length === 0"
        class="hint"
      >
        加载中…
      </div>
      <div v-else-if="newsStore.newsList.length === 0" class="hint">
        暂无匹配新闻
      </div>
      <div v-else class="news-wrapper">
        <NewsItem
          v-for="item in newsStore.newsList"
          :key="item.id"
          :news="item"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '../store/modules/news'
import NewsItem from '../components/NewsItem.vue'

const route = useRoute()
const newsStore = useNewsStore()

const keyword = computed(() => {
  const q = route.query.q
  if (q == null || q === '') return ''
  return String(Array.isArray(q) ? q[0] : q).trim()
})

watch(
  keyword,
  (k) => {
    if (!k) {
      newsStore.newsList = []
      newsStore.finished = true
      return
    }
    newsStore.getNewsSearch(k, true)
  },
  { immediate: true },
)
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.hint {
  padding: 24px;
  text-align: center;
  color: var(--app-text-muted, #909399);
}
.news-wrapper {
  display: flex;
  flex-direction: column;
}
</style>
