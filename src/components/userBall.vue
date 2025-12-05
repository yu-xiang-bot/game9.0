<script setup lang='ts'>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import FloatingBall from '@/components/floatingBall';
import { ElDropdown, ElDropdownItem, ElMessage, ElMessageBox } from 'element-plus';
import { useUserInfoStore } from '@/stores/userInfo';
import { useRouter } from 'vue-router';
import RankList from './rankList.vue';
import UserInfo from './userInfo.vue'
import SelectLevelPop from './selectLevelPop.vue'
import { useSourceStore } from '@/stores/source';
import SelectTowerPop from './selectTowerPop.vue';
import Circle from './circle';


const props = withDefaults(defineProps<{itemsNum?: number}>(), {
  itemsNum: 3
})
const emit = defineEmits<{
  (event: 'switchMapLevel', index: number): void;
  (event: 'reStart'): void;
}>()

const source = useSourceStore()
const userInfoStore = useUserInfoStore()
const router = useRouter()

const status = ref<-1 | 0 | 1>(window.innerHeight > window.innerWidth ? -1 : 1)
const userInfoVisible = ref(false)
const rankListVisible = ref(false)
const selectLevelVisible = ref(false)
const selectTowerVisible = ref(false)
const isCircleProgress = ref(source.progress < 100)
const ballTimer = ref<NodeJS.Timeout>()
const imageLoadError = ref(false)

// 处理图片加载错误
const handleImageError = () => {
  console.warn('游戏图标加载失败:', gameIconSrc.value)
  
  // 尝试下一个路径
  if (tryNextIconPath()) {
    console.log('尝试下一个图标路径:', gameIconSrc.value)
  } else {
    console.warn('所有图标路径都失败，使用备用图标')
    imageLoadError.value = true
  }
}

// 主题配色
const getThemeColors = () => ({
  primary: '#667eea',
  secondary: '#764ba2', 
  accent: '#f093fb',
  glow: 'rgba(102, 126, 234, 0.6)',
  core: '#ffd700'
})

// 游戏图标路径 - 尝试多个可能的路径
const gameIconPaths = [
  '/src/assets/img/myGame.png',
  '/assets/img/myGame.png',
  './src/assets/img/myGame.png',
  './assets/img/myGame.png',
  '/public/src/assets/img/myGame.png',
  '/public/assets/img/myGame.png'
]

// 默认使用第一个路径，如果加载失败会尝试其他路径
const gameIconSrc = ref(gameIconPaths[0])

// 尝试下一个图标路径
const tryNextIconPath = () => {
  const currentIndex = gameIconPaths.indexOf(gameIconSrc.value)
  if (currentIndex < gameIconPaths.length - 1) {
    gameIconSrc.value = gameIconPaths[currentIndex + 1]
    return true
  }
  return false
}

const floatingBallStyle = computed(() => {
  let distance = source.isMobile ? '1rem' : '50px'
  return {
    '--initial-position-top': distance,
    [source.isMobile ? '--initial-position-left' : '--initial-position-right']: distance,
    '--z-index': '1000',
  }
})

const ballItemStyle = (i: number) => {
  const initDeg = source.isMobile ? -40 : -60
  const endDeg = source.isMobile ? 100 : 80
  const changeDeg = (-initDeg + endDeg) / (props.itemsNum)
  const r = 28 * props.itemsNum * (source.isMobile ? 0.7 : 1)
  const x = -r * Math.cos((initDeg + (i + 1) * changeDeg) * Math.PI / 180) * status.value
  const y = r * Math.sin((initDeg + (i + 1) * changeDeg) * Math.PI / 180) * (status.value ? 1 : 0)
  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    opacity: (status.value ? 1 : 0)
  }
}

const onMagnetic = (isLeft: boolean) => {
  status.value = isLeft ? -1 : 1
  onBallSleep()
}

const login = () => {
  if(!userInfoStore.userInfo) {
    // 跳转到登录页面
    router.push('/login')
  } else {
    ElMessageBox.confirm(
      '您确定要退出登录吗？',
      '退出登录',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await userInfoStore.logout()
      ElMessage.info('登录已退出')
      // 退出后跳转到登录页面
      router.push('/login')
    })
  }
}

const openUser = () => {
  if(userInfoStore.userInfo) {
    userInfoVisible.value = true
  } else {
    ElMessage.info('请先登录')
  }
}

const progressChange = (v: number) => {
  if(v >= 100) {
    // ElMessage.success('资源已加载完毕')
    setTimeout(() => {
      isCircleProgress.value = false
    }, 400);
  }
}

/** 监听球的5s后睡眠 */
const onBallSleep = () => {
  clearBallSleep()
  ballTimer.value = setTimeout(() => {
    status.value = 0
  }, 3000);
}

