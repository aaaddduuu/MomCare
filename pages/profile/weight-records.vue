<template>
  <view class="page">
    <!-- Hero 区域 -->
    <view class="hero">
      <!-- 状态栏占位 -->
      <view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>

      <!-- 导航栏 -->
      <NavBar title="体重记录" theme="dark"></NavBar>

      <!-- Hero 内容 -->
      <view class="hero-content">
        <text class="hero-label">最新体重</text>
        <view class="hero-value-row">
          <text class="hero-value">62.5</text>
          <text class="hero-unit">kg</text>
        </view>
        <text class="hero-sub">孕前体重 54.0kg · 孕期增重 +8.5kg</text>
        <view class="hero-chips">
          <view class="chip chip-who">
            <text class="chip-text">WHO 推荐增重范围</text>
          </view>
          <view class="chip chip-progress">
            <text class="chip-text">增重正常</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 滚动内容区 -->
    <scroll-view scroll-y class="scroll-content">
      <!-- 趋势图区域 -->
      <view class="section-card chart-card">
        <view class="section-header">
          <text class="section-title">体重趋势</text>
          <view class="range-tabs">
            <view
              v-for="(tab, idx) in rangeTabs"
              :key="idx"
              class="range-tab"
              :class="{ 'range-tab-active': activeRange === idx }"
              @tap="activeRange = idx"
            >
              <text class="range-tab-text" :class="{ 'range-tab-text-active': activeRange === idx }">{{ tab }}</text>
            </view>
          </view>
        </view>

        <!-- 占位图表 -->
        <view class="chart-placeholder">
          <view class="chart-area">
            <!-- WHO 推荐范围背景 -->
            <view class="chart-who-zone"></view>
            <!-- 模拟数据折线 -->
            <view class="chart-line-container">
              <view class="mock-point" style="left: 10%; bottom: 30%;"></view>
              <view class="mock-point" style="left: 25%; bottom: 38%;"></view>
              <view class="mock-point" style="left: 40%; bottom: 50%;"></view>
              <view class="mock-point" style="left: 55%; bottom: 58%;"></view>
              <view class="mock-point" style="left: 70%; bottom: 65%;"></view>
              <view class="mock-point" style="left: 85%; bottom: 72%;"></view>
              <!-- 连线 -->
              <view class="mock-line" style="left: 10%; width: 15%; bottom: 34%; transform: rotate(10deg);"></view>
              <view class="mock-line" style="left: 25%; width: 15%; bottom: 44%; transform: rotate(14deg);"></view>
              <view class="mock-line" style="left: 40%; width: 15%; bottom: 54%; transform: rotate(10deg);"></view>
              <view class="mock-line" style="left: 55%; width: 15%; bottom: 61.5%; transform: rotate(8deg);"></view>
              <view class="mock-line" style="left: 70%; width: 15%; bottom: 68.5%; transform: rotate(10deg);"></view>
            </view>
            <!-- Y轴标签 -->
            <view class="chart-y-labels">
              <text class="chart-y-label">70</text>
              <text class="chart-y-label">60</text>
              <text class="chart-y-label">50</text>
            </view>
          </view>
        </view>

        <view class="chart-hint">
          <view class="hint-dot"></view>
          <text class="hint-text">绿色区域为 WHO 推荐增重范围</text>
        </view>
      </view>

      <!-- 历史记录 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">历史记录</text>
        </view>
        <view class="history-list">
          <view
            v-for="(item, idx) in historyList"
            :key="idx"
            class="history-item"
          >
            <view class="history-left">
              <view class="history-dot" :style="{ backgroundColor: item.dotColor }"></view>
              <view class="history-info">
                <text class="history-date">{{ item.date }}</text>
                <text class="history-week">{{ item.week }}</text>
              </view>
            </view>
            <view class="history-right">
              <text class="history-value">{{ item.value }}</text>
              <text class="history-unit-label">kg</text>
              <view class="history-diff" :class="item.diffClass">
                <text class="history-diff-text">{{ item.diff }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

const statusBarHeight = ref(20)

onMounted(() => {
  const app = getApp()
  if (app && app.globalData) {
    statusBarHeight.value = app.globalData.statusBarHeight || 20
  }
})

// 范围选项卡
const rangeTabs = ['1月', '3月', '全程']
const activeRange = ref(1)

// 历史记录模拟数据
const historyList = ref([
  {
    dotColor: '#C45070',
    date: '4月15日',
    week: '孕24周+3',
    value: '62.5',
    diff: '+0.3',
    diffClass: 'diff-up'
  },
  {
    dotColor: '#D4788C',
    date: '4月8日',
    week: '孕23周+3',
    value: '62.2',
    diff: '+0.5',
    diffClass: 'diff-up'
  },
  {
    dotColor: '#4CAF82',
    date: '4月1日',
    week: '孕22周+3',
    value: '61.7',
    diff: '-0.3',
    diffClass: 'diff-down'
  },
  {
    dotColor: '#D4788C',
    date: '3月25日',
    week: '孕21周+3',
    value: '62.0',
    diff: '+0.4',
    diffClass: 'diff-up'
  },
  {
    dotColor: '#9C9890',
    date: '3月18日',
    week: '孕20周+3',
    value: '61.6',
    diff: '±0',
    diffClass: 'diff-zero'
  }
])
</script>

<style scoped lang="scss">
page {
  --rose: #C45070;
  --rose-light: #FDEEF1;
  --rose-mid: #E07898;
  --rose-pale: #F4C0CC;
  --sky: #3A70A8;
  --green: #4CAF82;
  --green-light: #EAF7EF;
  --amber: #F0A940;
  --gray-50: #FAF9F8;
  --gray-100: #F2F0EE;
  --gray-200: #E4E1DC;
  --gray-300: #C8C4BC;
  --gray-400: #9C9890;
  --gray-500: #6E6A64;
  --gray-700: #3A3834;
  --gray-900: #1C1A17;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #FBF7F2;
  box-sizing: border-box;
}

/* ── Hero ── */
.hero {
  flex-shrink: 0;
  background: linear-gradient(155deg, #C45070 0%, #E07898 40%, #F4C0CC 100%);
  border-radius: 0 0 40rpx 40rpx;
  overflow: hidden;
}

.status-bar-spacer {
  width: 100%;
}

.hero-content {
  padding: 16rpx 40rpx 44rpx;
}

.hero-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.75);
  display: block;
  margin-bottom: 8rpx;
}

