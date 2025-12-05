<template>
  <div class="com-game-navbar">
    <div class="left">
      <div class="left-area">
        <span class="icon-wrap">
          <span class="iconfont icon-jinbi1"></span>
        </span>
        <span class="money">{{money}}</span>
        <span v-if="addMoney.num" class="add-money">{{addMoney.num}}</span>
      </div>
    </div>
    <div class="center">
      <span class="level fff-color">{{level + 1}}</span> 
      <span class="fff-color" style="margin:0 4px;">/</span>
      <span class="level2 fff-color">∞</span> 
      波僵尸
    </div>
    <div class="right">
      <el-tooltip effect="dark" content="开始 / 暂停游戏" :placement="source.isMobile ? 'left' : 'bottom'">
        <span class="icon-wrap icon-hover" @click="emit('gamePause')">
          <span class="iconfont" :class="isPause ? 'icon-kaishi1' : 'icon-24gf-pause2'"></span>
        </span>
      </el-tooltip>
      <el-tooltip effect="dark" content="退出游戏" :placement="source.isMobile ? 'left' : 'bottom'">
        <span class="icon-wrap icon-hover exit-button" @click="exitGame">
          <div class="icon-arrow-box"></div>
        </span>
      </el-tooltip>
      <el-tooltip effect="dark" content="播放 / 关闭音乐" :placement="source.isMobile ? 'left' : 'bottom'">
        <span class="icon-wrap icon-hover" @click="emit('playBgAudio')">
          <span class="iconfont" :class="isPlayBgAudio ? 'icon-mn_shengyin_fill' : 'icon-mn_shengyinwu_fill'"></span>
        </span>
      </el-tooltip>
      <el-tooltip effect="dark" content="上传成绩，重新开始" :placement="source.isMobile ? 'left' : 'bottom'">
        <span class="icon-wrap icon-hover" @click="reStart">
          <span class="iconfont icon-jurassic_restart" ></span>
        </span>
      </el-tooltip>
      <el-tooltip effect="dark" content="其他工具（待开发）" :placement="source.isMobile ? 'left' : 'bottom'">
        <span class="icon-wrap icon-hover">
          <span class="iconfont icon-xuanxiangka_fuzhi"></span>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSourceStore } from '@/stores/source';
import { ElTooltip, ElMessageBox } from 'element-plus';
import { nextTick, reactive, watch } from 'vue';

const props = defineProps({
  money: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0
  },
  isPause: {
    type: Boolean,
    default: true
  },
  isPlayBgAudio: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits<{
  (event: 'gamePause'): void
  (event: 'playBgAudio'): void
  (event: 'reStart'): void
  (event: 'exitGame'): void
}>()

const source = useSourceStore()

const addMoney = reactive({
  num: '', 
  timer: undefined as NodeJS.Timeout | undefined, 
  time: 1000
})

// 监听增加的钱
watch(() => props.money, (newVal, oldVal) => {
  addMoney.num = ''
  clearTimeout(addMoney.timer!)
  addMoney.timer = undefined
  nextTick(() => {
    const val = newVal - oldVal
    addMoney.num = (val >= 0 ? '+' : '') + val
    addMoney.timer = setTimeout(() => {
      addMoney.num = ''
    }, addMoney.time);
  })
})

const reStart = () => {
  ElMessageBox.confirm(
    '当前的成绩将作为最终的成绩，您确定要上传得分并重新开始游戏吗？',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    emit('reStart')
  })
}

const exitGame = () => {
  ElMessageBox.confirm(
    '您确定要退出游戏吗？当前页面游戏数据将清除。',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    emit('exitGame')
  })
}

</script>

