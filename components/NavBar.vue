<template>
  <view class="nav-bar" :class="[theme === 'dark' ? 'nav-bar-dark' : 'nav-bar-light']">
    <view
      class="status-bar"
      :style="{ height: statusBarHeight + 'px' }"
      :class="{ 'status-bar-dark': theme === 'dark' }"
    ></view>
    <view
      class="nav-bar-inner"
      :style="{ height: navBarContentHeight + 'px', paddingRight: menuButtonRightPadding + 'px' }"
    >
      <view v-if="showBack" class="nav-back" :class="{ 'nav-back-dark': theme === 'dark' }" @tap="handleBack">
        <text class="nav-back-icon" :class="{ 'nav-back-icon-dark': theme === 'dark' }">‹</text>
      </view>
      <text class="nav-title" :class="{ 'nav-title-dark': theme === 'dark' }">{{ title }}</text>
      <view class="nav-right" :style="{ marginRight: menuButtonRightPadding > 0 ? '0' : '0' }">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: 'light' // 'light' | 'dark'
  },
  showBack: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['back'])

const statusBarHeight = ref(20)
const navBarContentHeight = ref(44)
const menuButtonRightPadding = ref(0)

onMounted(() => {
  // 使用默认值先渲染，nextTick 异步获取 globalData（不阻塞首屏）
  nextTick(() => {
    const app = getApp()
    if (app && app.globalData) {
      statusBarHeight.value = app.globalData.statusBarHeight || 20
      navBarContentHeight.value = app.globalData.navBarHeight || 44
      menuButtonRightPadding.value = app.globalData.menuButtonRightPadding || 0
    }
  })
})

function handleBack() {
  emit('back')
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.nav-bar {
  flex-shrink: 0;
}

.nav-bar-light {
  background: white;
  border-bottom: 1px solid #F2F0EE;
}

.nav-bar-dark {
  background: #E8637A;
}

.status-bar {
  width: 100%;
}

.status-bar-dark {
  background: #E8637A;
}

.nav-bar-inner {
  display: flex;
  align-items: center;
  padding-left: 32rpx;
  padding-bottom: 12rpx;
  gap: 20rpx;
  box-sizing: border-box;
}

.nav-back {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: #F2F0EE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-back-dark {
  background: rgba(255, 255, 255, 0.2);
}

.nav-back-icon {
  font-size: 32rpx;
  color: #3A3834;
  line-height: 1;
  transform: translateY(-1rpx);
}

.nav-back-icon-dark {
  color: white;
}

.nav-title {
  flex: 1;
  font-size: 34rpx;
  font-weight: 600;
  color: #1C1A17;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-title-dark {
  color: white;
}

.nav-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 16rpx;
}
</style>
