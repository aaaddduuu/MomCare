<template>
  <view class="page">
    <!-- Hero 区域 -->
    <view class="hero">
      <!-- 状态栏占位 -->
      <view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>

      <!-- 导航栏 -->
      <NavBar title="血压记录" theme="dark"></NavBar>

      <!-- Hero 内容 -->
      <view class="hero-content">
        <text class="hero-label">最新血压</text>
        <view class="hero-value-row">
          <text class="hero-value">118/76</text>
          <text class="hero-unit">mmHg</text>
        </view>
        <text class="hero-sub">收缩压 118 · 舒张压 76 · 脉压差 42</text>
        <view class="hero-chips">
          <view class="chip chip-normal">
            <text class="chip-text">正常参考 &lt;140/90</text>
          </view>
          <view class="chip chip-warning">
            <text class="chip-text">血压正常</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 滚动内容区 -->
    <scroll-view scroll-y class="scroll-content">
      <!-- 趋势图区域 -->
      <view class="section-card chart-card">
        <view class="section-header">
          <text class="section-title">血压趋势</text>
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

        <!-- 占位图表 - 双线（收缩压实线 + 舒张压虚线） -->
        <view class="chart-placeholder">
          <view class="chart-area">
            <!-- 正常范围背景 -->
            <view class="chart-normal-zone"></view>
            <!-- 收缩压线（实线） -->
            <view class="chart-line-container">
              <view class="mock-point systolic-point" style="left: 10%; bottom: 68%;"></view>
              <view class="mock-point systolic-point" style="left: 28%; bottom: 72%;"></view>
              <view class="mock-point systolic-point" style="left: 46%; bottom: 65%;"></view>
              <view class="mock-point systolic-point" style="left: 64%; bottom: 70%;"></view>
              <view class="mock-point systolic-point" style="left: 82%; bottom: 67%;"></view>
              <!-- 连线 - 收缩压（实线） -->
              <view class="mock-line systolic-line" style="left: 10%; width: 18%; bottom: 70%; transform: rotate(3deg);"></view>
              <view class="mock-line systolic-line" style="left: 28%; width: 18%; bottom: 68.5%; transform: rotate(-5deg);"></view>
              <view class="mock-line systolic-line" style="left: 46%; width: 18%; bottom: 67.5%; transform: rotate(4deg);"></view>
              <view class="mock-line systolic-line" style="left: 64%; width: 18%; bottom: 68.5%; transform: rotate(-2deg);"></view>
              <!-- 舒张压点 -->
              <view class="mock-point diastolic-point" style="left: 10%; bottom: 40%;"></view>
              <view class="mock-point diastolic-point" style="left: 28%; bottom: 44%;"></view>
              <view class="mock-point diastolic-point" style="left: 46%; bottom: 38%;"></view>
              <view class="mock-point diastolic-point" style="left: 64%; bottom: 42%;"></view>
              <view class="mock-point diastolic-point" style="left: 82%; bottom: 39%;"></view>
              <!-- 连线 - 舒张压（虚线） -->
              <view class="mock-line diastolic-line" style="left: 10%; width: 18%; bottom: 42%; transform: rotate(3deg);"></view>
              <view class="mock-line diastolic-line" style="left: 28%; width: 18%; bottom: 41%; transform: rotate(-4deg);"></view>
              <view class="mock-line diastolic-line" style="left: 46%; width: 18%; bottom: 40%; transform: rotate(3deg);"></view>
              <view class="mock-line diastolic-line" style="left: 64%; width: 18%; bottom: 40.5%; transform: rotate(-2deg);"></view>
            </view>
            <!-- Y轴标签 -->
            <view class="chart-y-labels">
              <text class="chart-y-label">140</text>
              <text class="chart-y-label">120</text>
              <text class="chart-y-label">100</text>
              <text class="chart-y-label">80</text>
              <text class="chart-y-label">60</text>
            </view>
          </view>
        </view>

        <!-- 图例 -->
        <view class="chart-legend">
          <view class="legend-item">
            <view class="legend-line legend-systolic"></view>
            <text class="legend-text">收缩压</text>
          </view>
          <view class="legend-item">
            <view class="legend-line legend-diastolic"></view>
            <text class="legend-text">舒张压</text>
          </view>
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
              <text class="history-value">{{ item.systolic }}/{{ item.diastolic }}</text>
              <text class="history-unit-label">mmHg</text>
              <view class="history-badge" :class="item.badgeClass">
                <text class="history-badge-text">{{ item.status }}</text>
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
    dotColor: '#4CAF82',
    date: '4月15日',
    week: '孕24周+3',
    systolic: '118',
    diastolic: '76',
    status: '正常',
    badgeClass: 'badge-normal'
  },
  {
    dotColor: '#F0A940',
    date: '4月8日',
    week: '孕23周+3',
    systolic: '136',
    diastolic: '88',
    status: '偏高',
    badgeClass: 'badge-high'
  },
  {
    dotColor: '#4CAF82',
    date: '4月1日',
    week: '孕22周+3',
    systolic: '122',
    diastolic: '78',
    status: '正常',
    badgeClass: 'badge-normal'
  },
  {
    dotColor: '#4CAF82',
    date: '3月25日',
    week: '孕21周+3',
    systolic: '115',
    diastolic: '74',
    status: '正常',
    badgeClass: 'badge-normal'
  }
])
</script>

