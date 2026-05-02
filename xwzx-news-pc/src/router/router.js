import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: {
      title: '登录',
      keepAlive: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/Register.vue'),
    meta: {
      title: '注册',
      keepAlive: false,
    },
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../pages/Home.vue'),
        meta: {
          title: '首页',
          keepAlive: true,
        },
      },
      {
        path: 'news/detail/:id',
        name: 'NewsDetail',
        component: () => import('../pages/NewsDetail.vue'),
        meta: {
          title: '新闻详情',
          keepAlive: false,
        },
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('../pages/History.vue'),
        meta: {
          title: '浏览历史',
          keepAlive: false,
        },
      },
      {
        path: 'favorite',
        name: 'Favorite',
        component: () => import('../pages/Favorite.vue'),
        meta: {
          title: '我的收藏',
          keepAlive: false,
        },
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('../pages/Category.vue'),
        meta: {
          title: '分类',
          keepAlive: true,
        },
      },
      {
        path: 'aichat',
        name: 'AIChat',
        component: () => import('../pages/AIChat.vue'),
        meta: {
          title: 'AI问答',
          keepAlive: true,
        },
      },
      {
        path: 'my',
        name: 'My',
        component: () => import('../pages/My.vue'),
        meta: {
          title: '个人中心',
          keepAlive: true,
        },
      },
      {
        path: 'profile',
        name: 'Profile',
        redirect: '/my',
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../pages/Settings.vue'),
        meta: {
          title: '页面设置',
          keepAlive: false,
        },
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('../pages/Search.vue'),
        meta: {
          title: '搜索栏',
          keepAlive: false,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