.hero-value-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.hero-value {
  font-size: 80rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}

.hero-unit {
  font-size: 32rpx;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.hero-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: 24rpx;
}

.hero-chips {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.chip {
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.2);
}

.chip-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* ── Scroll Content ── */
.scroll-content {
  flex: 1;
  padding-bottom: 20rpx;
}

.section-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
  overflow: hidden;
  margin: 24rpx 24rpx 0;
  padding: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1A17;
}

/* ── Range Tabs ── */
.range-tabs {
  display: flex;
  background: #F2F0EE;
  border-radius: 999rpx;
  padding: 4rpx;
}

.range-tab {
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
}

.range-tab-active {
  background: #FFFFFF;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.range-tab-text {
  font-size: 24rpx;
  color: #9C9890;
  font-weight: 500;
}

.range-tab-text-active {
  color: #C45070;
  font-weight: 600;
}

/* ── Chart Placeholder ── */
.chart-placeholder {
  margin-bottom: 20rpx;
}

.chart-area {
  position: relative;
  height: 320rpx;
  background: #FAF9F8;
  border-radius: 20rpx;
  overflow: hidden;
}

.chart-who-zone {
  position: absolute;
  left: 60rpx;
  right: 20rpx;
  top: 20%;
  bottom: 30%;
  background: rgba(76, 175, 130, 0.1);
  border-top: 2rpx dashed rgba(76, 175, 130, 0.3);
  border-bottom: 2rpx dashed rgba(76, 175, 130, 0.3);
  border-radius: 8rpx;
}

.chart-line-container {
  position: absolute;
  left: 60rpx;
  right: 20rpx;
  top: 0;
  bottom: 0;
}

.mock-point {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #C45070;
  border: 3rpx solid #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(196, 80, 112, 0.3);
  z-index: 2;
}

.mock-line {
  position: absolute;
  height: 4rpx;
  background: linear-gradient(90deg, #C45070, #E07898);
  border-radius: 2rpx;
  z-index: 1;
}

.chart-y-labels {
  position: absolute;
  left: 8rpx;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16rpx 0;
}

.chart-y-label {
  font-size: 20rpx;
  color: #C8C4BC;
}

.chart-hint {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-top: 16rpx;
}

.hint-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 6rpx;
  background: rgba(76, 175, 130, 0.25);
  border: 2rpx solid rgba(76, 175, 130, 0.5);
}

.hint-text {
  font-size: 22rpx;
  color: #9C9890;
}

/* ── History List ── */
.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1px solid #F2F0EE;
}

.history-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.history-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.history-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.history-date {
  font-size: 28rpx;
  font-weight: 600;
  color: #1C1A17;
}

.history-week {
  font-size: 22rpx;
  color: #9C9890;
}

.history-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.history-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #1C1A17;
}

.history-unit-label {
  font-size: 22rpx;
  color: #9C9890;
  margin-right: 12rpx;
}

.history-diff {
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
}

.diff-up {
  background: #FDEEF1;
}

.diff-down {
  background: #EAF7EF;
}

.diff-zero {
  background: #F2F0EE;
}

.history-diff-text {
  font-size: 22rpx;
  font-weight: 600;
}

.diff-up .history-diff-text {
  color: #C45070;
}

.diff-down .history-diff-text {
  color: #4CAF82;
}

.diff-zero .history-diff-text {
  color: #9C9890;
}

/* ── Bottom Spacer ── */
.bottom-spacer {
  height: 120rpx;
}
</style>