<style scoped lang="scss">
page {
  --sky: #3A70A8;
  --sky-light: #EBF2FB;
  --sky-mid: #5B8FC9;
  --sky-pale: #A0C8F0;
  --green: #4CAF82;
  --green-light: #EAF7EF;
  --amber: #F0A940;
  --amber-light: #FEF4E3;
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
  background: linear-gradient(155deg, #3A70A8 0%, #5B8FC9 45%, #A0C8F0 100%);
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
  color: #3A70A8;
  font-weight: 600;
}

/* ── Chart Placeholder ── */
.chart-placeholder {
  margin-bottom: 20rpx;
}

.chart-area {
  position: relative;
  height: 360rpx;
  background: #FAF9F8;
  border-radius: 20rpx;
  overflow: hidden;
}

.chart-normal-zone {
  position: absolute;
  left: 60rpx;
  right: 20rpx;
  top: 12%;
  bottom: 22%;
  background: rgba(76, 175, 130, 0.08);
  border-top: 2rpx dashed rgba(76, 175, 130, 0.25);
  border-bottom: 2rpx dashed rgba(76, 175, 130, 0.25);
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
  border: 3rpx solid #FFFFFF;
  z-index: 2;
}

.systolic-point {
  background: #3A70A8;
  box-shadow: 0 2rpx 8rpx rgba(58, 112, 168, 0.3);
}

.diastolic-point {
  background: #A0C8F0;
  box-shadow: 0 2rpx 8rpx rgba(160, 200, 240, 0.4);
}

.mock-line {
  position: absolute;
  height: 4rpx;
  border-radius: 2rpx;
  z-index: 1;
}

.systolic-line {
  background: #3A70A8;
}

.diastolic-line {
  background: repeating-linear-gradient(
    90deg,
    #A0C8F0 0rpx,
    #A0C8F0 12rpx,
    transparent 12rpx,
    transparent 20rpx
  );
}

.chart-y-labels {
  position: absolute;
  left: 4rpx;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12rpx 0;
}

.chart-y-label {
  font-size: 20rpx;
  color: #C8C4BC;
}

/* ── Chart Legend ── */
.chart-legend {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding-top: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.legend-line {
  width: 32rpx;
  height: 4rpx;
  border-radius: 2rpx;
}

.legend-systolic {
  background: #3A70A8;
}

.legend-diastolic {
  background: repeating-linear-gradient(
    90deg,
    #A0C8F0 0rpx,
    #A0C8F0 6rpx,
    transparent 6rpx,
    transparent 10rpx
  );
}

.legend-text {
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

.history-badge {
  padding: 4rpx 20rpx;
  border-radius: 999rpx;
}

.badge-normal {
  background: #EAF7EF;
}

.badge-high {
  background: #FEF4E3;
}

.history-badge-text {
  font-size: 22rpx;
  font-weight: 600;
}

.badge-normal .history-badge-text {
  color: #4CAF82;
}

.badge-high .history-badge-text {
  color: #F0A940;
}

/* ── Bottom Spacer ── */
.bottom-spacer {
  height: 120rpx;
}
</style>
