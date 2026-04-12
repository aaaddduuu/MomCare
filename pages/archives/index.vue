<template>
  <view class="page">
    <!-- NavBar -->
    <NavBar title="产检档案" :showBack="false" />

    <!-- Loading State -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中…</text>
    </view>

    <!-- Error State -->
    <view v-else-if="loadError" class="error-state">
      <text class="error-icon">⚠️</text>
      <text class="error-title">{{ loadError }}</text>
      <text class="error-hint">可能是数据库配额已用完，请稍后重试</text>
      <view class="error-retry" @tap="retryLoad">
        <text class="error-retry-text">重新加载</text>
      </view>
    </view>

    <!-- Empty State (no reports at all) -->
    <view v-else-if="reportStore.reports.length === 0" class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-title">还没有产检报告</text>
      <text class="empty-hint">点击右上角 + 上传第一份报告吧</text>
    </view>

    <!-- Has Reports -->
    <template v-else>
      <!-- Search & Filter Row -->
      <view class="search-row">
        <view class="search-box-wrap">
          <text class="search-icon">🔍</text>
          <input
            class="search-box"
            placeholder="搜索报告类型、日期…"
            placeholder-class="search-placeholder"
            :value="searchKeyword"
            @input="onSearchInput"
          />
          <text v-if="searchKeyword" class="search-clear" @tap="clearSearch">✕</text>
        </view>
        <view class="filter-btn" :class="{ 'filter-btn-active': reportStore.hasActiveFilter }" @tap="showFilterSheet = true">
          <text class="filter-text" :class="{ 'filter-text-active': reportStore.hasActiveFilter }">
            筛选 {{ reportStore.activeFilterCount > 0 ? '①'.repeat(reportStore.activeFilterCount) : '▾' }}
          </text>
        </view>
      </view>

      <!-- Horizontal Tabs -->
      <view class="tabs-wrap">
        <scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
          <view class="tabs">
            <view
              v-for="(tab, idx) in tabDefs"
              :key="idx"
              class="tab"
              :class="{ active: reportStore.currentFilter.tab === tab.key }"
              @tap="onTabTap(tab.key)"
            >
              <text class="tab-label" :class="{ 'tab-label-active': reportStore.currentFilter.tab === tab.key }">{{ tab.name }}</text>
              <text
                v-if="reportStore.tabCounts[idx]"
                class="tab-count"
                :class="{ 'tab-count-active': reportStore.currentFilter.tab === tab.key }"
              >{{ reportStore.tabCounts[idx] }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Scrollable List -->
      <scroll-view scroll-y class="scroll">
        <!-- Unarchived Banner -->
        <view v-if="reportStore.unarchivedReports.length > 0" class="unarchived-banner" @tap="onBannerTap">
          <view class="banner-dot"></view>
          <text class="banner-text"><text class="banner-strong">{{ reportStore.unarchivedReports.length }} 份报告</text>待分类，点击整理</text>
          <text class="banner-arrow">›</text>
        </view>

        <!-- Search No Results -->
        <view v-if="reportStore.filteredReports.length === 0 && reportStore.reports.length > 0" class="search-empty">
          <text class="search-empty-text">没有找到相关报告</text>
          <view class="search-empty-btn" @tap="clearSearch">
            <text class="search-empty-btn-text">清除搜索</text>
          </view>
        </view>

        <!-- Grouped Report Cards -->
        <template v-for="(group, gIdx) in reportStore.groupedReports" :key="gIdx">
          <view class="section-header">
            <text class="section-header-text">{{ group.month }}</text>
          </view>
          <view
            v-for="(report) in group.reports"
            :key="report._id"
            class="report-card"
            @tap="onReportTap(report)"
          >
            <view class="report-thumb">
              <image v-if="report.file_urls && report.file_urls[0]" :src="report.file_urls[0]" mode="aspectFill" class="report-thumb-img" />
              <text v-else class="report-thumb-icon">{{ getTypeInfo(report.report_type).icon }}</text>
            </view>
            <view class="report-info">
              <view class="report-top">
                <text class="type-badge" :class="getTypeInfo(report.report_type).typeClass">{{ getTypeInfo(report.report_type).label }}</text>
                <text class="report-date">{{ formatDateShort(report.report_date) }}</text>
              </view>
              <text class="report-title">{{ report.report_name || getTypeInfo(report.report_type).label }}</text>
              <view class="report-meta">
                <text v-if="report.week_of_pregnancy" class="report-meta-text">孕 {{ report.week_of_pregnancy }} 周</text>
                <text class="ai-tag" :class="report.ai_status === 'done' ? 'done' : 'pending'">
                  {{ report.ai_status === 'done' ? '✦ 已解读' : '未解读' }}
                </text>
              </view>
            </view>
          </view>
        </template>
      </scroll-view>
    </template>

    <!-- Upload Sheet -->
    <UploadSheet v-model:show="showUploadSheet" @select="onUploadSelect" />

    <!-- FAB Button -->
    <view class="fab-btn" @tap="showUploadSheet = true">
      <text class="fab-icon">+</text>
    </view>

    <!-- Filter Overlay -->
    <view v-if="showFilterSheet" class="overlay" @tap="showFilterSheet = false">
      <view class="overlay-spacer"></view>
      <view class="filter-sheet" @tap.stop>
        <view class="sheet-handle"></view>
        <text class="filter-sheet-title">筛选条件</text>

        <!-- Week Range -->
        <view class="filter-section">
          <text class="filter-section-label">孕周范围</text>
          <view class="week-range-row">
            <text class="week-label">孕 {{ filterWeekMin }} 周</text>
            <view class="week-slider-wrap">
              <slider
                :min="1" :max="40" :value="filterWeekMin"
                activeColor="#E8637A" backgroundColor="#F2F0EE"
                block-size="20"
                @change="e => filterWeekMin = e.detail.value"
              />
            </view>
            <text class="week-label">孕 {{ filterWeekMax }} 周</text>
          </view>
          <view class="week-range-row">
            <text class="week-label">至</text>
            <view class="week-slider-wrap">
              <slider
                :min="1" :max="40" :value="filterWeekMax"
                activeColor="#E8637A" backgroundColor="#F2F0EE"
                block-size="20"
                @change="e => filterWeekMax = e.detail.value"
              />
            </view>
            <text class="week-label"></text>
          </view>
        </view>

        <!-- Time Range -->
        <view class="filter-section">
          <text class="filter-section-label">时间范围</text>
          <view class="time-range-options">
            <view
              v-for="opt in timeRangeOptions"
              :key="opt.value"
              class="time-opt"
              :class="{ 'time-opt-active': filterTimeRange === opt.value }"
              @tap="filterTimeRange = opt.value"
            >
              <text class="time-opt-text" :class="{ 'time-opt-text-active': filterTimeRange === opt.value }">{{ opt.label }}</text>
            </view>
          </view>
        </view>

        <!-- Filter Actions -->
        <view class="filter-actions">
          <view class="filter-reset" @tap="resetFilter">
            <text class="filter-reset-text">重置</text>
          </view>
          <view class="filter-confirm" @tap="applyFilter">
            <text class="filter-confirm-text">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import UploadSheet from './components/UploadSheet.vue'
import NavBar from '@/components/NavBar.vue'
import { useReportStore, TAB_DEFS, getTypeInfo } from '@/stores/report'

const reportStore = useReportStore()
const tabDefs = TAB_DEFS

const showUploadSheet = ref(false)
const showFilterSheet = ref(false)
const loading = ref(true)
const searchKeyword = ref('')
const loadError = ref('')
const lastLoadTime = ref(0)
const LOAD_COOLDOWN = 2000 // 2秒冷却时间

// Filter state
const filterWeekMin = ref(1)
const filterWeekMax = ref(40)
const filterTimeRange = ref(null)

const timeRangeOptions = [
  { label: '近 1 个月', value: '1m' },
  { label: '近 3 个月', value: '3m' },
  { label: '近 6 个月', value: '6m' },
  { label: '全部', value: null }
]

let searchTimer = null

onMounted(async () => {
  await loadData()
})

onShow(async () => {
  // 检查是否需要刷新（AI 解读后会设置标志）
  if (reportStore.listNeedsRefresh) {
    reportStore.listNeedsRefresh = false
    await loadData()
    return
  }

  // 只在数据为空时重新加载，避免频繁查询
  if (reportStore.reports.length === 0 && reportStore.unarchivedReports.length === 0) {
    await loadData()
  }
})

async function loadData() {
  // 防止频繁查询
  const now = Date.now()
  if (now - lastLoadTime.value < LOAD_COOLDOWN) {
    console.log('Load cooldown active, skipping')
    return
  }
  lastLoadTime.value = now

  loading.value = true
  loadError.value = ''
  try {
    await Promise.all([
      reportStore.fetchReports(),
      reportStore.fetchUnarchivedReports()
    ])
    loading.value = false
  } catch (e) {
    console.error('loadData error:', e)
    // 如果有缓存数据，不显示错误，让用户看到缓存的内容
    if (reportStore.reports.length > 0 || reportStore.unarchivedReports.length > 0) {
      // 有缓存数据，不设置错误状态
      console.log('Using cached data due to fetch error')
    } else {
      // 没有缓存数据，显示错误
      loadError.value = '本地数据库配额已用完，请稍后重试或切换到云端空间'
    }
    loading.value = false
  }
}

function retryLoad() {
  // 重置冷却时间并重新加载
  lastLoadTime.value = 0
  loadData()
}

function onTabTap(key) {
  reportStore.setFilter({ tab: key })
}

function onSearchInput(e) {
  const val = e.detail.value
  searchKeyword.value = val
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    reportStore.setFilter({ keyword: val })
  }, 300)
}

