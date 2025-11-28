// 简单的管理员认证工具
// 注意：这是一个简化的示例，生产环境应使用更安全的认证方式

const ADMIN_PASSWORD = 'admin123456' // 简化密码，生产环境应使用更安全的方式
const ADMIN_KEY = 'towerdefense_admin_token'

export const adminAuth = {
  // 验证管理员权限
  verify(password: string): boolean {
    return password === ADMIN_PASSWORD
  },

  // 获取当前管理员状态
  isAuthenticated(): boolean {
    return !!localStorage.getItem(ADMIN_KEY)
  },

  // 登录
  login(password: string): boolean {
    if (this.verify(password)) {
      localStorage.setItem(ADMIN_KEY, 'true')
      return true
    }
    return false
  },

  // 登出
  logout(): void {
    localStorage.removeItem(ADMIN_KEY)
  },

  // 检查并跳转
  checkAndRedirect(): void {
    if (!this.isAuthenticated()) {
      // 可以跳转到登录页面或显示登录对话框
      return
    }
  }
}