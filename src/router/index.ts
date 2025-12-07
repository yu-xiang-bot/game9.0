import { createRouter, createWebHistory } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue') 
  },
  {
    path: '/',
    name: 'index',
    component: () => import('../views/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/test/index.vue') 
  },
  {
    path: '/game',
    redirect: '/game/1'
  },
  {
    path: '/game/:id',
    name: 'game',
    component: () => import('../views/gameWorker/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dev/createMap',
    name: 'createMap',
    component: () => import('../views/dev/createMap/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/login',
    name: 'adminLogin',
    component: () => import('../views/admin/AdminLogin.vue')
  },
  {
    path: '/admin',
    name: 'adminPanel',
    component: () => import('../views/admin/SimpleAdmin.vue'),
    meta: { requiresAuth: true }
  },
  // {
  //   path: '/teamfight-tactics',
  //   name: 'Teamfight Tactics',
  //   component: () => import('../views/teamfightTactics/index.vue') 
  // },
]

const router = createRouter({
  history: createWebHistory(), // hash模式：createWebHashHistory history模式：createWebHistory
  routes: routes as any
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userInfoStore = useUserInfoStore()
  
  // 检查该路由是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果未登录，重定向到登录页
    if (!userInfoStore.userInfo) {
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存要访问的页面路径
      })
    } else {
      next() // 已登录，继续导航
    }
  } else {
    next() // 不需要登录权限的页面，直接导航
  }
})

export default router