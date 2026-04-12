<template>
  <view class="page">
    <!-- NavBar -->
    <NavBar title="未归档报告">
      <template #right>
        <text
          class="nav-action-text"
          :class="{ 'nav-action-disabled': !allRecognized }"
          @tap="onArchiveAll"
        >全部归档</text>
      </template>
    </NavBar>

    <!-- Empty State -->
    <view v-if="reportStore.unarchivedReports.length === 0 && !loading" class="empty-state">
      <text class="empty-icon">🎉</text>
      <text class="empty-title">所有报告已归档</text>
    </view>

    <template v-else>
      <!-- Instruction Text -->
      <view class="instruction">
        <text class="instruction-text">以下报告尚未完成分类，点击「分类」为每份报告选择正确类型后即可入档。</text>
      </view>

      <!-- Unarchived List -->
      <scroll-view scroll-y class="scroll">
        <view
          v-for="(item) in reportStore.unarchivedReports"
          :key="item._id"
          class="unarchived-item"
          @tap="onItemTap(item)"
        >
          <view class="unarchived-thumb">
            <image v-if="item.file_urls && item.file_urls[0]" :src="item.file_urls[0]" mode="aspectFill" class="unarchived-thumb-img" />
            <text v-else class="unarchived-thumb-icon">{{ getTypeInfo(item.ai_type_guess || 'other').icon }}</text>
          </view>
          <view class="unarchived-info">
            <text class="unarchived-name">{{ item.report_name || '未命名报告' }}</text>
            <text class="unarchived-date">{{ formatUploadTime(item.create_time) }} · {{ getStatusText(item) }}</text>
          </view>
          <view class="unarchived-actions">
            <view class="classify-btn" @tap.stop="onClassifyTap(item)">
              <text class="classify-btn-text">{{ item.ai_type_guess ? '确认' : '分类' }}</text>
            </view>
            <view class="delete-btn" @tap.stop="onDeleteItem(item._id)">
              <text class="delete-btn-text">删除</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </template>

    <!-- Batch Archive Confirm Modal -->
    <view v-if="showBatchConfirm" class="modal-overlay" @tap="showBatchConfirm = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">确认批量归档</text>
        <text class="modal-text">将归档 {{ reportStore.unarchivedReports.length }} 份已识别报告，确认继续？</text>
        <view class="modal-actions">
          <view class="modal-cancel" @tap="showBatchConfirm = false">
            <text class="modal-cancel-text">取消</text>
          </view>
          <view class="modal-confirm" @tap="doBatchArchive">
            <text class="modal-confirm-text">确认归档</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Delete Confirm Modal -->
    <view v-if="showDeleteConfirm" class="modal-overlay" @tap="showDeleteConfirm = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">确认删除</text>
        <text class="modal-text">删除后无法恢复，确认要删除这份报告吗？</text>
        <view class="modal-actions">
          <view class="modal-cancel" @tap="showDeleteConfirm = false">
            <text class="modal-cancel-text">取消</text>
          </view>
          <view class="modal-confirm modal-confirm-danger" @tap="doDelete">
            <text class="modal-confirm-text">删除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import NavBar from '@/components/NavBar.vue'
import { useReportStore, getTypeInfo } from '@/stores/report'

const reportStore = useReportStore()
const loading = ref(true)
const showBatchConfirm = ref(false)
const showDeleteConfirm = ref(false)
const deleteTargetId = ref('')

const allRecognized = computed(() => {
  return reportStore.unarchivedReports.length > 0 &&
    reportStore.unarchivedReports.every(r => r.ai_type_guess)
})

