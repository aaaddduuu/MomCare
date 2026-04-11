<template>
  <view v-if="show" class="overlay" @tap="close">
    <view class="overlay-spacer"></view>
    <view class="upload-sheet" :class="{ 'sheet-visible': animShow }" @tap.stop>
      <view class="sheet-handle"></view>
      <text class="sheet-title">上传产检报告</text>
      <view class="upload-options">
        <view class="upload-opt" @tap="onOptionTap('camera')">
          <view class="opt-icon camera">
            <text class="opt-icon-emoji">📷</text>
          </view>
          <view class="opt-text">
            <text class="opt-label">拍照上传</text>
            <text class="opt-sub">拍摄报告单，自动矫正图片</text>
          </view>
          <text class="opt-arrow">›</text>
        </view>
        <view class="upload-opt" @tap="onOptionTap('gallery')">
          <view class="opt-icon gallery">
            <text class="opt-icon-emoji">🖼️</text>
          </view>
          <view class="opt-text">
            <text class="opt-label">从相册选择</text>
            <text class="opt-sub">可多选，支持批量上传</text>
          </view>
          <text class="opt-arrow">›</text>
        </view>
        <view class="upload-opt" @tap="onOptionTap('pdf')">
          <view class="opt-icon pdf">
            <text class="opt-icon-emoji">📄</text>
          </view>
          <view class="opt-text">
            <text class="opt-label">导入 PDF 文件</text>
            <text class="opt-sub">支持医院 PDF 报告单</text>
          </view>
          <text class="opt-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'select'])

const animShow = ref(false)

watch(() => props.show, (val) => {
  if (val) {
    nextTick(() => {
      setTimeout(() => {
        animShow.value = true
      }, 50)
    })
  } else {
    animShow.value = false
  }
})

function close() {
  animShow.value = false
  setTimeout(() => {
    emit('update:show', false)
  }, 250)
}

function onOptionTap(type) {
  emit('update:show', false)
  animShow.value = false
  if (type === 'camera') {
    uni.navigateTo({ url: '/pages/archives/classify' })
  } else if (type === 'gallery') {
    uni.navigateTo({ url: '/pages/archives/batch' })
  } else {
    uni.navigateTo({ url: '/pages/archives/classify' })
  }
}
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.overlay-spacer {
  flex: 1;
}

.upload-sheet {
  background: white;
  border-radius: 56rpx 56rpx 0 0;
  padding: 40rpx 40rpx 64rpx;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sheet-visible {
  transform: translateY(0);
}

.sheet-handle {
  width: 72rpx;
  height: 8rpx;
  background: #E4E1DC;
  border-radius: 4rpx;
  margin: 0 auto 40rpx;
}

.sheet-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1A17;
  margin-bottom: 32rpx;
  display: block;
}

.upload-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.upload-opt {
  display: flex;
  align-items: center;
  gap: 28rpx;
  padding: 28rpx 32rpx;
  background: #FAF9F8;
  border-radius: 20rpx;
}

.opt-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-icon-emoji {
  font-size: 36rpx;
}

.opt-icon.camera {
  background: #FDEEF1;
}

.opt-icon.gallery {
  background: #EBF3FE;
}

.opt-icon.pdf {
  background: #FEF4E3;
}

.opt-text {
  flex: 1;
}

.opt-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #1C1A17;
  display: block;
}

.opt-sub {
  font-size: 24rpx;
  color: #9C9890;
  margin-top: 2rpx;
  display: block;
}

.opt-arrow {
  font-size: 28rpx;
  color: #C8C4BC;
  flex-shrink: 0;
}
</style>
