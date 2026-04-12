<template>
  <view class="page">
    <!-- NavBar -->
    <NavBar title="报告详情" theme="dark">
      <template #right>
        <view class="nav-more" @tap="showActionMenu = true">
          <text class="nav-more-icon">⋯</text>
        </view>
      </template>
    </NavBar>

    <!-- Scrollable Content -->
    <scroll-view scroll-y class="scroll">
      <!-- Loading State -->
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中…</text>
      </view>

      <!-- Error State -->
      <view v-else-if="loadError" class="error-state">
        <text class="error-icon">⚠️</text>
        <text class="error-text">{{ loadError }}</text>
        <view class="error-retry" @tap="loadReport">
          <text class="error-retry-text">重试</text>
        </view>
      </view>

      <!-- Content -->
      <template v-else>
      <!-- Image Area -->
      <view class="detail-img-area" @tap="previewImage">
        <image
          v-if="currentImageUrl"
          :src="currentImageUrl"
          mode="aspectFit"
          class="detail-img-real"
        />
        <text v-else class="detail-img-icon">{{ getTypeInfo(report.report_type).icon }}</text>
        <view v-if="currentImageUrl" class="detail-img-hint">
          <text class="detail-img-hint-text">点击查看大图</text>
        </view>
        <view v-if="report.file_urls && report.file_urls.length > 1" class="detail-img-overlay">
          <text class="detail-img-overlay-text">{{ currentImageIdx + 1 }} / {{ report.file_urls.length }} 张</text>
        </view>
      </view>

      <!-- Info Card -->
      <view class="detail-info-card">
        <!-- Edit Mode: Type Grid -->
        <view v-if="isEditing" class="edit-type-section">
          <text class="detail-field-label">报告类型</text>
          <view class="edit-type-grid">
            <view
              v-for="(t, idx) in typeOptions"
              :key="idx"
              class="edit-type-option"
              :class="{ 'edit-type-selected': editForm.report_type === t.key }"
              @tap="editForm.report_type = t.key"
            >
              <text class="edit-type-icon">{{ t.icon }}</text>
              <text class="edit-type-label" :class="{ 'edit-type-label-active': editForm.report_type === t.key }">{{ t.label }}</text>
            </view>
          </view>
        </view>
        <!-- View Mode: Type Badge -->
        <view v-else class="detail-info-header">
          <text class="type-badge" :class="getTypeInfo(report.report_type).typeClass">{{ getTypeInfo(report.report_type).label }}</text>
          <text class="detail-type-big">{{ report.report_name || getTypeInfo(report.report_type).label }}</text>
        </view>
        <view class="detail-info-grid">
          <view class="detail-field">
            <text class="detail-field-label">检查日期</text>
            <text v-if="!isEditing" class="detail-field-value">{{ formatDateDisplay(report.report_date) }}</text>
            <picker v-else mode="date" :value="editForm.report_date" @change="e => editForm.report_date = e.detail.value">
              <text class="detail-field-value editing">{{ editForm.report_date || '选择日期' }}</text>
            </picker>
          </view>
          <view class="detail-field">
            <text class="detail-field-label">当时孕周</text>
            <text v-if="!isEditing" class="detail-field-value" :class="{ 'detail-field-empty': !report.week_of_pregnancy }">
              {{ report.week_of_pregnancy ? `孕 ${report.week_of_pregnancy} 周` : '未记录' }}
            </text>
            <input v-else class="detail-edit-input" v-model="editForm.week_of_pregnancy" type="number" placeholder="孕周" />
          </view>
          <view class="detail-field">
            <text class="detail-field-label">就诊医院</text>
            <text v-if="!isEditing" class="detail-field-value" :class="{ 'detail-field-empty': !report.hospital }">
              {{ report.hospital || '未记录' }}
            </text>
            <input v-else class="detail-edit-input" v-model="editForm.hospital" placeholder="医院" />
          </view>
          <view class="detail-field">
            <text class="detail-field-label">上传时间</text>
            <text class="detail-field-value">{{ formatTimestamp(report.create_time) }}</text>
          </view>
        </view>
        <view v-if="report.notes" class="detail-notes">
          <text class="detail-field-label">备注</text>
          <text class="detail-notes-text">{{ report.notes }}</text>
        </view>
        <view v-if="isEditing" class="detail-notes">
          <text class="detail-field-label">备注</text>
          <input class="detail-edit-input" v-model="editForm.notes" placeholder="添加备注" />
        </view>

        <!-- Edit Actions -->
        <view v-if="isEditing" class="edit-actions">
          <view class="edit-cancel-btn" @tap="cancelEdit">
            <text class="edit-cancel-text">取消</text>
          </view>
          <view class="edit-save-btn" @tap="saveEdit">
            <text class="edit-save-text">保存</text>
          </view>
        </view>
      </view>

      <!-- AI Entry Card -->
      <view class="ai-entry-card" :class="aiCardClass" @tap="onAiCardTap">
        <view class="ai-entry-icon">
          <text class="ai-entry-icon-text">{{ aiCardIcon }}</text>
        </view>
        <view class="ai-entry-text">
          <text class="ai-entry-title">{{ aiCardTitle }}</text>
          <text class="ai-entry-sub">{{ aiCardSub }}</text>
        </view>
        <text class="ai-entry-arrow">›</text>
      </view>

      <!-- Action Row -->
      <view v-if="!isEditing" class="action-row">
        <view class="action-btn" @tap="onShare">
          <text class="action-btn-text">📤 分享</text>
        </view>
        <view class="action-btn" @tap="startEdit">
          <text class="action-btn-text">✏️ 编辑</text>
        </view>
        <view class="action-btn action-btn-danger" @tap="onDelete">
          <text class="action-btn-text action-btn-danger-text">🗑 删除</text>
        </view>
      </view>
      </template>
    </scroll-view>

    <!-- Action Menu Popup -->
    <view v-if="showActionMenu" class="overlay" @tap="showActionMenu = false">
      <view class="overlay-spacer"></view>
    </view>
    <view v-if="showActionMenu" class="action-menu">
      <view class="menu-item" @tap="onDownload">
        <text class="menu-item-text">下载原图</text>
      </view>
      <view class="menu-item menu-item-danger" @tap="onDelete">
        <text class="menu-item-text menu-item-danger-text">删除报告</text>
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
import { onLoad } from '@dcloudio/uni-app'
import NavBar from '@/components/NavBar.vue'
import { useReportStore, REPORT_TYPES, getTypeInfo } from '@/stores/report'

