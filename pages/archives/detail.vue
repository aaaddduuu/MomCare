<template>
  <view class="page">
    <!-- NavBar -->
    <NavBar title="报告详情" theme="dark">
      <template #right>
        <view class="nav-more" @tap="showMore">
          <text class="nav-more-icon">⋯</text>
        </view>
      </template>
    </NavBar>

    <!-- Scrollable Content -->
    <scroll-view scroll-y class="scroll">
      <!-- Image Area -->
      <view class="detail-img-area">
        <text class="detail-img-icon">🩸</text>
        <view class="detail-img-overlay">
          <text class="detail-img-overlay-text">1 / 1 张</text>
        </view>
      </view>

      <!-- Info Card -->
      <view class="detail-info-card">
        <view class="detail-info-header">
          <text class="type-badge type-blood">血常规</text>
          <text class="detail-type-big">血常规检查报告</text>
        </view>
        <view class="detail-info-grid">
          <view class="detail-field">
            <text class="detail-field-label">检查日期</text>
            <text class="detail-field-value">2025年4月2日</text>
          </view>
          <view class="detail-field">
            <text class="detail-field-label">当时孕周</text>
            <text class="detail-field-value">孕 32 周 3 天</text>
          </view>
          <view class="detail-field">
            <text class="detail-field-label">就诊医院</text>
            <text class="detail-field-value">北京协和医院</text>
          </view>
          <view class="detail-field">
            <text class="detail-field-label">上传时间</text>
            <text class="detail-field-value">04/02 10:33</text>
          </view>
        </view>
      </view>

      <!-- AI Entry Card -->
      <view class="ai-entry-card" @tap="goAiResult">
        <view class="ai-entry-icon">
          <text class="ai-entry-icon-text">✦</text>
        </view>
        <view class="ai-entry-text">
          <text class="ai-entry-title">查看 AI 解读</text>
          <text class="ai-entry-sub">已解读 · 发现 1 项指标偏低</text>
        </view>
        <text class="ai-entry-arrow">›</text>
      </view>

      <!-- Action Row -->
      <view class="action-row">
        <view class="action-btn" @tap="onShare">
          <text class="action-btn-text">📤 分享</text>
        </view>
        <view class="action-btn" @tap="onEdit">
          <text class="action-btn-text">✏️ 编辑</text>
        </view>
        <view class="action-btn action-btn-danger" @tap="onDelete">
          <text class="action-btn-text action-btn-danger-text">🗑 删除</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'

function showMore() {
  uni.showToast({ title: '更多操作', icon: 'none' })
}

function goAiResult() {
  uni.navigateTo({ url: '/pages/archives/ai-result' })
}

function onShare() {
  uni.showToast({ title: '分享功能', icon: 'none' })
}

function onEdit() {
  uni.showToast({ title: '编辑功能', icon: 'none' })
}

function onDelete() {
  uni.showToast({ title: '删除功能', icon: 'none' })
}
</script>

<style scoped lang="scss">
page {
  --rose: #E8637A;
  --rose-light: #FDEEF1;
  --rose-dark: #C0405A;
  --gray-50: #FAF9F8;
  --gray-100: #F2F0EE;
  --gray-200: #E4E1DC;
  --gray-300: #C8C4BC;
  --gray-400: #9C9890;
  --gray-500: #6E6A64;
  --gray-700: #3A3834;
  --gray-900: #1C1A17;
  --radius: 16px;
  --radius-sm: 10px;
  --radius-pill: 999px;
  --shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
}

.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #FAF9F8;
  font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
}

/* ── Nav More Button ── */
.nav-more {
  width: 68rpx;
  height: 68rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-more-icon {
  font-size: 32rpx;
  color: white;
}

/* ── Scroll ── */
.scroll {
  flex: 1;
}

/* ── Detail Image Area ── */
.detail-img-area {
  background: #1C1A17;
  height: 480rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.detail-img-icon {
  font-size: 144rpx;
  opacity: 0.3;
}

.detail-img-overlay {
  position: absolute;
  bottom: 24rpx;
  right: 24rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 999px;
  padding: 8rpx 20rpx;
}

.detail-img-overlay-text {
  font-size: 22rpx;
  color: white;
}

/* ── Info Card ── */
.detail-info-card {
  margin: 28rpx 32rpx;
  background: white;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 32rpx rgba(0, 0, 0, 0.07);
}

.detail-info-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 28rpx;
  padding-bottom: 24rpx;
  border-bottom: 1px solid #F2F0EE;
}

.type-badge {
  font-size: 26rpx;
  font-weight: 600;
  padding: 6rpx 20rpx;
  border-radius: 999px;
}

.type-blood {
  background: #FDEEF1;
  color: #C0405A;
}

.detail-type-big {
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1A17;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.detail-field-label {
  font-size: 22rpx;
  color: #9C9890;
  margin-bottom: 6rpx;
  display: block;
}

.detail-field-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #3A3834;
}

/* ── AI Entry Card ── */
.ai-entry-card {
  margin: 0 32rpx 28rpx;
  background: linear-gradient(135deg, #E8637A 0%, #E8527A 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 28rpx;
  box-shadow: 0 8rpx 40rpx rgba(232, 99, 122, 0.3);
}

.ai-entry-icon {
  width: 88rpx;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-entry-icon-text {
  font-size: 44rpx;
  color: white;
}

.ai-entry-text {
  flex: 1;
}

.ai-entry-title {
  font-size: 30rpx;
  font-weight: 600;
  color: white;
  margin-bottom: 4rpx;
  display: block;
}

.ai-entry-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.ai-entry-arrow {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

/* ── Action Row ── */
.action-row {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 40rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  background: white;
  border: 2rpx solid #E4E1DC;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #6E6A64;
}

.action-btn-danger {
  border-color: #F2F0EE;
}

.action-btn-danger-text {
  color: #E8637A;
}
</style>