function clearSearch() {
  searchKeyword.value = ''
  reportStore.setFilter({ keyword: '' })
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}/${day}`
}

function onBannerTap() {
  uni.navigateTo({ url: '/pages/archives/unarchived' })
}

function onReportTap(report) {
  uni.navigateTo({ url: `/pages/archives/detail?id=${report._id}` })
}

function onUploadSelect(result) {
  if (result.fileCount === 1) {
    uni.navigateTo({ url: '/pages/archives/classify?source=p2' })
  } else {
    uni.navigateTo({ url: '/pages/archives/batch?source=p2' })
  }
}

function applyFilter() {
  const wr = (filterWeekMin.value > 1 || filterWeekMax.value < 40)
    ? { min: filterWeekMin.value, max: filterWeekMax.value }
    : null
  reportStore.setFilter({
    weekRange: wr,
    timeRange: filterTimeRange.value
  })
  showFilterSheet.value = false
}

function resetFilter() {
  filterWeekMin.value = 1
  filterWeekMax.value = 40
  filterTimeRange.value = null
  reportStore.resetFilter()
  showFilterSheet.value = false
}
</script>

<style scoped lang="scss">
/* ── CSS Variables from Prototype ── */
page {
  --rose: #E8637A;
  --rose-light: #FDEEF1;
  --rose-mid: #F5B8C4;
  --rose-dark: #C0405A;
  --teal-light: #E6F7F4;
  --amber: #F0A940;
  --amber-light: #FEF4E3;
  --purple-light: #F0ECFB;
  --blue-light: #EBF3FE;
  --green-light: #EAF7EF;
  --green: #5BBF7C;
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
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.10);
}

.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #FAF9F8;
  font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
  box-sizing: border-box;
}

/* ── Loading State ── */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 80rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #9C9890;
}

/* ── Error State ── */
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 80rpx;
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.error-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #3A3834;
  margin-bottom: 12rpx;
}

.error-hint {
  font-size: 26rpx;
  color: #9C9890;
  margin-bottom: 32rpx;
  text-align: center;
}

.error-retry {
  padding: 16rpx 48rpx;
  background: #E8637A;
  border-radius: 999px;
}

.error-retry-text {
  font-size: 28rpx;
  font-weight: 600;
  color: white;
}

/* ── Empty State ── */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 80rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #3A3834;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #9C9890;
}

/* ── Nav Action Button ── */
.nav-action {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: #E8637A;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(232, 99, 122, 0.35);
}

.nav-action-icon {
  font-size: 40rpx;
  font-weight: 300;
  color: white;
  line-height: 1;
}

/* ── Search Row ── */
.search-row {
  background: white;
  display: flex;
  padding: 20rpx 32rpx;
  gap: 16rpx;
  flex-shrink: 0;
}

.search-box-wrap {
  flex: 1;
  height: 72rpx;
  background: #F2F0EE;
  border-radius: 999px;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  gap: 12rpx;
}

.search-icon {
  font-size: 24rpx;
  flex-shrink: 0;
}

.search-box {
  flex: 1;
  height: 72rpx;
  font-size: 26rpx;
  color: #3A3834;
  background: transparent;
}

.search-placeholder {
  color: #C8C4BC;
  font-size: 26rpx;
}

.search-clear {
  font-size: 24rpx;
  color: #9C9890;
  padding: 8rpx;
}

.filter-btn {
  height: 72rpx;
  padding: 0 24rpx;
  background: #F2F0EE;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-btn-active {
  background: #FDEEF1;
}

.filter-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #6E6A64;
}

.filter-text-active {
  color: #E8637A;
}

/* ── Tabs ── */
.tabs-wrap {
  background: white;
  border-bottom: 1px solid #F2F0EE;
  flex-shrink: 0;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs {
  display: inline-flex;
  padding: 0 32rpx;
}

.tab {
  display: inline-flex;
  align-items: center;
  padding: 20rpx 28rpx;
  gap: 10rpx;
  border-bottom: 4rpx solid transparent;
}

.tab.active {
  border-bottom-color: #E8637A;
}

.tab-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #9C9890;
  white-space: nowrap;
}

.tab-label-active {
  color: #E8637A;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36rpx;
  height: 36rpx;
  font-size: 20rpx;
  font-weight: 600;
  background: #FDEEF1;
  color: #C0405A;
  padding: 0 10rpx;
  border-radius: 999px;
  line-height: 1;
  /* 确保不同长度数字都有合适的宽度 */
  box-sizing: border-box;
}

.tab-count-active {
  background: #E8637A;
  color: white;
}

/* ── Scroll ── */
.scroll {
  flex: 1;
  padding-bottom: 180rpx;
  padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
}

/* ── Search Empty ── */
.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.search-empty-text {
  font-size: 28rpx;
  color: #9C9890;
  margin-bottom: 24rpx;
}

.search-empty-btn {
  padding: 12rpx 32rpx;
  background: #F2F0EE;
  border-radius: 999px;
}

.search-empty-btn-text {
  font-size: 26rpx;
  color: #6E6A64;
}

/* ── Unarchived Banner ── */
.unarchived-banner {
  margin: 24rpx 32rpx 0;
  background: #FEF4E3;
  border: 1px solid #F5D38A;
  border-radius: 20rpx;
  padding: 20rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.banner-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #F0A940;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.banner-text {
  flex: 1;
  font-size: 26rpx;
  color: #8C6A1A;
}

.banner-strong {
  font-weight: 600;
}

.banner-arrow {
  font-size: 24rpx;
  color: #A07820;
}

/* ── Section Header ── */
.section-header {
  padding: 32rpx 32rpx 12rpx;
}

.section-header-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #9C9890;
  letter-spacing: 0.06em;
}

/* ── Report Card ── */
.report-card {
  margin: 0 32rpx 20rpx;
  background: white;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 4rpx 32rpx rgba(0, 0, 0, 0.07);
}

.report-thumb {
  width: 112rpx;
  height: 112rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  background: #F2F0EE;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-thumb-icon {
  font-size: 44rpx;
}

.report-thumb-img {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.report-info {
  flex: 1;
  min-width: 0;
}

.report-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 6rpx;
}

.type-badge {
  font-size: 22rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 999px;
}

.report-date {
  font-size: 24rpx;
  color: #9C9890;
  margin-left: auto;
  flex-shrink: 0;
}

.report-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1C1A17;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.report-meta-text {
  font-size: 24rpx;
  color: #9C9890;
}

.ai-tag {
  font-size: 22rpx;
  font-weight: 500;
  padding: 4rpx 14rpx;
  border-radius: 999px;
}

.ai-tag.done {
  background: #EAF7EF;
  color: #2D8A50;
}

.ai-tag.pending {
  background: #F2F0EE;
  color: #9C9890;
}

/* ── Type Badge Colors ── */
.type-blood { background: #FDEEF1; color: #C0405A; }
.type-ultrasound { background: #EBF3FE; color: #2A6FCC; }
.type-urine { background: #E6F7F4; color: #1A7A68; }
.type-screen { background: #F0ECFB; color: #5A40A8; }
.type-sugar { background: #FEF4E3; color: #8C5A10; }
.type-other { background: #F2F0EE; color: #6E6A64; }

/* ── Filter Overlay ── */
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

.filter-sheet {
  background: white;
  border-radius: 56rpx 56rpx 0 0;
  padding: 40rpx 40rpx 64rpx;
}

.sheet-handle {
  width: 72rpx;
  height: 8rpx;
  background: #E4E1DC;
  border-radius: 4rpx;
  margin: 0 auto 40rpx;
}

.filter-sheet-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1C1A17;
  margin-bottom: 32rpx;
  display: block;
}

.filter-section {
  margin-bottom: 32rpx;
}

.filter-section-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #9C9890;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 16rpx;
  display: block;
}

.week-range-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.week-label {
  font-size: 24rpx;
  color: #6E6A64;
  width: 100rpx;
  flex-shrink: 0;
}

.week-slider-wrap {
  flex: 1;
}

.time-range-options {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.time-opt {
  padding: 14rpx 28rpx;
  background: #F2F0EE;
  border-radius: 999px;
}

.time-opt-active {
  background: #FDEEF1;
}

.time-opt-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #6E6A64;
}

.time-opt-text-active {
  color: #E8637A;
}

.filter-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.filter-reset {
  flex: 1;
  height: 80rpx;
  background: #F2F0EE;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-reset-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #6E6A64;
}

.filter-confirm {
  flex: 2;
  height: 80rpx;
  background: #E8637A;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-confirm-text {
  font-size: 28rpx;
  font-weight: 600;
  color: white;
}

/* ── FAB Button ── */
.fab-btn {
  position: fixed;
  right: 32rpx;
  bottom: 160rpx;
  bottom: calc(160rpx + env(safe-area-inset-bottom));
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #E8637A;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(232, 99, 122, 0.4);
  z-index: 100;
}

.fab-icon {
  font-size: 48rpx;
  font-weight: 300;
  color: white;
  line-height: 1;
  transform: translateY(-2rpx);
}
</style>
