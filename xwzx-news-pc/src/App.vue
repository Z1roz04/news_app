<template>
  <div id="app">
    <router-view />  
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useThemeStore } from './store/theme'

/** 最小化/切标签页恢复后，若全屏 Loading 已不存在，清理可能残留的 body 锁定类（lock:true 会加 overflow:hidden） */
function clearStrayElLoadingBodyLock() {
  if (typeof document === 'undefined') return
  if (document.querySelector('.el-loading-mask.is-fullscreen')) return
  document.body.classList.remove('el-loading-parent--hidden')
}

function onVisibilityBack() {
  if (document.visibilityState !== 'visible') return
  requestAnimationFrame(() => clearStrayElLoadingBodyLock())
}

function onPageShow(ev) {
  if (ev.persisted) clearStrayElLoadingBodyLock()
}

onMounted(() => {
  useThemeStore().initTheme()
  document.addEventListener('visibilitychange', onVisibilityBack)
  window.addEventListener('pageshow', onPageShow)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityBack)
  window.removeEventListener('pageshow', onPageShow)
})
</script>