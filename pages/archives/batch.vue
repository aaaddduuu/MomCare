<template>
  <view class="page">
    <!-- NavBar -->
    <NavBar title="确认报告信息" />

    <!-- Batch Header -->
    <view class="batch-header">
      <view class="batch-title-row">
        <text class="batch-title">已选 {{ items.length }} 份报告</text>
        <text class="select-all-btn" @tap="selectAll">全部确认</text>
      </view>
      <text class="batch-hint">AI 已识别类型，请确认后入档；可点击类型修改</text>
    </view>

    <!-- List -->
    <scroll-view scroll-y class="scroll">
      <view
        v-for="(item, idx) in items"
        :key="item.id"
        class="batch-item"
        :class="{
          selected: item.selected,
          'batch-item-warning': item.needsConfirm
        }"
        @tap="toggleSelect(idx)"
      >
        <view class="batch-thumb" :class="{ 'batch-thumb-warning': item.needsConfirm }">
          <text class="batch-thumb-icon">{{ item.icon }}</text>
          <view v-if="item.selected" class="batch-check">
            <text class="batch-check-icon">✓</text>
          </view>
        </view>
        <view class="batch-info">
          <view class="batch-type-row">
            <text class="type-badge" :class="item.typeClass">{{ item.typeLabel }}</text>
            <text class="ai-badge" :class="{ 'ai-badge-warning': item.needsConfirm }">
              {{ item.needsConfirm ? '需确认' : 'AI 识别' }}
            </text>
          </view>
          <view class="batch-edit-row">
            <text v-if="item.needsConfirm" class="batch-date-warning">请手动选择类型</text>
            <text v-else class="batch-date">{{ item.dateText }}  ·  {{ item.weekText }}</text>
            <text v-if="item.needsConfirm" class="choose-type-link" @tap.stop="goClassify(item)">选择类型 ›</text>
          </view>
        </view>
      </view>

      <!-- Skip Hint -->
      <view class="skip-hint">
        <text class="skip-hint-text">💡 不确定的报告可先<text class="skip-hint-strong">跳过</text>，稍后从「未归档」整理</text>
      </view>
    </scroll-view>

    <!-- Footer -->
    <view class="batch-footer">
      <view class="btn-secondary" @tap="skipUnselected">
        <text class="btn-secondary-text">跳过未选</text>
      </view>
      <view class="btn-primary" @tap="confirmArchive">
        <text class="btn-primary-text">确认入档（{{ selectedCount }}/{{ items.length }}）</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'

const items = ref([
  {
    id: 1,
    icon: '🩸',
    typeLabel: '血常规',
    typeClass: 'type-blood',
    dateText: '2025/04/02',
    weekText: '孕 32 周',
    selected: true,
    needsConfirm: false
  },
  {
    id: 2,
    icon: '🔬',
    typeLabel: '尿常规',
    typeClass: 'type-urine',
    dateText: '2025/04/02',
    weekText: '孕 32 周',
    selected: true,
    needsConfirm: false
  },
  {
    id: 3,
    icon: '📊',
    typeLabel: '未能识别',
    typeClass: 'type-other',
    dateText: '',
    weekText: '',
    selected: false,
    needsConfirm: true
  },
  {
    id: 4,
    icon: '🧾',
    typeLabel: 'NIPT',
    typeClass: 'type-screen',
    dateText: '2024/12/10',
    weekText: '孕 12 周',
    selected: false,
    needsConfirm: false
  }
])

const selectedCount = computed(() => items.value.filter(i => i.selected).length)

function toggleSelect(idx) {
  items.value[idx].selected = !items.value[idx].selected
}

function selectAll() {
  items.value.forEach(item => { item.selected = true })
}

function goClassify(item) {
  uni.navigateTo({ url: '/pages/archives/classify' })
}

function skipUnselected() {
  uni.navigateBack()
}

function confirmArchive() {
  uni.showToast({ title: `已入档 ${selectedCount.value} 份报告`, icon: 'none' })
  setTimeout(() => { uni.navigateBack() }, 1500)
}
</script>

