<template>
  <div class="category-container">
    <div class="category-title">选择新闻分类</div>

    <div class="category-grid">
      <div
        v-for="category in newsStore.categories"
        :key="category.id"
        class="category-card"
        @click="goToCategory(category.id)"
      >
        <span>{{ category.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNewsStore } from '../store/modules/news'
import { useRouter } from 'vue-router'

const newsStore = useNewsStore()
const router = useRouter()

// 点击分类 → 跳回首页并携带分类ID
const goToCategory = (categoryId) => {
  router.push({
    path: '/home',
    query: { categoryId }
  })
}
</script>

<style scoped>
.category-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}
.category-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.category-card {
  background: #fff;
  padding: 24px;
  border-radius: 10px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.category-card:hover {
  background: #fef2f2;
  color: #b91c1c;
}
</style>