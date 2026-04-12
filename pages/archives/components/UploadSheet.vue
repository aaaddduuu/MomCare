<template>
  <view v-if="show" class="overlay" @tap="close">
    <view class="overlay-spacer"></view>
    <view class="upload-sheet" :class="{ 'sheet-visible': animShow }" @tap.stop>
      <view class="sheet-handle"></view>
      <text class="sheet-title">上传产检报告</text>
      <view class="upload-options">
        <view class="upload-opt" @tap="onCamera">
          <view class="opt-icon camera">
            <text class="opt-icon-emoji">📷</text>
          </view>
          <view class="opt-text">
            <text class="opt-label">拍照上传</text>
            <text class="opt-sub">拍摄报告单，自动矫正图片</text>
          </view>
          <text class="opt-arrow">›</text>
        </view>
        <view class="upload-opt" @tap="onGallery">
          <view class="opt-icon gallery">
            <text class="opt-icon-emoji">🖼️</text>
          </view>
          <view class="opt-text">
            <text class="opt-label">从相册选择</text>
            <text class="opt-sub">可多选，支持批量上传</text>
          </view>
          <text class="opt-arrow">›</text>
        </view>
        <view class="upload-opt" @tap="onPdf">
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
import { useReportStore } from '@/stores/report'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'select'])
const reportStore = useReportStore()

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

// 拍照上传
async function onCamera() {
  close()
  try {
    await uni.authorize({ scope: 'scope.camera' })
    await doCamera()
  } catch (e) {
    // 权限被拒绝
    showPermissionDialog('camera')
  }
}

async function doCamera() {
  try {
    const res = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 9,
        sourceType: ['camera'],
        sizeType: ['compressed'],
        success: resolve,
        fail: reject
      })
    })
    await handleUploadResult(res.tempFilePaths)
  } catch (e) {
    console.error('Camera error:', e)
  }
}

// 相册选择
async function onGallery() {
  close()
  try {
    const res = await new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 20,
        sourceType: ['album'],
        sizeType: ['compressed'],
        success: resolve,
        fail: reject
      })
    })
    if (res.tempFilePaths.length > 20) {
      uni.showToast({ title: '最多一次上传 20 张', icon: 'none' })
      return
    }
    await handleUploadResult(res.tempFilePaths)
  } catch (e) {
    console.error('Gallery error:', e)
    if (e && e.errMsg && e.errMsg.includes('deny')) {
      showPermissionDialog('album')
    }
  }
}

// PDF 导入
async function onPdf() {
  close()
  try {
    const res = await new Promise((resolve, reject) => {
      uni.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['.pdf'],
        success: resolve,
        fail: reject
      })
    })
    const file = res.tempFiles[0]
    if (file.size > 30 * 1024 * 1024) {
      uni.showToast({ title: 'PDF 文件不能超过 30MB', icon: 'none' })
      return
    }
    // 上传 PDF
    uni.showLoading({ title: '上传中…' })
    const fileUrl = await reportStore.uploadFile(file.path)
    uni.hideLoading()
    if (fileUrl) {
      emit('select', {
        fileUrls: [fileUrl],
        fileType: 'pdf',
        fileCount: 1
      })
    } else {
      uni.showToast({ title: '上传失败，请重试', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    console.error('PDF error:', e)
  }
}

// 处理图片上传结果
async function handleUploadResult(tempFilePaths) {
  if (!tempFilePaths || tempFilePaths.length === 0) return

  uni.showLoading({ title: '上传中…' })
  const uploadedUrls = []    // 云端 fileID
  const localPaths = []      // 本地临时路径（用于预览）
  let failedCount = 0

  for (const filePath of tempFilePaths) {
    const fileUrl = await reportStore.uploadFile(filePath)
    if (fileUrl) {
      uploadedUrls.push(fileUrl)
      localPaths.push(filePath)
    } else {
      failedCount++
    }
  }

  uni.hideLoading()

  if (failedCount > 0 && uploadedUrls.length === 0) {
    uni.showToast({ title: '上传失败，请检查网络', icon: 'none' })
    return
  }

  if (failedCount > 0) {
    uni.showToast({ title: `${failedCount} 张上传失败，已跳过`, icon: 'none' })
  }

  // 将上传数据存入 store，避免 URL 参数传递问题
  const uploadData = {
    fileUrls: uploadedUrls,
    localPaths: localPaths,
    fileType: 'image',
    fileCount: uploadedUrls.length
  }
  reportStore.pendingUpload = uploadData

  emit('select', uploadData)
}

// 权限拒绝引导
function showPermissionDialog(type) {
  const typeName = type === 'camera' ? '相机' : '相册'
  uni.showModal({
    title: '需要权限',
    content: `需要${typeName}权限才能上传报告，是否前往设置开启？`,
    confirmText: '去设置',
    cancelText: '暂不',
    success: (res) => {
      if (res.confirm) {
        uni.openSetting()
      }
    }
  })
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

.opt-icon.camera { background: #FDEEF1; }
.opt-icon.gallery { background: #EBF3FE; }
.opt-icon.pdf { background: #FEF4E3; }

.opt-text { flex: 1; }

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
