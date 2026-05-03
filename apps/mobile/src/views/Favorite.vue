<template>
  <div class="favorite-container">
    <van-nav-bar
      title="我的收藏"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      right-text="清空"
      @click-right="onClickClear"
      fixed
    />
    
    <div class="favorite-list" v-if="favoriteStore.getFavorites.length">
      <div class="favorite-item" v-for="item in favoriteStore.getFavorites" :key="item.id">
        <van-cell @click="goToNewsDetail(item.id)" :border="false">
          <template #title>
            <div class="news-item">
              <div class="news-image" v-if="item.image">
                <img :src="item.image" :alt="item.title">
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
          </template>
        </van-cell>
        <van-button 
          class="delete-btn" 
          type="danger" 
          size="mini" 
          icon="cross"
          @click="confirmDelete(item.id)"
        ></van-button>
      </div>
    </div>
    
    <van-empty v-else description="暂无收藏内容" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFavoriteStore } from '../store/modules/favorite';
import { useUserStore } from '../store/user';
import { showDialog, showToast } from 'vant';

const router = useRouter();
const favoriteStore = useFavoriteStore();
const userStore = useUserStore();

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 跳转到新闻详情
const goToNewsDetail = (id) => {
  router.push(`/news/detail/${id}`);
};

// 删除单条收藏
const removeFavoriteItem = async (id) => {
  const result = await favoriteStore.removeFavorite(id);
  if (result.success) {
    // API请求成功后，已从store中移除
    showToast('已取消收藏');
  }
};

// 确认删除
const confirmDelete = (id) => {
  showDialog({
    title: '提示',
    message: '确定要删除这条收藏吗？',
    showCancelButton: true,
  }).then((action) => {
    if (action === 'confirm') {
      removeFavoriteItem(id);
    }
  });
};

// 清空收藏
const onClickClear = async () => {
  showDialog({
    title: '提示',
    message: '确定要清空所有收藏吗？',
    showCancelButton: true,
  }).then(async (action) => {
    if (action === 'confirm') {
      const result = await favoriteStore.clearFavorites();
      if (!result || !result.success) {
        // 如果API请求失败，回退到本地清空
        // favoriteStore.clearFavorites();
        console.log('清空收藏列表');
      }
    }
  });
};

// 刷新收藏列表
const refreshFavorites = async () => {
  if (!userStore.isLogin) return
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

// 组件挂载时加载收藏数据
onMounted(async () => {
  // 使用API请求获取收藏列表
  try {
    const result = await favoriteStore.getFavoriteList();
    if (!result || !result.success) {
      // 如果API请求失败，回退到本地存储
      favoriteStore.loadFavorites();
    }
  } catch (error) {
    favoriteStore.loadFavorites();
  }
  
  // 添加页面可见性和焦点监听（多端同步）
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)
});

onUnmounted(() => {
  // 移除监听
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
})
</script>

<style scoped>
.favorite-container {
  padding-top: 46px;
  padding-bottom: 20px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.favorite-list {
  padding: 10px;
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
  line-clamp: 2;
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

.delete-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  z-index: 10;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>