<style lang='less' scoped>
@import '@/style.less';
.com-game-navbar {
  @size: var(--size);
  @smallSize: calc(@size * 0.6);
  @fontSize: calc(@size * 0.32);
  position: absolute;
  top: 0;
  left: @smallSize;
  right: @smallSize;
  height: calc(@size * 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #b3e5fc;
  border-bottom-left-radius: @fontSize;
  border-bottom-right-radius: @fontSize;
  padding: 0 20px;
  box-shadow: -7px 4px 14px #2980b9;
  user-select: none;
  .left {
    flex: 1;
    &-area {
      position: relative;
      display: flex;
      align-items: center;
      width: fit-content;
      .icon-wrap {
        width: @smallSize;
        height: @smallSize;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(to left top, #fffc00, #fefdee);
        border-radius: @size;
        border: 1px solid #d8b356;
        .iconfont {
          font-size: @fontSize;
          line-height: @fontSize;
          color: #c87a1a;
        }
      }
      .money {
        margin-left: 10px;
        font-size: @fontSize;
        font-weight: bold;
        color: @theme3;
      }
      .add-money {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translate(100%, -50%);
        font-size: calc(@fontSize * 0.9);
        color: @theme3;
        font-weight: bold;
        margin-left: 6px;
        opacity: 0;
        animation: add-money 0.6s ease;
      }
      @keyframes add-money {
        0% {
          transform: translate(calc(@size * 0.2 + 100%), -50%);
          opacity: 0;
        }
        50% {
          transform: translate(calc(@size * 0.3 + 100%), -50%);
          opacity: 1;
        }
        100% {
          transform: translate(calc(@size * 0.4 + 100%), -50%);
          opacity: 0;
        }
      }
    }
  }
  .center {
    box-sizing: border-box;
    width: calc(@size * 4);
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: @fontSize;
    line-height: @fontSize;
    font-weight: bold;
    color: @theme3;
    background: #2980b9;
    border-radius: calc(@size * 0.8);
    border: calc(@fontSize * 0.2) solid @theme3;
    box-shadow: -7px 4px 14px #2980b9,
      inset 3px 4px 6px #1a5276;
    .fff-color {
      color: #fff;
    }
    .level {
      font-size: @fontSize;
    }
    .level2 {
      font-size: calc(@size * 0.48);
      margin-right: 8px;
    }
  } 
  .right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    .icon-wrap {
      width: calc(@smallSize * 1.1);
      height: calc(@smallSize * 1.1);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      
      /* 背景渐变 */
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      
      /* 悬停效果 */
      &:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        
        /* 添加光泽效果 */
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
          left: 100%;
        }
      }
      
      /* 活跃效果 */
      &:active {
        transform: translateY(0) scale(0.98);
        box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
      }
      
      /* 内部光晕效果 */
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
      }
      
      &:hover::after {
        width: 100%;
        height: 100%;
      }
      
      /* 为不同按钮添加不同的颜色主题 */
      &:nth-child(1) {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
      }
      
      /* 退出按钮 - 红色警告主题 */
      &:nth-child(2) {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        border: 2px solid rgba(255, 255, 255, 0.3);
        
        /* 添加脉冲效果，突出重要性 */
        animation: exitPulse 2s infinite;
        
        /* 逃生箭头图标 */
        .icon-arrow-box {
          width: 18px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.9); /* 方框边框 */
          border-radius: 3px; /* 圆角效果 */
          position: relative;
          overflow: hidden; /* 隐藏箭头超出边框的部分 */
          background: transparent; /* 背景色 */
          transition: all 0.3s ease;
        }

        /* 箭头部分 */
        .icon-arrow-box::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 3px; /* 箭头与左边框的距离 */
          transform: translateY(-50%);
          width: 12px;
          height: 9px;
          background: rgba(255, 255, 255, 0.95); /* 箭头颜色 */
          clip-path: polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%); /* 箭头形状 */
          transition: all 0.3s ease;
        }
        
        /* 悬停效果 */
        &:hover .icon-arrow-box {
          border-color: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }
        
        &:hover .icon-arrow-box::after {
          left: 4px;
          background: rgba(255, 255, 255, 1);
          clip-path: polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%, 30% 50%); /* 更尖锐的箭头 */
        }
        
        /* 按下效果 */
        &:active .icon-arrow-box {
          transform: scale(0.95);
        }
        
        &:active .icon-arrow-box::after {
          left: 1px;
        }
      }
      
      &:nth-child(3) {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
      }
      
      &:nth-child(4) {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
      }
      
      &:nth-child(5) {
        background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
        box-shadow: 0 4px 15px rgba(48, 207, 208, 0.4);
      }
      
      /* 悬停时的阴影效果 */
      &:nth-child(1):hover {
        box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
      }
      
      /* 退出按钮悬停时更强烈的警告效果 */
      &:nth-child(2):hover {
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.7);
        background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
        border-color: rgba(255, 255, 255, 0.6);
        transform: translateY(-3px) scale(1.08);
      }
      
      &:nth-child(3):hover {
        box-shadow: 0 6px 20px rgba(67, 233, 123, 0.6);
      }
      
      &:nth-child(4):hover {
        box-shadow: 0 6px 20px rgba(250, 112, 154, 0.6);
      }
      
      &:nth-child(5):hover {
        box-shadow: 0 6px 20px rgba(48, 207, 208, 0.6);
      }
      
      /* 退出按钮脉冲动画 */
      @keyframes exitPulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
        50% {
          transform: scale(1.02);
          box-shadow: 0 6px 18px rgba(255, 107, 107, 0.6);
        }
      }
      
      .iconfont {
        font-size: calc(@fontSize * 0.9);
        color: #fff;
        transition: all 0.3s ease;
        position: relative;
        z-index: 2;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      /* 悬停时图标缩放效果 */
      &:hover .iconfont {
        transform: scale(1.1);
      }
    }
  }
}
</style>