const clearBallSleep = () => {
  if(ballTimer.value) {
    clearTimeout(ballTimer.value)
    ballTimer.value = undefined
  }
}

onMounted(onBallSleep)

onBeforeUnmount(clearBallSleep)

</script>

<template>
  <FloatingBall
    magnetic="x"
    :style="floatingBallStyle"
    @on-offset-change="status = 0"
    @on-magnetic="onMagnetic"
  >
    <div 
      class="ball-wrap" 
      :class="{'ball-mobile': source.isMobile}" 
      @mouseenter="clearBallSleep"
      @mouseleave="onBallSleep"
    >
      <!-- 优美游戏Logo设计 -->
      <div class="avatar game-logo">
        <!-- 用户已登录时显示头像 -->
        <div class="user-avatar" v-if="userInfoStore.userInfo?.avatar">
          <img :src="userInfoStore.userInfo.avatar" alt="用户头像" class="avatar-img">
          <!-- 用户头像装饰环 -->
          <div class="user-avatar-ring"></div>
        </div>
        
        <!-- 用户未登录时始终显示游戏logo -->
        <div class="logo-container" v-else>
          <!-- 背景光晕 -->
          <div class="bg-glow"></div>
          
          <!-- 外层旋转环 -->
          <div class="outer-ring"></div>
          
          <!-- 内层旋转环 -->
          <div class="inner-ring"></div>
          
          <!-- 中心球体 -->
          <div class="center-sphere">
            <!-- 渐变内核 -->
            <div class="core-gradient"></div>
            
            <!-- 游戏图标 - 固定使用网站图标 -->
            <div class="game-icon">
              <img :src="gameIconSrc" alt="塔防联盟游戏图标" class="game-logo-img" @error="handleImageError">
            </div>
            
            <!-- 光点装饰 -->
            <div class="light-dot dot-1"></div>
            <div class="light-dot dot-2"></div>
            <div class="light-dot dot-3"></div>
            <div class="light-dot dot-4"></div>
          </div>
          
          <!-- 轨道线 -->
          <div class="orbit-line"></div>
        </div>
        
        <!-- 备用图标显示 -->
        <div class="fallback-logo" v-if="!userInfoStore.userInfo?.avatar && imageLoadError">
          <div class="fallback-content">
            <i class="fas fa-gamepad"></i>
          </div>
        </div>
      </div>
      <div class="ball-item" :style="ballItemStyle(0)">
        <div class="ball-item-content" @click="selectTowerVisible = true">塔防选择</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(1)">
        <div class="ball-item-content" @click="rankListVisible = true">排行榜</div>
      </div>
      <div v-if="props.itemsNum === 4" class="ball-item" :style="ballItemStyle(2)">
        <div class="ball-item-content" @click="selectLevelVisible = true">选关</div>
      </div>
      <div class="ball-item" :style="ballItemStyle(props.itemsNum - 1)">
        <ElDropdown size="small">
          <div 
            class="ball-item-content" 
            @click="() => {
              if(!userInfoStore.userInfo) {
                login()
              }
            }"
          >{{ !userInfoStore.userInfo ? '登录' : '设置' }}</div>
          <template #dropdown>
            <ElDropdownItem v-if="userInfoStore.userInfo" @click="openUser">个人信息</ElDropdownItem>
            <ElDropdownItem @click="login">{{ userInfoStore.userInfo ? '退出登录' : '去登录' }}</ElDropdownItem>
            <!-- <ElDropdownItem v-if="userInfoStore.userInfo" @click="login">退出登录</ElDropdownItem> -->
          </template>
        </ElDropdown>
      </div>
      <Circle 
        v-if="isCircleProgress"
        class="circle" 
        :value="Math.ceil(source.progress)" 
        :stroke-width="source.isMobile ? 4 : 6"
        :speed="100"
        :size="source.isMobile ? 62 : 90" 
        layer-color="rgba(255,255,255,0.4)" 
        @on-change="progressChange"
      />
    </div>
  </FloatingBall>
  <UserInfo v-if="userInfoStore.userInfo" v-model:visible="userInfoVisible" />
  <RankList v-model:visible="rankListVisible" />
  <SelectTowerPop v-model:visible="selectTowerVisible" @re-start="emit('reStart')" />
  <SelectLevelPop 
    v-if="props.itemsNum === 4" 
    v-model:visible="selectLevelVisible"
    @switch-map-level="i => emit('switchMapLevel', i)"
  />

</template>

