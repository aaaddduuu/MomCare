<template>
  <view class="hero" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- Radial highlight overlay -->
    <view class="hero-overlay"></view>

    <!-- Greeting row -->
    <view class="hero-top">
      <text class="hero-greet">{{ greeting }}</text>
      <view class="hero-avatar" @tap="handleTapAvatar">
        <text class="hero-avatar-emoji">🌸</text>
      </view>
    </view>

    <!-- Week + Due date row -->
    <view class="hero-row" v-if="pregInfoSet">
      <!-- Left: week block -->
      <view class="week-block">
        <text class="week-label">今天是孕</text>
        <view class="week-big-row">
          <text class="week-number">{{ weekInfo.week }}</text>
          <text class="week-unit">周</text>
        </view>
        <text class="week-days">+ {{ weekInfo.day }} 天</text>
      </view>

      <!-- Right: due badge -->
      <view class="due-block">
        <view class="due-badge">
          <text class="due-number">{{ daysUntilDue }}</text>
          <text class="due-unit">DAYS</text>
          <text class="due-label">距预产期</text>
        </view>
      </view>
    </view>

    <!-- 未设置孕期信息时的引导 -->
    <view class="hero-row setup-guide" v-else @tap="goSetup">
      <view class="setup-content">
        <text class="setup-icon">📝</text>
        <view class="setup-text-wrap">
          <text class="setup-title">设置您的孕期信息</text>
          <text class="setup-desc">填写末次月经日期，开始记录孕期旅程</text>
        </view>
        <text class="setup-arrow">›</text>
      </view>
    </view>

    <!-- Fruit comparison pill -->
    <view class="fruit-row" v-if="pregInfoSet">
      <text class="fruit-emoji">{{ fruitComparison.emoji }}</text>
      <text class="fruit-text">宝宝现在像一颗 <text class="fruit-name">{{ fruitComparison.name }}</text> 那么大</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getTrimester, getTrimesterName } from '@/stores/health.js'

const statusBarHeight = ref(0)
const app = getApp()
if (app && app.globalData) {
  statusBarHeight.value = app.globalData.statusBarHeight || 0
}

const props = defineProps({
  greeting: {
    type: String,
    default: '早上好，宝妈'
  },
  weekInfo: {
    type: Object,
    default: () => ({ week: 0, day: 0, total: 0 })
  },
  daysUntilDue: {
    type: Number,
    default: 0
  },
  fruitComparison: {
    type: Object,
    default: () => ({ emoji: '🫘', name: '种子' })
  },
  pregInfoSet: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tapAvatar'])

const trimesterLabel = computed(() => {
  if (!props.weekInfo || !props.weekInfo.week) return ''
  return getTrimesterName(getTrimester(props.weekInfo.week))
})

function handleTapAvatar() {
  emit('tapAvatar')
}

function goSetup() {
  uni.navigateTo({ url: '/pages/profile/pregnancy-info' })
}
</script>

<style scoped lang="scss">
.hero {
  position: relative;
  flex-shrink: 0;
  overflow: visible;
  padding: 0 40rpx 36rpx;
  background: linear-gradient(158deg, #C45070 0%, #E07898 36%, #F0A8BA 66%, #F8DDE8 100%);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at 78% 8%, rgba(255, 255, 255, 0.18) 0%, transparent 55%);
  pointer-events: none;
}

/* ── Greeting row ── */
.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16rpx;
  position: relative;
}

.hero-greet {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.hero-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-avatar-emoji {
  font-size: 30rpx;
  line-height: 1;
}

/* ── Week + Due row ── */
.hero-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  position: relative;
}

.week-block {
  flex: 1;
}

.week-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.1em;
  margin-bottom: 2rpx;
}

.week-big-row {
  display: flex;
  align-items: baseline;
}

.week-number {
  font-family: 'Noto Serif SC', serif;
  font-size: 120rpx;
  font-weight: 700;
  color: white;
  line-height: 1;
  letter-spacing: -4rpx;
}

.week-unit {
  font-family: 'Noto Serif SC', serif;
  font-size: 52rpx;
  font-weight: 400;
  color: white;
  opacity: 0.85;
  margin-left: 4rpx;
  line-height: 1;
}

.week-days {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2rpx;
}

/* ── Due badge ── */
.due-block {
  text-align: right;
}

.due-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 28rpx;
  padding: 14rpx 28rpx;
}

.due-number {
  font-family: 'Noto Serif SC', serif;
  font-size: 56rpx;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.due-unit {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.05em;
}

.due-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 4rpx;
}

/* ── Fruit pill ── */
.fruit-row {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999rpx;
  padding: 10rpx 24rpx;
  margin-top: 16rpx;
  position: relative;
  z-index: 2;
}

.fruit-emoji {
  font-size: 24rpx;
  line-height: 1;
}

.fruit-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.fruit-name {
  color: white;
  font-weight: 600;
}

/* ── Setup guide ── */
.setup-guide {
  padding: 12rpx 0;
}

.setup-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 24rpx;
  padding: 28rpx 28rpx;
  width: 100%;
  box-sizing: border-box;
}

.setup-icon {
  font-size: 44rpx;
  flex-shrink: 0;
}

.setup-text-wrap {
  flex: 1;
}

.setup-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4rpx;
}

.setup-desc {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.setup-arrow {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}
</style>
