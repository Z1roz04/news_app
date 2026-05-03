<template>
  <div class="news-item" :class="{ featured }" @click="goToDetail">
    <div class="news-content">
      <h3 class="news-title">{{ news.title }}</h3>
      <p class="news-desc">{{ news.description }}</p>
      <div class="news-info">
        <span>{{ news.author }}</span>
        <span>{{ news.publishTime }}</span>
        <span>{{ news.views }} 阅读</span>
      </div>
    </div>
    <div class="news-image">
      <img :src="news.image" :alt="news.title">
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  news: {
    type: Object,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/news/detail/${props.news.id}`)
}
</script>

<style scoped>
.news-item {
  display: flex;
  padding: 15px;
  margin-bottom: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
.news-content {
  flex: 1;
  margin-right: 15px;
}
.news-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
}
.news-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}
.news-info {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 15px;
}
.news-image {
  width: 140px;
  height: 100px;
}
.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.news-item.featured {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 16px;
}

.news-item.featured .news-content {
  margin-right: 0;
  margin-left: 16px;
}

.news-item.featured .news-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.5;
}

.news-item.featured .news-image {
  width: 52%;
  height: auto;
  flex-shrink: 0;
}

.news-item.featured .news-image img {
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
}
</style>