const reportStore = useReportStore()
const typeOptions = REPORT_TYPES

const report = ref({})
const reportId = ref('')
const currentImageIdx = ref(0)
const isEditing = ref(false)
const showActionMenu = ref(false)
const showDeleteConfirm = ref(false)
const editForm = ref({})
const loading = ref(true)
const loadError = ref('')

const currentImageUrl = computed(() => {
  const urls = report.value.file_urls
  if (urls && urls.length > 0) return urls[currentImageIdx.value]
  return ''
})

const aiStatus = computed(() => report.value.ai_status || 'pending')

const aiCardClass = computed(() => {
  switch (aiStatus.value) {
    case 'done': return 'ai-card-done'
    case 'processing': return 'ai-card-processing'
    case 'failed': return 'ai-card-failed'
    default: return ''
  }
})

const aiCardIcon = computed(() => {
  switch (aiStatus.value) {
    case 'done': return '✅'
    case 'processing': return '⏳'
    case 'failed': return '🔄'
    default: return '✦'
  }
})

const aiCardTitle = computed(() => {
  switch (aiStatus.value) {
    case 'done': return '查看 AI 解读'
    case 'processing': return 'AI 解读中…'
    case 'failed': return '解读失败，点击重试'
    default: return '开始 AI 解读'
  }
})

const aiCardSub = computed(() => {
  const result = report.value.ai_result
  if (aiStatus.value === 'done' && result) {
    const abnormal = result.abnormal_indicators || []
    if (abnormal.length > 0) return `已解读 · 发现 ${abnormal.length} 项指标异常`
    return '已解读 · 整体正常'
  }
  if (aiStatus.value === 'processing') return '正在分析报告内容…'
  if (aiStatus.value === 'failed') return '点击重新触发 AI 解读'
  return '点击开始智能解读'
})

onLoad(async (options) => {
  if (options.id) {
    reportId.value = options.id
    // 先尝试从 store 的缓存中获取
    const cachedReport = reportStore.reports.find(r => r._id === options.id)
    if (cachedReport) {
      report.value = cachedReport
      loading.value = false
    }
    // 无论是否有缓存，都从数据库刷新最新数据
    await loadReport()
  }
})

async function loadReport() {
  loading.value = true
  loadError.value = ''
  try {
    const db = uniCloud.database()
    const res = await db.collection('momcare_reports').doc(reportId.value).get()
    if (res.result && res.result.data && res.result.data[0]) {
      report.value = res.result.data[0]
      loading.value = false
    } else {
      loadError.value = '报告不存在'
      loading.value = false
    }
  } catch (e) {
    console.error('loadReport error:', e)
    loadError.value = '加载失败，请稍后重试'
    loading.value = false
  }
}

