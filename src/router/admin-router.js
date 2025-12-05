// 后台管理系统路由配置
import SimpleAdmin from '../views/admin/SimpleAdmin.vue'
import AdminLogin from '../views/admin/AdminLogin.vue'

const adminRoutes = [
  {
    path: '/admin',
    name: 'AdminPanel',
    component: SimpleAdmin,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { guestOnly: true }
  }
]

export default adminRoutes