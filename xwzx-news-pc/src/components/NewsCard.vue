<template>
  <el-card class="news-card" shadow="hover" @click="goToDetail">
    <template #header>
      <h3 class="news-title">{{ news.title }}</h3>
    </template>
    <img class="news-image" :src="news.image" :alt="news.title" loading="lazy" />
  </el-card>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  news: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/news/detail/${props.news.id}`)
}
</script>

<style scoped>
.news-card {
  width: 100%;
  margin: 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.news-card:hover {
  transform: translateY(-2px);
}

.news-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: #222;
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}
</style>