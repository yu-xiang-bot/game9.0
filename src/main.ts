import { createApp } from 'vue'
import './style.less'
import './style2.css'
import App from './App.vue'
import router from './router/index'
import ElementPlus  from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persist'

const pinia = createPinia()
pinia.use(piniaPluginPersist)

const app = createApp(App)

app
.use(router)
.use(ElementPlus)
.use(pinia)

// 应用启动时检查认证状态
import { useUserInfoStore } from './stores/userInfo'

app.mount('#app')

// 在应用挂载后检查认证状态
setTimeout(async () => {
  const userInfoStore = useUserInfoStore()
  await userInfoStore.checkAuthStatus()
}, 0)