function previewImage() {
  const urls = report.value.file_urls
  if (!urls || urls.length === 0) return
  uni.previewImage({
    current: urls[currentImageIdx.value],
    urls: urls
  })
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function formatTimestamp(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  if (isNaN(d.getTime())) return '-'
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function startEdit() {
  isEditing.value = true
  editForm.value = {
    report_type: report.value.report_type,
    report_name: report.value.report_name,
    report_date: report.value.report_date,
    week_of_pregnancy: report.value.week_of_pregnancy || '',
    hospital: report.value.hospital || '',
    notes: report.value.notes || ''
  }
}

function cancelEdit() {
  isEditing.value = false
  editForm.value = {}
}

async function saveEdit() {
  const typeInfo = getTypeInfo(editForm.value.report_type)
  const ok = await reportStore.updateReport(reportId.value, {
    report_type: editForm.value.report_type,
    report_name: typeInfo.label,
    report_date: editForm.value.report_date,
    week_of_pregnancy: editForm.value.week_of_pregnancy ? Number(editForm.value.week_of_pregnancy) : null,
    hospital: editForm.value.hospital,
    notes: editForm.value.notes
  })
  if (ok) {
    await loadReport()
    isEditing.value = false
    uni.showToast({ title: '已保存', icon: 'none' })
  }
}

async function onAiCardTap() {
  if (aiStatus.value === 'done') {
    uni.navigateTo({ url: `/pages/archives/ai-result?id=${reportId.value}` })
  } else if (aiStatus.value === 'failed' || aiStatus.value === 'pending') {
    uni.showLoading({ title: '开始解读…' })
    await reportStore.triggerAiPipeline(reportId.value)
    await loadReport()
    uni.hideLoading()
    if (report.value.ai_status === 'done') {
      uni.navigateTo({ url: `/pages/archives/ai-result?id=${reportId.value}` })
    }
  }
}

function onShare() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

function onDownload() {
  showActionMenu.value = false
  if (currentImageUrl.value) {
    uni.downloadFile({
      url: currentImageUrl.value,
      success: (res) => {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => uni.showToast({ title: '已保存到相册', icon: 'none' }),
          fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
        })
      }
    })
  }
}

function onDelete() {
  showActionMenu.value = false
  showDeleteConfirm.value = true
}