onShow(async () => {
  loading.value = true
  await reportStore.fetchUnarchivedReports()
  loading.value = false

  // 全部处理完自动返回
  if (reportStore.unarchivedReports.length === 0 && !loading.value) {
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

function formatUploadTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ''
  return `上传于 ${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function getStatusText(item) {
  if (item.ai_type_guess) {
    const info = getTypeInfo(item.ai_type_guess)
    return `已识别为${info.label}`
  }
  return '未识别类型'
}

function onItemTap(item) {
  onClassifyTap(item)
}

function onClassifyTap(item) {
  const params = [
    `reportId=${item._id}`,
    `source=p6`
  ]
  if (item.ai_type_guess) {
    params.push(`aiType=${item.ai_type_guess}`)
  }
  if (item.file_urls) {
    params.push(`fileUrls=${encodeURIComponent(JSON.stringify(item.file_urls))}`)
  }
  uni.navigateTo({ url: `/pages/archives/classify?${params.join('&')}` })
}

function onArchiveAll() {
  if (!allRecognized.value) {
    const unrecognized = reportStore.unarchivedReports.filter(r => !r.ai_type_guess).length
    uni.showToast({ title: `有 ${unrecognized} 份报告尚未分类，请先处理`, icon: 'none' })
    return
  }
  showBatchConfirm.value = true
}

async function doBatchArchive() {
  showBatchConfirm.value = false
  const ids = reportStore.unarchivedReports.map(r => r._id)
  uni.showLoading({ title: '归档中…' })
  const ok = await reportStore.batchArchive(ids)
  uni.hideLoading()
  if (ok) {
    uni.showToast({ title: '全部归档成功', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
}

function onDeleteItem(id) {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

async function doDelete() {
  showDeleteConfirm.value = false
  const ok = await reportStore.deleteReport(deleteTargetId.value)
  if (ok) {
    await reportStore.fetchUnarchivedReports()
    uni.showToast({ title: '已删除', icon: 'none' })
  }
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
  display: flex; flex-direction: column; height: 100vh;
  background-color: #FAF9F8;
  font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
}

/* ── Empty State ── */
.empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.empty-title { font-size: 32rpx; font-weight: 600; color: #3A3834; }

/* ── Nav Action Text ── */
.nav-action-text { font-size: 26rpx; font-weight: 600; color: #E8637A; flex-shrink: 0; }
.nav-action-disabled { color: #C8C4BC; }

/* ── Instruction ── */
.instruction { padding: 24rpx 32rpx 0; }
.instruction-text { font-size: 26rpx; color: #9C9890; line-height: 1.6; }

/* ── Scroll ── */
.scroll { flex: 1; padding: 24rpx 0; }

/* ── Unarchived Item ── */
.unarchived-item {
  margin: 0 32rpx 20rpx; background: white;
  border-radius: 32rpx; padding: 28rpx;
  display: flex; gap: 24rpx; align-items: center;
  box-shadow: 0 4rpx 32rpx rgba(0, 0, 0, 0.07);
}
.unarchived-thumb {
  width: 112rpx; height: 112rpx; background: #F2F0EE;
  border-radius: 20rpx; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; overflow: hidden;
}
.unarchived-thumb-img { width: 100%; height: 100%; }
.unarchived-thumb-icon { font-size: 48rpx; }
.unarchived-info { flex: 1; }
.unarchived-name { font-size: 28rpx; font-weight: 500; color: #1C1A17; margin-bottom: 6rpx; display: block; }
.unarchived-date { font-size: 24rpx; color: #9C9890; display: block; }

/* ── Actions ── */
.unarchived-actions {
  display: flex; flex-direction: column; gap: 12rpx; flex-shrink: 0;
}
.classify-btn {
  background: #FDEEF1;
  border-radius: 999px; padding: 10rpx 24rpx;
}
.classify-btn-text { font-size: 24rpx; font-weight: 600; color: #E8637A; white-space: nowrap; }
.delete-btn {
  background: #FAF9F8;
  border-radius: 999px; padding: 10rpx 24rpx;
}
.delete-btn-text { font-size: 24rpx; font-weight: 500; color: #C0405A; white-space: nowrap; }

/* ── Modals ── */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4); z-index: 2000;
  display: flex; align-items: center; justify-content: center;
}
.modal-content {
  width: 600rpx; background: white; border-radius: 32rpx; padding: 48rpx 40rpx;
}
.modal-title { font-size: 32rpx; font-weight: 600; color: #1C1A17; margin-bottom: 16rpx; display: block; }
.modal-text { font-size: 28rpx; color: #6E6A64; line-height: 1.6; margin-bottom: 40rpx; display: block; }
.modal-actions { display: flex; gap: 20rpx; }
.modal-cancel {
  flex: 1; height: 80rpx; background: #F2F0EE;
  border-radius: 999px; display: flex; align-items: center; justify-content: center;
}
.modal-cancel-text { font-size: 28rpx; font-weight: 500; color: #6E6A64; }
.modal-confirm {
  flex: 1; height: 80rpx; background: #E8637A;
  border-radius: 999px; display: flex; align-items: center; justify-content: center;
}
.modal-confirm-danger { background: #E8637A; }
.modal-confirm-text { font-size: 28rpx; font-weight: 600; color: white; }
</style>
