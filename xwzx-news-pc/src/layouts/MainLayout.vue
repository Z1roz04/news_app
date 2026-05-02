<template>
  <div class="main-layout">
    <PortalHeader @search="onSearch" />
    <main class="layout-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import PortalHeader from '../components/PortalHeader.vue'

const router = useRouter()

function onSearch(keyword) {
  router.push({ path: '/search', query: { q: keyword } })
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background-color: var(--app-bg, #f5f7fa);
  color: var(--app-text, #0f172a);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.layout-main {
  min-height: calc(100vh - 105px);
}
</style>