async function doDelete() {
  showDeleteConfirm.value = false
  const ok = await reportStore.deleteReport(reportId.value)
  if (ok) {
    uni.showToast({ title: '已删除', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1000)
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

.nav-more {
  width: 68rpx; height: 68rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.nav-more-icon { font-size: 32rpx; color: white; }

.scroll { flex: 1; }

/* ── Loading & Error States ── */
.loading-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 0 80rpx;
}
.loading-text { font-size: 28rpx; color: #9C9890; }

.error-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 0 80rpx;
}
.error-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.error-text { font-size: 28rpx; color: #9C9890; margin-bottom: 32rpx; text-align: center; }
.error-retry {
  padding: 16rpx 48rpx; background: #E8637A;
  border-radius: 999px;
}
.error-retry-text { font-size: 28rpx; font-weight: 600; color: white; }

/* ── Detail Image Area ── */
.detail-img-area {
  background: linear-gradient(145deg, #F2F0EE 0%, #E4E1DC 100%);
  height: 480rpx;
  display: flex; align-items: center; justify-content: center;
  position: relative; flex-shrink: 0;
}
.detail-img-real { width: 100%; height: 480rpx; }
.detail-img-icon { font-size: 144rpx; opacity: 0.6; }
.detail-img-hint {
  position: absolute; bottom: 20rpx; right: 20rpx;
  background: rgba(0, 0, 0, 0.5); border-radius: 999px; padding: 6rpx 20rpx;
}
.detail-img-hint-text { font-size: 22rpx; color: white; }
.detail-img-overlay {
  position: absolute; bottom: 24rpx; left: 24rpx;
  background: rgba(232, 99, 122, 0.85); border-radius: 999px; padding: 8rpx 20rpx;
}
.detail-img-overlay-text { font-size: 22rpx; color: white; }

/* ── Info Card ── */
.detail-info-card {
  margin: 28rpx 32rpx; background: white;
  border-radius: 32rpx; padding: 32rpx;
  box-shadow: 0 4rpx 32rpx rgba(0, 0, 0, 0.07);
}
.detail-info-header {
  display: flex; align-items: center; gap: 16rpx;
  margin-bottom: 28rpx; padding-bottom: 24rpx;
  border-bottom: 1px solid #F2F0EE;
}
.type-badge { font-size: 26rpx; font-weight: 600; padding: 6rpx 20rpx; border-radius: 999px; }
.type-blood { background: #FDEEF1; color: #C0405A; }
.type-ultrasound { background: #EBF3FE; color: #2A6FCC; }
.type-urine { background: #E6F7F4; color: #1A7A68; }
.type-screen { background: #F0ECFB; color: #5A40A8; }
.type-sugar { background: #FEF4E3; color: #8C5A10; }
.type-other { background: #F2F0EE; color: #6E6A64; }

.detail-type-big { font-size: 32rpx; font-weight: 600; color: #1C1A17; }
.detail-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24rpx; }
.detail-field-label { font-size: 22rpx; color: #9C9890; margin-bottom: 6rpx; display: block; }
.detail-field-value { font-size: 28rpx; font-weight: 500; color: #3A3834; }
.detail-field-empty { font-size: 26rpx; color: #BDBDBD; font-weight: 400; }
.editing { color: #E8637A; }
.detail-edit-input {
  font-size: 28rpx; color: #3A3834;
  border-bottom: 1px solid #E4E1DC; padding: 4rpx 0;
}
.detail-notes { margin-top: 24rpx; }
.detail-notes-text { font-size: 26rpx; color: #6E6A64; margin-top: 8rpx; display: block; line-height: 1.5; }
.edit-actions { display: flex; gap: 20rpx; margin-top: 32rpx; }
.edit-cancel-btn {
  flex: 1; height: 72rpx; background: #F2F0EE;
  border-radius: 999px; display: flex; align-items: center; justify-content: center;
}
.edit-cancel-text { font-size: 26rpx; font-weight: 500; color: #6E6A64; }
.edit-save-btn {
  flex: 2; height: 72rpx; background: #E8637A;
  border-radius: 999px; display: flex; align-items: center; justify-content: center;
}
.edit-save-text { font-size: 26rpx; font-weight: 600; color: white; }

/* ── Edit Type Grid ── */
.edit-type-section {
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1px solid #F2F0EE;
}
.edit-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 16rpx;
}
.edit-type-option {
  padding: 16rpx 12rpx;
  border-radius: 20rpx;
  background: #F2F0EE;
  border: 4rpx solid transparent;
  text-align: center;
}
.edit-type-selected {
  border-color: #E8637A;
  background: #FDEEF1;
}
.edit-type-icon {
  font-size: 32rpx;
  display: block;
  margin-bottom: 4rpx;
}
.edit-type-label {
  font-size: 22rpx;
  font-weight: 500;
  color: #6E6A64;
  display: block;
}
.edit-type-label-active { color: #C0405A; }

/* ── AI Entry Card ── */
.ai-entry-card {
  margin: 0 32rpx 28rpx;
  background: linear-gradient(135deg, #E8637A 0%, #E8527A 100%);
  border-radius: 32rpx; padding: 32rpx;
  display: flex; align-items: center; gap: 28rpx;
  box-shadow: 0 8rpx 40rpx rgba(232, 99, 122, 0.3);
}
.ai-card-done { background: linear-gradient(135deg, #5BBF7C 0%, #4AAF6C 100%); }
.ai-card-failed { background: linear-gradient(135deg, #F0A940 0%, #E09830 100%); }
.ai-card-processing { opacity: 0.8; }
.ai-entry-icon {
  width: 88rpx; height: 88rpx;
  background: rgba(255, 255, 255, 0.2); border-radius: 24rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ai-entry-icon-text { font-size: 44rpx; color: white; }
.ai-entry-text { flex: 1; }
.ai-entry-title { font-size: 30rpx; font-weight: 600; color: white; margin-bottom: 4rpx; display: block; }
.ai-entry-sub { font-size: 24rpx; color: rgba(255, 255, 255, 0.7); }
.ai-entry-arrow { font-size: 32rpx; color: rgba(255, 255, 255, 0.8); flex-shrink: 0; }

/* ── Action Row ── */
.action-row { display: flex; gap: 16rpx; padding: 0 32rpx 40rpx; }
.action-btn {
  flex: 1; height: 80rpx; background: white;
  border: 2rpx solid #E4E1DC; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
}
.action-btn-text { font-size: 26rpx; font-weight: 500; color: #6E6A64; }
.action-btn-danger { border-color: #F2F0EE; }
.action-btn-danger-text { color: #E8637A; }

/* ── Action Menu ── */
.overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.35); z-index: 1000;
}
.overlay-spacer { flex: 1; }
.action-menu {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: white; border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx; z-index: 1001;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}
.menu-item {
  padding: 24rpx 0; border-bottom: 1px solid #F2F0EE;
}
.menu-item-text { font-size: 28rpx; color: #3A3834; }
.menu-item-danger-text { color: #E8637A; }

/* ── Delete Confirm Modal ── */
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
  flex: 1; height: 80rpx; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
}
.modal-confirm-danger { background: #E8637A; }
.modal-confirm-text { font-size: 28rpx; font-weight: 600; color: white; }
</style>
