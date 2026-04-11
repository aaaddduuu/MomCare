<template>
  <view class="page">
    <!-- NavBar -->
    <NavBar title="确认报告信息" />

    <!-- Content -->
    <scroll-view scroll-y class="scroll">
      <view class="confirm-preview">
        <!-- Preview Image -->
        <view class="confirm-preview-img">
          <text class="preview-icon">📊</text>
        </view>

        <!-- Form -->
        <view class="confirm-form">
          <!-- Type Grid -->
          <view class="form-label">
            <text class="form-label-text">报告类型</text>
          </view>
          <view class="type-grid">
            <view
              v-for="(t, idx) in typeOptions"
              :key="idx"
              class="type-option"
              :class="{ selected: selectedType === idx }"
              @tap="selectedType = idx"
            >
              <text class="type-option-icon">{{ t.icon }}</text>
              <text class="type-option-label" :class="{ 'type-option-label-active': selectedType === idx }">{{ t.label }}</text>
            </view>
          </view>

          <!-- Date -->
          <view class="form-row">
            <view class="form-label">
              <text class="form-label-text">检查日期</text>
            </view>
            <input class="form-input" value="2024 / 12 / 10" />
            <text class="form-hint">从报告自动识别，可修改</text>
          </view>

          <!-- Pregnancy Week -->
          <view class="form-row">
            <view class="form-label">
              <text class="form-label-text">当时孕周（可选）</text>
            </view>
            <input class="form-input" placeholder="如：孕 12 周" placeholder-class="input-placeholder" />
          </view>

          <!-- Notes -->
          <view class="form-row">
            <view class="form-label">
              <text class="form-label-text">备注（可选）</text>
            </view>
            <input class="form-input" placeholder="添加备注…" placeholder-class="input-placeholder" />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Footer -->
    <view class="batch-footer">
      <view class="btn-secondary" @tap="goBack">
        <text class="btn-secondary-text">取消</text>
      </view>
      <view class="btn-primary" @tap="save">
        <text class="btn-primary-text">确认保存</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'

const selectedType = ref(2) // default to 唐氏筛查 per prototype

const typeOptions = [
  { icon: '🩸', label: '血常规' },
  { icon: '📊', label: 'B 超' },
  { icon: '🧬', label: '唐氏筛查' },
  { icon: '🍬', label: '糖耐量' },
  { icon: '🔬', label: '尿常规' },
  { icon: '🧾', label: '无创 DNA' },
  { icon: '🩺', label: '产科记录' },
  { icon: '🧪', label: '生化全套' },
  { icon: '📋', label: '其他' }
]

function goBack() {
  uni.navigateBack()
}

function save() {
  uni.navigateBack()
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
  --shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
}

.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #FAF9F8;
  font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
}

/* ── Scroll ── */
.scroll {
  flex: 1;
}

/* ── Confirm Preview Card ── */
.confirm-preview {
  margin: 32rpx;
  background: white;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 32rpx rgba(0, 0, 0, 0.07);
}

.confirm-preview-img {
  width: 100%;
  height: 360rpx;
  background: linear-gradient(145deg, #F2F0EE 0%, #E4E1DC 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-icon {
  font-size: 112rpx;
  opacity: 0.6;
}

.confirm-form {
  padding: 32rpx;
}

/* ── Form ── */
.form-label {
  margin-bottom: 16rpx;
}

.form-label-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #9C9890;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Type Grid ── */
.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.type-option {
  padding: 20rpx 12rpx;
  border-radius: 20rpx;
  background: #F2F0EE;
  border: 4rpx solid transparent;
  text-align: center;
}

.type-option.selected {
  border-color: #E8637A;
  background: #FDEEF1;
}

.type-option-icon {
  font-size: 36rpx;
  display: block;
  margin-bottom: 6rpx;
}

.type-option-label {
  font-size: 22rpx;
  font-weight: 500;
  color: #6E6A64;
  display: block;
}

.type-option-label-active {
  color: #C0405A;
}

/* ── Form Row ── */
.form-row {
  margin-bottom: 28rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #F2F0EE;
  border: none;
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #3A3834;
}

.input-placeholder {
  color: #C8C4BC;
  font-size: 28rpx;
}

.form-hint {
  font-size: 22rpx;
  color: #C8C4BC;
  margin-top: 10rpx;
  display: block;
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
