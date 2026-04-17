<template>
  <view class="page">
    <!-- Hero 区域 -->
    <view class="hero">
      <NavBar title="胎动记录" theme="dark" class="hero-navbar" />

      <view class="hero-content" v-if="stats.count > 0">
        <text class="hero-label">今日总计</text>
        <text class="hero-count">{{ stats.today }}次</text>
        <text class="hero-sub">已记录 {{ stats.count }} 天 · 昨日 {{ stats.yesterday }}次</text>
        <view class="hero-chips">
          <view class="chip chip-normal">
            <text class="chip-text">日正常 ≥10次</text>
          </view>
          <view class="chip" :class="stats.today >= 10 ? 'chip-status-normal' : 'chip-status-warn'">
            <text class="chip-text">{{ stats.today >= 10 ? '正常' : '偏少' }}</text>
          </view>
        </view>
      </view>
      <view class="hero-content" v-else>
        <text class="hero-label">暂无胎动记录</text>
        <text class="hero-sub">去首页开始记录胎动吧</text>
      </view>
    </view>

    <!-- 滚动区域 -->
    <scroll-view scroll-y class="scroll-content">
      <!-- 胎动热力图 -->
      <view class="heatmap-card" v-if="stats.count > 0">
        <view class="heatmap-header">
          <text class="heatmap-title">{{ fetalData.heatmap.month + 1 }}月胎动热力图</text>
          <view class="heatmap-legend">
            <text class="legend-label">少</text>
            <view class="legend-block heat-0"></view>
            <view class="legend-block heat-1"></view>
            <view class="legend-block heat-2"></view>
            <view class="legend-block heat-3"></view>
            <view class="legend-block heat-4"></view>
            <text class="legend-label">多</text>
          </view>
        </view>

        <!-- 星期头 -->
        <view class="heatmap-week-header">
          <text
            v-for="day in weekDays"
            :key="day"
            class="week-day-text"
          >{{ day }}</text>
        </view>

        <!-- 日期网格 -->
        <view class="heatmap-grid">
          <view
            v-for="n in fetalData.heatmap.firstDayOfWeek"
            :key="'empty-' + n"
            class="heatmap-cell heatmap-cell-empty"
          ></view>
          <view
            v-for="(item, idx) in fetalData.heatmap.data"
            :key="'day-' + idx"
            class="heatmap-cell"
            :class="[item.heatClass, { 'heatmap-cell-today': item.isToday }]"
          >
            <text class="cell-day">{{ item.day }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="section-card empty-state" v-if="stats.count === 0">
        <view class="empty-icon">👣</view>
        <text class="empty-title">暂无胎动记录</text>
        <text class="empty-desc">在首页日历中选择日期，记录胎动数据</text>
        <view class="empty-btn" @tap="goHome">
          <text class="empty-btn-text">去首页记录</text>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import NavBar from '@/components/NavBar.vue'

const healthStore = useHealthStore()

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 从 store 获取统计数据
const stats = computed(() => healthStore.getFetalStats())

// 从 store 获取胎动历史和热力图数据
const fetalData = computed(() => healthStore.getFetalHistory())

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #FBF7F2;
  box-sizing: border-box;
}

/* Hero */
.hero {
  flex-shrink: 0;
  background: linear-gradient(155deg, #4A7A64 0%, #7BA08C 45%, #B0D0C0 100%);
  padding-bottom: 48rpx;
}

.hero-navbar :deep(.nav-bar-dark) {
  background: transparent;
}

.hero-navbar :deep(.status-bar-dark) {
  background: transparent;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 32rpx 0;
}

.hero-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.hero-count {
  font-size: 80rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.1;
  margin-bottom: 12rpx;
}

.hero-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24rpx;
}

.hero-chips {
  display: flex;
  gap: 16rpx;
}

.chip {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
}

.chip-normal {
  background: rgba(255, 255, 255, 0.2);
}

.chip-status-normal {
  background: rgba(76, 175, 130, 0.35);
}

.chip-status-warn {
  background: rgba(232, 120, 152, 0.35);
}

.chip-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* Scroll */
.scroll-content {
  flex: 1;
}

/* Heatmap Card */
.heatmap-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
  margin: 24rpx 24rpx 0;
  padding: 32rpx;
}

.heatmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.heatmap-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3A3834;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.legend-label {
  font-size: 20rpx;
  color: #9B9590;
}

.legend-block {
  width: 24rpx;
  height: 24rpx;
  border-radius: 6rpx;
}

.heatmap-week-header {
  display: flex;
  margin-bottom: 8rpx;
}

.week-day-text {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  color: #9B9590;
  font-weight: 500;
}

.heatmap-grid {
  display: flex;
  flex-wrap: wrap;
}

.heatmap-cell {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  box-sizing: border-box;
  position: relative;
}

.heatmap-cell-empty {
  background: transparent;
}

.heatmap-cell-today {
  border: 4rpx solid #E87898;
}

.cell-day {
  font-size: 22rpx;
  color: #6B6560;
  font-weight: 500;
}

/* Heat levels */
.heat-0 {
  background: #F2F0EE;
}

.heat-1 {
  background: #FFF0F3;
}

.heat-2 {
  background: #FFD8E3;
}

.heat-3 {
  background: #F5A0B8;
}

.heat-4 {
  background: #E87898;

  .cell-day {
    color: #FFFFFF;
  }
}

/* ── Empty State ── */
.section-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
  overflow: hidden;
  margin: 24rpx 24rpx 0;
  padding: 32rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1A17;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #9C9890;
  text-align: center;
  margin-bottom: 40rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #4A7A64, #7BA08C);
  border-radius: 48rpx;
  padding: 20rpx 64rpx;
}

.empty-btn:active {
  opacity: 0.85;
}

.empty-btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.bottom-spacer {
  height: 120rpx;
}
</style>