<style scoped lang="scss">
page {
  --rose: #E8637A;
  --rose-light: #FDEEF1;
  --rose-dark: #C0405A;
  --amber: #F0A940;
  --amber-light: #FEF4E3;
  --blue-light: #EBF3FE;
  --teal-light: #E6F7F4;
  --purple-light: #F0ECFB;
  --green-light: #EAF7EF;
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

/* ── Batch Header ── */
.batch-header {
  padding: 28rpx 32rpx 20rpx;
  border-bottom: 1px solid #F2F0EE;
  flex-shrink: 0;
  background: white;
}

.batch-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.batch-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1A17;
}

.select-all-btn {
  font-size: 26rpx;
  font-weight: 500;
  color: #E8637A;
}

.batch-hint {
  font-size: 24rpx;
  color: #9C9890;
}

/* ── Scroll ── */
.scroll {
  flex: 1;
  padding: 24rpx 0;
}

/* ── Batch Item ── */
.batch-item {
  margin: 0 32rpx 20rpx;
  background: white;
  border-radius: 32rpx;
  padding: 24rpx;
  display: flex;
  gap: 24rpx;
  align-items: center;
  box-shadow: 0 4rpx 32rpx rgba(0, 0, 0, 0.07);
  border: 4rpx solid transparent;
}

.batch-item.selected {
  border-color: #E8637A;
  background: #FFFBFC;
}

.batch-item-warning {
  border-color: #F0A940;
  background: #FFFDF7;
}

.batch-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 20rpx;
  background: #F2F0EE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.batch-thumb-warning {
  background: #FEF4E3;
}

.batch-thumb-icon {
  font-size: 52rpx;
}

.batch-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #E8637A;
  border: 4rpx solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.batch-check-icon {
  font-size: 20rpx;
  color: white;
}

.batch-info {
  flex: 1;
}

.batch-type-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.type-badge {
  font-size: 22rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 999px;
}

.ai-badge {
  font-size: 20rpx;
  font-weight: 600;
  background: #FDEEF1;
  color: #C0405A;
  padding: 2rpx 12rpx;
  border-radius: 999px;
}

.ai-badge-warning {
  background: #FEF4E3;
  color: #8C5A10;
}

.batch-edit-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.batch-date {
  font-size: 24rpx;
  color: #9C9890;
}

.batch-date-warning {
  font-size: 24rpx;
  color: #9C9890;
}

.choose-type-link {
  font-size: 24rpx;
  color: #E8637A;
  font-weight: 500;
}

/* ── Type Badge Colors ── */
.type-blood { background: #FDEEF1; color: #C0405A; }
.type-ultrasound { background: #EBF3FE; color: #2A6FCC; }
.type-urine { background: #E6F7F4; color: #1A7A68; }
.type-screen { background: #F0ECFB; color: #5A40A8; }
.type-sugar { background: #FEF4E3; color: #8C5A10; }
.type-other { background: #F2F0EE; color: #6E6A64; }

/* ── Skip Hint ── */
.skip-hint {
  margin: 8rpx 32rpx 16rpx;
  padding: 20rpx 28rpx;
  background: #F2F0EE;
  border-radius: 20rpx;
}

.skip-hint-text {
  font-size: 24rpx;
  color: #9C9890;
  line-height: 1.6;
}

.skip-hint-strong {
  font-weight: 600;
  color: #6E6A64;
}

/* ── Footer ── */
.batch-footer {
  padding: 28rpx 32rpx;
  background: white;
  border-top: 1px solid #F2F0EE;
  display: flex;
  gap: 20rpx;
  flex-shrink: 0;
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
}

.btn-secondary {
  flex: 1;
  height: 88rpx;
  background: #F2F0EE;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #6E6A64;
}

.btn-primary {
  flex: 2;
  height: 88rpx;
  background: #E8637A;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 24rpx rgba(232, 99, 122, 0.3);
}

.btn-primary-text {
  font-size: 28rpx;
  font-weight: 600;
  color: white;
}
</style>