<style lang='less'>
@import '@/style.less';
.ball-wrap {
  position: relative;
  width: 78px;
  height: 78px;
  filter: drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.25));
  
  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    user-select: none;
    -webkit-user-drag: none;
    overflow: hidden;
    
    &.game-logo {
      background: transparent;
    }
  }
  
  .user-avatar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      position: relative;
      z-index: 2;
    }
    
    .user-avatar-ring {
      position: absolute;
      width: 95%;
      height: 95%;
      border: 2px solid transparent;
      border-image: linear-gradient(45deg, v-bind('getThemeColors().primary'), v-bind('getThemeColors().accent')) 1;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
      animation: rotateRing 8s linear infinite;
    }
  }
  
  .logo-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 800px;
  }
  
  .bg-glow {
    position: absolute;
    width: 120%;
    height: 120%;
    border-radius: 50%;
    background: radial-gradient(circle, v-bind('getThemeColors().glow'), transparent 70%);
    filter: blur(8px);
    animation: bgPulse 4s ease-in-out infinite alternate;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .outer-ring {
    position: absolute;
    width: 90%;
    height: 90%;
    border: 2px solid transparent;
    border-image: linear-gradient(45deg, v-bind('getThemeColors().primary'), v-bind('getThemeColors().accent')) 1;
    border-radius: 50%;
    animation: rotateRing 8s linear infinite;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .inner-ring {
    position: absolute;
    width: 75%;
    height: 75%;
    border: 1px solid v-bind('getThemeColors().accent');
    border-radius: 50%;
    animation: rotateRing 6s linear infinite reverse;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.7;
  }
  
  .center-sphere {
    position: relative;
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background: linear-gradient(135deg, v-bind('getThemeColors().primary'), v-bind('getThemeColors().secondary'));
    box-shadow: 
      0 0 20px v-bind('getThemeColors().glow'),
      inset 0 0 15px rgba(255, 255, 255, 0.2);
    animation: sphereFloat 3s ease-in-out infinite;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
  }
  
  .core-gradient {
    position: absolute;
    width: 80%;
    height: 80%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 60%);
    filter: blur(3px);
  }
  
  .game-icon {
    position: relative;
    z-index: 3;
    width: 60%;
    height: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    padding: 4px;
    backdrop-filter: blur(2px);
    
    .game-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.7));
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  
  .fallback-logo {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(135deg, v-bind('getThemeColors().primary'), v-bind('getThemeColors().secondary'));
    display: flex;
    align-items: center;
    justify-content: center;
    
    .fallback-content {
      width: 80%;
      height: 80%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: white;
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    }
  }
  
  .light-dot {
    position: absolute;
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    filter: blur(1px);
    animation: twinkle 2s ease-in-out infinite;
    
    &.dot-1 {
      top: 15%;
      left: 20%;
      animation-delay: 0s;
    }
    
    &.dot-2 {
      top: 25%;
      right: 15%;
      animation-delay: 0.5s;
    }
    
    &.dot-3 {
      bottom: 20%;
      left: 25%;
      animation-delay: 1s;
    }
    
    &.dot-4 {
      bottom: 30%;
      right: 20%;
      animation-delay: 1.5s;
    }
  }
  
  .orbit-line {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px dashed rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    animation: orbitPulse 5s ease-in-out infinite;
  }
  .ball-item {
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    border: 2px solid #fff;
    overflow: hidden;
    top: 50%;
    left: 50%;
    transition: transform ease 0.8s, opacity ease 0.6s;
    font-size: 14px;
    &-content {
      box-sizing: content-box;
      width: 2em;
      height: 2em;
      padding: 0.4em;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      line-height: 14px;
      font-weight: bold;
      font-size: 14px;
      color: #fff;
      background-color: @theme4;
      cursor: pointer;
      transition: all 0.4s;
      &:hover {
        font-size: 14px;
        background-color: @theme3;
      }
    }
    &-disable {
      opacity: 0.7;
    }
  }
  .circle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
  }
}
.ball-mobile {
  width: 54px;
  height: 54px;
  
  .ball-item {
    font-size: 12px;
    &-content {
      font-size: 12px;
    }
  }
  
  .bg-glow {
    width: 110% !important;
    height: 110% !important;
  }
  
  .center-sphere {
    width: 55% !important;
    height: 55% !important;
  }
  
  .game-icon {
    width: 55% !important;
    height: 55% !important;
  }
  
  .light-dot {
    width: 4px !important;
    height: 4px !important;
  }
  
  .user-avatar {
    width: 54px !important;
    height: 54px !important;
  }
  
  .game-logo-img {
    width: 90% !important;
    height: 90% !important;
  }
}

// 动画定义
@keyframes bgPulse {
  0% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes rotateRing {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes sphereFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-3px) scale(1.02);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

@keyframes orbitPulse {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) rotate(45deg) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) rotate(45deg) scale(1.05);
  }
}
</style>@/components/floatingBall