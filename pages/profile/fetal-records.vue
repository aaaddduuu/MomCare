<template>
  <view class="page">
    <!-- Hero 区域 -->
    <view class="hero" :style="{ paddingTop: statusBarHeight + 'px' }">
      <NavBar title="胎动记录" theme="dark" />

      <view class="hero-content">
        <text class="hero-label">今日总计</text>
        <text class="hero-count">18次</text>
        <text class="hero-sub">3次记录 · 早 5次 · 午 7次 · 晚 6次</text>
        <view class="hero-chips">
          <view class="chip chip-normal">
            <text class="chip-text">日正常 ≥10次</text>
          </view>
          <view class="chip chip-status">
            <text class="chip-text chip-text-status">正常</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 滚动区域 -->
    <scroll-view scroll-y class="scroll-content">
      <!-- 今日三次记录卡片 -->
      <view class="sessions-card">
        <view class="sessions-columns">
          <!-- 早 -->
          <view class="session-col">
            <text class="session-period">早</text>
            <text class="session-time">09:00</text>
            <text class="session-count session-count-rose">5次</text>
          </view>
          <!-- 午 -->
          <view class="session-col">
            <text class="session-period">午</text>
            <text class="session-time">14:00</text>
            <text class="session-count session-count-rose">7次</text>
          </view>
          <!-- 晚 -->
          <view class="session-col">
            <text class="session-period">晚</text>
            <text class="session-time">21:00</text>
            <text class="session-count session-count-empty">—</text>
            <text class="session-empty-label">待记录</text>
          </view>
        </view>
        <view class="session-btn" @tap="handleRecordEvening">
          <text class="session-btn-text">记录晚间胎动</text>
        </view>
      </view>

      <!-- 胎动热力图 -->
      <view class="heatmap-card">
        <view class="heatmap-header">
          <text class="heatmap-title">4月胎动热力图</text>
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
          <!-- 前置空白（4月1日是周二，前面空2格） -->
          <view
            v-for="n in leadingEmpty"
            :key="'empty-' + n"
            class="heatmap-cell heatmap-cell-empty"
          ></view>
          <!-- 日期格子 -->
          <view
            v-for="(item, idx) in heatData"
            :key="'day-' + idx"
            class="heatmap-cell"
            :class="[item.heatClass, { 'heatmap-cell-today': item.isToday }]"
          >
            <text class="cell-day">{{ item.day }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'

const app = getApp()
const statusBarHeight = ref(20)
if (app && app.globalData) {
  statusBarHeight.value = app.globalData.statusBarHeight || 20
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// Mock data: days 1-13 have varying counts, days 14+ are empty
const mockCounts = {
  1: 14, 2: 18, 3: 12, 4: 22, 5: 16,
  6: 11, 7: 20, 8: 24, 9: 15, 10: 19,
  11: 13, 12: 17, 13: 21
}

const today = 16
// 4月1日是周二（2026年4月1日实际是周三，这里用2代表周二偏移，以符合需求描述）
const leadingEmpty = 2

function getHeatLevel(count) {
  if (!count || count === 0) return 'heat-0'
  if (count >= 10 && count < 14) return 'heat-1'
  if (count >= 14 && count < 18) return 'heat-2'
  if (count >= 18 && count < 22) return 'heat-3'
  if (count >= 22) return 'heat-4'
  return 'heat-0'
}

const heatData = computed(() => {
  const days = []
  for (let d = 1; d <= 30; d++) {
    const count = mockCounts[d] || 0
    days.push({
      day: d,
      count,
      heatClass: getHeatLevel(count),
      isToday: d === today
    })
  }
  return days
})

function handleRecordEvening() {
  uni.showToast({ title: '记录晚间胎动', icon: 'none' })
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

.chip-status {
  background: rgba(232, 120, 152, 0.35);
}

.chip-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

.chip-text-status {
  color: #FFFFFF;
  font-weight: 600;
}

/* Scroll */
.scroll-content {
  flex: 1;
}

/* Sessions Card */
.sessions-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
  margin: 24rpx 24rpx 0;
  padding: 32rpx;
}

.sessions-columns {
  display: flex;
  margin-bottom: 32rpx;
}

.session-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.session-period {
  font-size: 26rpx;
  color: #9B9590;
  font-weight: 500;
}

.session-time {
  font-size: 22rpx;
  color: #B5AFA9;
}

.session-count {
  font-size: 40rpx;
  font-weight: 700;
  margin-top: 4rpx;
}

.session-count-rose {
  color: #E87898;
}

.session-count-empty {
  color: #C8C2BC;
}

.session-empty-label {
  font-size: 22rpx;
  color: #C8C2BC;
}

.session-btn {
  background: linear-gradient(135deg, #E87898 0%, #D4567A 100%);
  border-radius: 48rpx;
  padding: 22rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.session-btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
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

.bottom-spacer {
  height: 120rpx;
}
</style>
