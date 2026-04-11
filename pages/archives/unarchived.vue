<template>
  <view class="page">
    <!-- NavBar -->
    <NavBar title="未归档报告">
      <template #right>
        <text class="nav-action-text" @tap="archiveAll">全部归档</text>
      </template>
    </NavBar>

    <!-- Instruction Text -->
    <view class="instruction">
      <text class="instruction-text">以下报告尚未完成分类，点击「分类」为每份报告选择正确类型后即可入档。</text>
    </view>

    <!-- Unarchived List -->
    <scroll-view scroll-y class="scroll">
      <view
        v-for="(item, idx) in unarchivedItems"
        :key="idx"
        class="unarchived-item"
        @tap="onItemTap(item)"
      >
        <view class="unarchived-thumb">
          <text class="unarchived-thumb-icon">{{ item.icon }}</text>
        </view>
        <view class="unarchived-info">
          <text class="unarchived-name">{{ item.filename }}</text>
          <text class="unarchived-date">{{ item.uploadDate }} · {{ item.statusText }}</text>
        </view>
        <view class="classify-btn" @tap.stop="onClassifyTap(item)">
          <text class="classify-btn-text">{{ item.recognized ? '确认' : '分类' }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'

const unarchivedItems = ref([
  {
    id: 1,
    icon: '📊',
    filename: 'IMG_2045.jpg',
    uploadDate: '上传于 2025/04/01',
    statusText: '未识别类型',
    recognized: false
  },
  {
    id: 2,
    icon: '🧾',
    filename: 'IMG_2046.jpg',
    uploadDate: '上传于 2025/04/01',
    statusText: '未识别类型',
    recognized: false
  },
  {
    id: 3,
    icon: '📋',
    filename: '报告_0401.pdf',
    uploadDate: '上传于 2025/04/01',
    statusText: '已识别为血常规',
    recognized: true
  }
])

function archiveAll() {
  uni.showToast({ title: '全部归档', icon: 'none' })
}

function onItemTap(item) {
  onClassifyTap(item)
}

function onClassifyTap(item) {
  uni.navigateTo({ url: '/pages/archives/classify' })
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

/* ── Nav Action Text ── */
.nav-action-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #E8637A;
  flex-shrink: 0;
}

/* ── Instruction ── */
.instruction {
  padding: 24rpx 32rpx 0;
}

.instruction-text {
  font-size: 26rpx;
  color: #9C9890;
  line-height: 1.6;
}

/* ── Scroll ── */
.scroll {
  flex: 1;
  padding: 24rpx 0;
}

/* ── Unarchived Item ── */
.unarchived-item {
  margin: 0 32rpx 20rpx;
  background: white;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  gap: 24rpx;
  align-items: center;
  box-shadow: 0 4rpx 32rpx rgba(0, 0, 0, 0.07);
}

.unarchived-thumb {
  width: 112rpx;
  height: 112rpx;
  background: #F2F0EE;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.unarchived-thumb-icon {
  font-size: 48rpx;
}

.unarchived-info {
  flex: 1;
}

.unarchived-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #1C1A17;
  margin-bottom: 6rpx;
  display: block;
}

.unarchived-date {
  font-size: 24rpx;
  color: #9C9890;
  display: block;
}

.classify-btn {
  flex-shrink: 0;
  background: #FDEEF1;
  border-radius: 999px;
  padding: 10rpx 24rpx;
}

.classify-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #E8637A;
  white-space: nowrap;
}
</style>
